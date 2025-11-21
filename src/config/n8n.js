// Configuration for the frontend to call our backend proxy.
// Backend endpoints hide the real n8n webhooks and control API key usage.

// Use explicit NPS_* frontend env vars (no legacy VITE_* fallbacks)
const surveyEndpoint = import.meta.env.NPS_BACKEND_SURVEY_URL || '/api/pesquisa'
const validationEndpoint = import.meta.env.NPS_BACKEND_TOKEN_VALIDATION_URL || '/api/validate-token'
const requestHeaders = { 'Content-Type': 'application/json' }

const defaultLogoUrl = new URL('../assets/logo.svg', import.meta.url).href
const autoescolaName = import.meta.env.NPS_AUTOESCOLA_NAME || 'AutoEscola Modelo'
const autoescolaLogoUrl = import.meta.env.NPS_AUTOESCOLA_LOGO_URL || defaultLogoUrl
const autoescolaShowLogo = (() => {
  const envValue = import.meta.env.NPS_AUTOESCOLA_SHOW_LOGO
  if (typeof envValue === 'string') {
    return envValue.toLowerCase() !== 'false'
  }
  return true
})()

export const config = {
  surveyEndpoint,
  validationEndpoint,
  headers: requestHeaders,
  autoescola: {
    name: autoescolaName,
    showLogo: autoescolaShowLogo,
    logoUrl: autoescolaLogoUrl
  }
}

// Helper function to submit survey data through the backend proxy
export const submitToN8n = async (surveyData, token = null) => {
  try {
    // Normalize survey data before sending to backend so n8n / Sheets get predictable columns
    const likertMap = {
      'totally_dissatisfied': 1,
      'dissatisfied': 2,
      'neutral': 3,
      'satisfied': 4,
      'totally_satisfied': 5
    }

    const likesOptions = [
      'Atendimento da equipe',
      'Comunicação clara e transparente',
      'Rapidez no início do curso teórico',
      'Flexibilidade de horários',
      'Qualidade das aulas teóricas',
      'Qualidade das aulas práticas',
      'Profissionalismo dos instrutores',
      'Estado dos veículos',
      'Infraestrutura moderna e limpa',
      'Facilidade no agendamento',
      'Suporte durante todo o processo',
      'Preço justo'
    ]

    const dislikesOptions = [
      'Atendimento da recepção',
      'Demora no retorno de mensagens/ligações',
      'Falta de comunicação sobre prazos',
      'Prazo para início do curso teórico',
      'Prazo para início das aulas práticas',
      'Disponibilidade de horários para aulas práticas',
      'Demora no agendamento das provas',
      'Cancelamento de aulas sem aviso',
      'Didática do instrutor prático',
      'Material didático desatualizado',
      'Condições dos veículos'
    ]

    const slugify = (s) => {
      // Normalize unicode to decompose diacritics, remove combining marks,
      // then replace any non-alphanumeric chars with underscore.
      // This prevents accented letters from being turned into stray underscores
      // (e.g. "início" => "inicio" instead of "in_cio").
      const str = String(s || '')
        const withoutDiacritics = str.normalize ? str.normalize('NFD').replace(/[\u0300-\u036f]/g, '') : str
      return withoutDiacritics
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '')
    }

    const normalizeLikert = (v) => {
      if (v == null || v === '') return null
      if (typeof v === 'number') return v
      const mapped = likertMap[String(v).trim().toLowerCase()]
      if (mapped !== undefined) return mapped
      const n = Number(v)
      return isNaN(n) ? null : n
    }

    const toNpsCategory = (score) => {
      if (score == null || score === '') return null
      const s = Number(score)
      if (isNaN(s)) return null
      if (s >= 9) return 'promoter'
      if (s >= 7) return 'passive'
      return 'detractor'
    }

    const likesArray = Array.isArray(surveyData.likes) ? surveyData.likes : []
    const dislikesArray = Array.isArray(surveyData.dislikes) ? surveyData.dislikes : []

    const normalized = {
      timestamp: new Date().toISOString(),
      autoescola: config.autoescola.name,
      token: token || null,
      nps_score: surveyData.nps_score != null ? Number(surveyData.nps_score) : null,
      nps_category: toNpsCategory(surveyData.nps_score),
      overall_satisfaction: normalizeLikert(surveyData.overall_satisfaction),
      reception_service: normalizeLikert(surveyData.reception_service),
      theory_classes: normalizeLikert(surveyData.theory_classes),
      practical_car_classes: normalizeLikert(surveyData.practical_car_classes),
      practical_moto_classes: normalizeLikert(surveyData.practical_moto_classes),
      practical_instructor_car: normalizeLikert(surveyData.practical_instructor_car),
      practical_instructor_moto: normalizeLikert(surveyData.practical_instructor_moto),
      vehicle_conditions: normalizeLikert(surveyData.vehicle_conditions),
      infrastructure: normalizeLikert(surveyData.infrastructure),
      likes_list: likesArray.join('; '),
      dislikes_list: dislikesArray.join('; '),
      comments: surveyData.comments || ''
    }

    // add one-hot columns for likes/dislikes
    likesOptions.forEach(opt => {
      const key = `like_${slugify(opt)}`
      normalized[key] = likesArray.includes(opt) ? 1 : 0
    })
    dislikesOptions.forEach(opt => {
      const key = `dislike_${slugify(opt)}`
      normalized[key] = dislikesArray.includes(opt) ? 1 : 0
    })

    // preserve original arrays for audit if needed
    normalized._raw_likes = likesArray
    normalized._raw_dislikes = dislikesArray

    // Build relational rows for likes/dislikes so downstream workflows (n8n)
    // can append each like/dislike as its own row in a separate sheet.
    const likesRows = likesArray.map(l => ({
      timestamp: normalized.timestamp,
      token: normalized.token,
      text: l,
      slug: slugify(l)
    }))
    const dislikesRows = dislikesArray.map(d => ({
      timestamp: normalized.timestamp,
      token: normalized.token,
      text: d,
      slug: slugify(d)
    }))

  const payload = { ...normalized, likes_rows: likesRows, dislikes_rows: dislikesRows }

    console.log('Sending normalized survey data through backend proxy:', payload)

    const response = await fetch(config.surveyEndpoint, {
      method: 'POST',
      headers: config.headers,
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    // Try to parse JSON, but some webhooks may respond with empty body
    let result = null
    try {
      result = await response.json()
    } catch (err) {
      // ignore parse errors
      result = null
    }

    console.log('backend response:', result)

    // Some webhooks return an envelope array like [{ success: true, message: '...' }]
    // or an object { success: true, message: '...' }. Inspect the payload and
    // reflect the webhook-reported success status when present.
    let webhookSuccess = true
    let webhookMessage = null
    if (result == null) {
      webhookSuccess = true
    } else if (Array.isArray(result) && result.length > 0 && typeof result[0].success === 'boolean') {
      webhookSuccess = Boolean(result[0].success)
      webhookMessage = result[0].message || null
    } else if (result && typeof result.success === 'boolean') {
      webhookSuccess = Boolean(result.success)
      webhookMessage = result.message || null
    }

    if (!webhookSuccess) {
      return { success: false, error: webhookMessage || 'Webhook responded with failure', data: result }
    }

    return { success: true, data: result, message: webhookMessage }
  } catch (error) {
    console.error('Error submitting to n8n:', error)
    return { success: false, error: error.message }
  }
}

// Validate an incoming token via the backend proxy.
const parseJsonOrRaw = async (response) => {
  const text = await response.text()
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch (error) {
    return { __rawText: text }
  }
}

const isHtmlPayload = (text) => {
  if (!text) return false
  const normalized = text.trim().slice(0, 64)
  return /<!doctype html|<html/i.test(normalized)
}

export const validateTokenWithBackend = async (token) => {
  if (!token) {
    return { success: false, error: 'Token ausente' }
  }

  try {
    const url = `${config.validationEndpoint}?token=${encodeURIComponent(token)}`
    const response = await fetch(url, {
      method: 'GET',
      headers: config.headers
    })

    const payload = await parseJsonOrRaw(response)
    if (!response.ok) {
      const message = payload?.error || payload?.message || payload?.__rawText || `HTTP ${response.status}`
      return { success: false, error: message }
    }

    // If the backend returned an empty body (null payload), treat it as an error.
    if (payload == null) {
      return { success: false, error: 'Acesso inválido. Verifique o link de validação ou contate o suporte.' }
    }

    if (payload && payload.valid === false) {
      return { success: false, error: payload.error || 'Token inválido' }
    }

    // In case the backend returned raw text (HTML, etc), avoid exposing raw variables to the UI.
    if (payload && payload.__rawText) {
      if (isHtmlPayload(payload.__rawText)) {
        return {
          success: false,
          error:
      'A validação está retornando HTML (provavelmente a rota de backend não existe). Verifique `NPS_BACKEND_TOKEN_VALIDATION_URL` e garanta que ela encaminha a `/GetDadosProcesso` do n8n.'
        }
      }
      // Log raw text in dev for troubleshooting but return a generic message to the user
      try {
        if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DEV) {
          console.debug('n8n raw validation response:', payload.__rawText)
        }
      } catch (e) {
        // ignore in environments where import.meta is not available
      }
      return { success: false, error: 'Acesso inválido. Verifique o link de validação ou contate o suporte.' }
    }

    // Return the user/student data (payload can be the object itself)
    return { success: true, data: payload }
  } catch (error) {
    console.error('Error validating token:', error)
    return { success: false, error: error.message }
  }
}