<template>
	<div class="min-h-screen bg-gradient-to-br relative overflow-x-hidden">
		<!-- Loading Overlay Modal (aparece por cima de tudo) -->
		<div v-if="isSubmitting" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
			<div class="bg-white rounded-2xl p-8 mx-4 max-w-sm w-full text-center shadow-2xl animate-scale-in">
				<div class="animate-spin w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-6"></div>
				<h2 class="text-2xl font-bold text-gray-800 mb-4">Processando...</h2>
				<p class="text-gray-600">Aguarde enquanto salvamos sua pesquisa no sistema.</p>
				<div class="mt-6 flex justify-center">
					<div class="flex space-x-1">
						<div class="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
						<div class="w-2 h-2 bg-green-500 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
						<div class="w-2 h-2 bg-green-500 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
					</div>
				</div>
			</div>
		</div>

	<div class="container mx-auto px-4 py-8 max-w-2xl pb-20">
			<!-- Header -->
	    <div class="text-center mb-8 animate-fade-in">
										<div class="mb-2">
											<img :src="logoSvg" alt="Logo" class="h-12 mx-auto mb-2" />
											<div class="text-center">
												<div class="text-xl font-semibold text-white leading-tight mb-1">Pesquisa de satisfação</div>
												<p class="text-blue-100 opacity-90 leading-relaxed">Sua opinião é muito importante para nós! Este questionário leva apenas 3 minutos.</p>
											</div>
										</div>
					<!-- token info / validation messages -->
					<p v-if="tokenState.status === 'ready' && tokenState.data && tokenState.data.tokenStatus === 'valid'" class="text-sm text-white mt-2">Respondendo pesquisa como: <strong>{{ tokenState.data.name }}</strong></p>
				</div>

			<!-- Progress Bar -->
			<div v-if="hasValidToken" class="mb-8">
				<div class="flex justify-between items-center mb-2">
					<span class="text-blue-100 text-sm">{{ currentStep > totalSteps ? 'Pesquisa enviada' : 'Progresso' }}</span>
					<span class="text-blue-100 text-sm">{{ currentStep > totalSteps ? '✓ Concluída' : `${currentStep} de ${totalSteps}` }}</span>
				</div>
				<div class="progress-bar"><div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div></div>
			</div>

			<!-- Welcome -->
			<div v-if="currentStep === 0" class="card text-center animate-slide-in-right mb-5">
					<!-- Loading state while token is being validated -->
					<div v-if="tokenState.status === 'loading'" class="py-10 px-6 text-white">
						<div class="flex flex-col items-center gap-5">
							<div class="p-4 rounded-full bg-white/15 shadow-lg shadow-black/30">
								<Spinner size="lg" color="white" />
							</div>
							<div class="space-y-3 text-center max-w-xl mx-auto">
								<h2 class="text-3xl font-bold">Estamos preparando sua avaliação</h2>
								<p class="text-blue-100 text-base">Estamos confirmando suas credenciais e carregando o questionário personalizado para você. Isso costuma levar apenas alguns segundos.</p>
							</div>
						</div>
					</div>
				<!-- Default welcome content once token é válido -->
				<div v-else>
					<template v-if="tokenState.status === 'ready' && tokenState.data && tokenState.data.tokenStatus !== 'valid'">
						<div class="py-10 px-6 text-white">
							<div class="flex flex-col items-center gap-5 max-w-xl mx-auto">
								<div class="w-16 h-16 rounded-full bg-red-500/15 flex items-center justify-center text-red-200">
									<svg class="w-9 h-9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
										<path d="M12 8v4" />
										<path d="M12 16h.01" />
										<path d="M10.29 3.86L1.82 18a1 1 0 00.86 1.5h18.64a1 1 0 00.86-1.5L12.71 3.86a1 1 0 00-1.72 0z" />
									</svg>
								</div>
								<div class="space-y-3 text-center">
									<h2 class="text-2xl font-bold text-white">{{ isTokenUsed ? 'Pesquisa já respondida' : 'Link inválido' }}</h2>
									<p class="text-base text-blue-100">{{ tokenErrorMessage }}</p>
									<p v-if="!isTokenUsed" class="text-sm text-blue-200">Se precisar, solicite um novo link ao suporte da autoescola.</p>
								</div>
							</div>
						</div>
					</template>
					<template v-else-if="tokenState.status === 'error'">
						<div class="py-10 px-6 text-white">
							<div class="flex flex-col items-center gap-5 max-w-xl mx-auto">
								<div class="w-16 h-16 rounded-full bg-yellow-500/15 flex items-center justify-center text-yellow-200">
									<svg class="w-9 h-9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
										<path d="M12 8v4" />
										<path d="M12 16h.01" />
										<path d="M10.29 3.86L1.82 18a1 1 0 00.86 1.5h18.64a1 1 0 00.86-1.5L12.71 3.86a1 1 0 00-1.72 0z" />
									</svg>
								</div>
								<div class="space-y-3 text-center">
									<h2 class="text-2xl font-bold text-white">Não foi possível validar seu acesso</h2>
									<p class="text-base text-blue-100">{{ tokenState.error || 'Erro ao validar token. Tente novamente em instantes.' }}</p>
								</div>
							</div>
						</div>
					</template>
					<template v-else>
						<div class="text-6xl mb-6">🎯</div>
						<h2 class="text-3xl font-bold text-gray-800 mb-4">{{ welcomeTitle }}</h2>
						<p class="text-gray-600 text-lg mb-6 leading-relaxed">Vamos começar nossa pesquisa de satisfação. Suas respostas nos ajudam a melhorar nossos serviços continuamente.</p>
						<p class="text-sm text-red-500 mb-8">* Indica uma pergunta obrigatória</p>
					</template>
				</div>
					<!-- Button availability depends on token validation -->
				<div v-if="tokenState.status !== 'loading'" class="mt-6">
						<!-- only show start button when token is valid (or idle for local dev) -->
						<button v-if="isTokenValidForStart" @click="nextStep" class="btn-primary">Começar Pesquisa</button>
					</div>
				</div>

			<!-- Question Steps -->
			<div v-if="hasValidToken" class="transition-container">
				<transition :name="slideDirection === 'forward' ? 'slide-left' : 'slide-right'">
					<div v-if="currentStep > 0 && questions && currentStep <= questions.length" :key="currentStep" class="card mb-5" ref="cardRef">
					<div class="mb-6">
						<div class="flex items-center justify-between mb-4">
							<span class="text-sm font-semibold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">Pergunta {{ currentStep }}</span>
							<span class="text-sm text-gray-500">{{ getQuestionType(currentQuestion.type) }}</span>
						</div>
						<h2 class="text-xl md:text-2xl font-bold text-gray-800 leading-tight">{{ currentQuestion.question }} <span v-if="currentQuestion.required" class="text-red-500">*</span></h2>
						<p v-if="currentQuestion.description" class="text-gray-600 mt-2">{{ currentQuestion.description }}</p>
					</div>

					<!-- Content -->
					<div class="mb-8">
						<div v-if="currentQuestion.type === 'nps'" class="space-y-4">
							<div class="flex justify-between text-sm text-gray-500 mb-4"><span>0 = De jeito nenhum</span><span>10 = Com toda certeza</span></div>
							<div class="flex flex-wrap justify-center gap-2 md:gap-3">
								<button v-for="n in 11" :key="n-1" @click="setAnswer(n-1)"
									:class="[
										'w-12 h-12 md:w-16 md:h-16 rounded-full font-bold text-xl transition-all duration-300 transform hover:scale-110',
										formData[currentQuestion.key] === n-1 ? 'bg-green-500 text-white shadow-lg scale-110' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
									]">
									{{ n-1 }}
								</button>
							</div>
						</div>

												<div v-else-if="currentQuestion.type === 'likert'">
													<LikertScale :model-value="formData[currentQuestion.key]" @update:model-value="setAnswer($event)" />
												</div>

						<MultipleChoice v-else-if="currentQuestion.type === 'multiple'" :model-value="formData[currentQuestion.key]" :options="currentQuestion.options" @update:model-value="setAnswer($event)" />

						<div v-else-if="currentQuestion.type === 'text'">
							<textarea :value="formData[currentQuestion.key]" @input="setAnswer($event.target.value)" class="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-300 resize-none text-gray-800" rows="6" :placeholder="currentQuestion.placeholder || 'Escreva sua resposta aqui...'"></textarea>
						</div>
					</div>

								<!-- error banner: use dark translucent red so it matches the dark card and text stays visible -->
								<div v-if="stepError" class="mb-6 p-4 rounded-lg" style="background: rgba(220,38,38,0.12); border: 1px solid rgba(220,38,38,0.25);">
									<p style="color: #ffecec; font-size: 0.9rem; margin: 0">{{ stepError }}</p>
								</div>

				<div class="flex justify-between items-center">
					<button v-if="currentStep > 1" @click="previousStep" :disabled="isSubmitting" class="btn-secondary flex items-center gap-2">
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg> Voltar
					</button>
					<div v-else></div>
					<div class="flex gap-2 items-center">
						<button v-if="currentStep === questions.length && isDev" @click="testSubmit" :disabled="isSubmitting" class="btn-secondary text-sm">
							🧪 Teste
						</button>
						<button @click="nextStep" :disabled="isSubmitting" class="btn-primary flex items-center gap-2">{{ currentStep === questions.length ? 'Finalizar' : 'Próxima' }}
							<svg v-if="currentStep < questions.length" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
						</button>
					</div>
				</div>
				</div>
			</transition>
		</div>

			<!-- Thank you / loading / error screens -->
			<div v-if="currentStep > questions.length && !isSubmitting" class="card text-center animate-slide-in-right mb-5">
				<div class="text-6xl mb-6">🎉</div>
				<h2 class="text-3xl font-bold text-gray-800 mb-4">{{ thankYouTitle }}</h2>
				<p class="text-gray-600 text-lg mb-8 leading-relaxed">Sua pesquisa foi enviada com sucesso. Suas respostas são muito importantes para nós!</p>
			</div>

			<!-- submission modal handled as popup (see script) -->


						<div v-if="submitError" class="card text-center mb-5"><div class="text-6xl mb-6">❌</div><h2 class="text-3xl font-bold text-red-600 mb-4">Erro ao Enviar</h2><p class="text-gray-600 text-lg mb-8">{{ submitError }}</p><button @click="retrySubmit" class="btn-primary mr-4">Tentar Novamente</button><button @click="resetSurvey" class="btn-secondary">Recomeçar</button></div>



			<!-- footer logo removed per request -->

		</div>
	</div>
</template>

<script>
import { ref, reactive, computed, watch, nextTick, onMounted } from 'vue'
import LikertScale from './LikertScale.vue'
import MultipleChoice from './MultipleChoice.vue'
import NAButton from './NAButton.vue'
import Spinner from './Spinner.vue'
import Alert from './Alert.vue'
import { submitToN8n, config, validateTokenWithBackend } from '../config/n8n.js'
import { loadQuestions, getInitialFormData, getInitialNAFlags, getQuestionTypeLabel, validateQuestion as validateQuestionHelper, shouldShowQuestion } from '../config/questionsHelper.js'
import logoSvg from '../assets/logo.svg'

export default {
	name: 'NPSSurvey',
		components: { LikertScale, MultipleChoice, NAButton, Spinner, Alert },
	setup() {
		const currentStep = ref(0)
		const slideDirection = ref('forward')
		// token state for validation flow
		const tokenState = reactive({ status: 'idle', token: null, data: null, error: '' })
		const isSubmitting = ref(false)
		const submitError = ref('')
		const stepError = ref('')

		// Load questions from JSON configuration
		const questionsConfig = loadQuestions()
		const allQuestions = questionsConfig.questions
		
		// Filter questions based on student category
		const questions = computed(() => {
			return allQuestions.filter(q => shouldShowQuestion(q, tokenState.data))
		})
		
		// Initialize form data dynamically from questions
		const formData = reactive(getInitialFormData())
		
		// Initialize NA flags dynamically (kept for backward compatibility)
		const naFlags = reactive(getInitialNAFlags())

		const totalSteps = computed(() => questions.value.length)
		const currentQuestion = computed(() => {
			if (currentStep.value > 0 && currentStep.value <= questions.value.length) {
				return questions.value[currentStep.value - 1]
			}
			return null
		})
		const progressPercentage = computed(() => Math.round((currentStep.value / (totalSteps.value + 1)) * 100))

		const extractTokenFromUrl = () => {
			const fallbackToken = (import.meta.env.NPS_DEFAULT_TOKEN || '').trim() || null
			if (typeof window === 'undefined') return fallbackToken
			const currentUrl = new URL(window.location.href)
			const queryToken = currentUrl.searchParams.get('token')
			if (queryToken) return queryToken
			const parts = (currentUrl.pathname || '').split('/').filter(Boolean)
			return parts.length ? parts[parts.length - 1] : fallbackToken
		}

		// localStorage persistence helpers
		const STORAGE_KEY_PREFIX = 'nps_survey_'
		
		const getStorageKey = (token) => `${STORAGE_KEY_PREFIX}${token}`
		
		const saveProgress = () => {
			if (!tokenState.token || !hasValidToken.value) return
			
			const progressData = {
				currentStep: currentStep.value,
				formData: { ...formData },
				naFlags: { ...naFlags },
				timestamp: Date.now()
			}
			
			try {
				localStorage.setItem(getStorageKey(tokenState.token), JSON.stringify(progressData))
			} catch (error) {
				console.error('Error saving progress to localStorage:', error)
			}
		}
		
		const loadProgress = () => {
			if (!tokenState.token) return false
			
			try {
				const savedData = localStorage.getItem(getStorageKey(tokenState.token))
				if (!savedData) return false
				
				const progressData = JSON.parse(savedData)
				
				// Check if data is not too old (e.g., 30 days)
				const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000
				if (Date.now() - progressData.timestamp > thirtyDaysInMs) {
					clearProgress()
					return false
				}
				
				// Restore progress
				if (progressData.currentStep !== undefined) {
					currentStep.value = progressData.currentStep
				}
				
				if (progressData.formData) {
					Object.keys(progressData.formData).forEach(key => {
						if (key in formData) {
							formData[key] = progressData.formData[key]
						}
					})
				}
				
				if (progressData.naFlags) {
					Object.keys(progressData.naFlags).forEach(key => {
						if (key in naFlags) {
							naFlags[key] = progressData.naFlags[key]
						}
					})
				}
				
				return true
			} catch (error) {
				console.error('Error loading progress from localStorage:', error)
				return false
			}
		}
		
		const clearProgress = () => {
			if (!tokenState.token) return
			
			try {
				localStorage.removeItem(getStorageKey(tokenState.token))
			} catch (error) {
				console.error('Error clearing progress from localStorage:', error)
			}
		}

	onMounted(async () => {
		const token = extractTokenFromUrl()
		const isProduction = import.meta.env.PROD
		
		// Em produção, se não houver token, exibe erro
		if (!token) {
			if (isProduction) {
				tokenState.status = 'error'
				tokenState.error = 'Link inválido. Token de acesso não fornecido.'
			}
			return
		}
		
		tokenState.status = 'loading'
		tokenState.token = token
		try {
			const result = await validateTokenWithBackend(token)
			if (result.success) {
				// backend may return an array or object
				const student = Array.isArray(result.data) ? result.data[0] : result.data
				tokenState.data = student || null
				tokenState.status = student ? 'ready' : 'error'
				if (!student) tokenState.error = 'Dados do aluno não retornados.'
				
				// Load saved progress if token is valid
				if (student && String(student.tokenStatus || '').toLowerCase() === 'valid') {
					loadProgress()
				}
			} else {
				tokenState.status = 'error'
				tokenState.error = result.error || 'Token inválido'
			}
		} catch (err) {
			tokenState.status = 'error'
			tokenState.error = err.message || String(err)
		}
	})

	const isTokenUsed = computed(() => {
		if (!tokenState.data) return false
		return tokenState.data.tokenUsedAt != null
	})

		const tokenErrorMessage = computed(() => {
			if (isTokenUsed.value) {
				const usedDate = tokenState.data?.tokenUsedAt
				if (usedDate) {
					try {
						// Remove o Z do final para tratar como horário local (já vem em BRT do backend)
						const dateString = String(usedDate).replace('Z', '')
						const date = new Date(dateString)
						const formattedDate = date.toLocaleString('pt-BR', {
							day: '2-digit',
							month: '2-digit',
							year: 'numeric',
							hour: '2-digit',
							minute: '2-digit'
						})
						return `Essa pesquisa já foi respondida em ${formattedDate}`
					} catch (e) {
						return 'Essa pesquisa já foi respondida anteriormente'
					}
				}
				return 'Essa pesquisa já foi respondida anteriormente'
			}
			return tokenState.error || 'Token inativo'
		})

		const welcomeTitle = computed(() => {
			const name = tokenState.data?.name || ''
			if (!name) return 'Bem-vindo!'
			const first = String(name).split(' ')[0] || name
			return `Olá, ${first.charAt(0).toUpperCase() + first.slice(1).toLowerCase()}!`
		})

		const thankYouTitle = computed(() => {
			const name = tokenState.data?.name || ''
			if (!name) return 'Obrigado!'
			const first = String(name).split(' ')[0] || name
			return `Obrigado, ${first.charAt(0).toUpperCase() + first.slice(1).toLowerCase()}!`
		})

		const hasValidToken = computed(() => {
			if (tokenState.status !== 'ready' || !tokenState.data) return false
			return String(tokenState.data.tokenStatus || '').toLowerCase() === 'valid'
		})

		const isTokenValidForStart = computed(() => hasValidToken.value)

		// Use helper function for question type labels
		const getQuestionType = getQuestionTypeLabel

		const setAnswer = (value) => { if (currentQuestion.value) { formData[currentQuestion.value.key] = value; stepError.value = '' } }

				const onNAChange = (key) => {
					if (naFlags[key]) {
						formData[key] = 'not_applicable'
						stepError.value = ''
					} else {
						// clear stored NA marker so user can answer normally
						formData[key] = null
					}
				}

					const toggleNA = (key) => {
						naFlags[key] = !naFlags[key]
						onNAChange(key)
					}

						// watch NA flags to update formData when a flag changes via v-model
					watch(naFlags, (newVal, oldVal) => {
						Object.keys(newVal).forEach(k => {
							if (newVal[k] !== oldVal[k]) {
								onNAChange(k)
							}
						})
						// Save progress when NA flags change
						saveProgress()
					}, { deep: true })
					
					// Watch formData and currentStep to auto-save progress
					watch(formData, () => {
						if (hasValidToken.value && currentStep.value > 0) {
							saveProgress()
						}
					}, { deep: true })
					
					watch(currentStep, () => {
						if (hasValidToken.value && currentStep.value > 0) {
							saveProgress()
						}
					})

						// ref to the currently rendered question card so we can scroll it into view
						const cardRef = ref(null)

								const scrollToCard = () => {
									// ensure the page scrolls all the way to the top whenever navigation occurs
									nextTick(() => {
										try {
											window.scrollTo({ top: 0, behavior: 'smooth' })
										} catch (e) {
											window.scrollTo(0, 0)
										}
									})
								}

		const validateCurrentStep = () => {
			if (!currentQuestion.value) return true
			const question = currentQuestion.value
			const answer = formData[question.key]
			
			// Use the helper validation function
			const validation = validateQuestionHelper(question, answer, naFlags)
			if (!validation.valid) {
				stepError.value = validation.error
				return false
			}
			
			stepError.value = ''
			return true
		}

			const nextStep = async () => {
				if (currentStep.value === 0) { currentStep.value++; scrollToCard(); return }
				if (currentStep.value <= questions.value.length) {
					if (!validateCurrentStep()) return
					if (currentStep.value === questions.value.length) {
						await submitSurvey()
					} else {
						slideDirection.value = 'forward'
						currentStep.value++
						// ensure the newly-rendered question is visible
						scrollToCard()
					}
				}
			}

		const previousStep = () => {
			if (currentStep.value > 1) {
				slideDirection.value = 'backward'
				currentStep.value--
				stepError.value = ''
				scrollToCard()
			}
		}

	const submitSurvey = async () => {
		// Show loading overlay and disable interactions
		isSubmitting.value = true
		submitError.value = ''
		
		try {
			const surveyData = {
				nps_score: formData.npsScore,
				overall_satisfaction: formData.overallSatisfaction,
				reception_service: formData.receptionService,
				theory_classes: formData.theoryClasses,
				practical_car_classes: formData.practicalCarClasses,
				practical_moto_classes: formData.practicalMotoClasses,
				practical_instructor_car: formData.practicalInstructorCar,
				practical_instructor_moto: formData.practicalInstructorMoto,
				vehicle_conditions: formData.vehicleConditions,
				infrastructure: formData.infrastructure,
				dislikes: formData.dislikes,
				likes: formData.likes,
				comments: formData.comments
			}
			// Pass the token as second parameter to submitToN8n
			const result = await submitToN8n(surveyData, tokenState.token)
			// result may carry webhook-level success flag in its payload (handled by submitToN8n)
			if (result.success) {
				currentStep.value++
				clearProgress()
			} else {
				const errorMessage = result.error || (result.data && result.data[0] && result.data[0].message) || 'Erro desconhecido ao enviar a pesquisa.'
				submitError.value = errorMessage
			}
		} catch (error) {
			console.error('Submit error:', error)
			submitError.value = 'Erro de conexão. Verifique sua internet e tente novamente.'
		} finally {
			isSubmitting.value = false
		}
	}

const testSubmit = async () => {
	isSubmitting.value = true
	await new Promise(resolve => setTimeout(resolve, 3000))
	currentStep.value++
	clearProgress()
	isSubmitting.value = false
}

const isDev = import.meta.env.DEV

const retrySubmit = () => { submitError.value = ''; currentStep.value = questions.value.length }
const resetSurvey = () => {
					currentStep.value = 0; isSubmitting.value = false; submitError.value = ''; stepError.value = '';
					Object.keys(formData).forEach(key => { if (Array.isArray(formData[key])) formData[key] = [] ; else formData[key] = key === 'npsScore' ? null : '' })
					// reset NA flags
					Object.keys(naFlags).forEach(k => { naFlags[k] = false })
					// Clear saved progress
					clearProgress()
				}

				return { currentStep, slideDirection, questions, totalSteps, currentQuestion, progressPercentage, formData, isSubmitting, submitError, stepError, config, getQuestionType, setAnswer, onNAChange, naFlags, toggleNA, nextStep, previousStep, submitSurvey, testSubmit, isDev, retrySubmit, resetSurvey, logoSvg, tokenState, welcomeTitle, thankYouTitle, isTokenValidForStart, hasValidToken, isTokenUsed, tokenErrorMessage }
	}
}
</script>

<style scoped>
/* Override .card inherited color for textarea text */
textarea.text-gray-800 {
	color: #1f2937 !important;
}

.card textarea.text-gray-800 {
	color: #1f2937 !important;
}

/* Disabled button styles */
button:disabled {
	opacity: 0.6;
	cursor: not-allowed;
}

/* Loading Modal Animations */
@keyframes scale-in {
	0% { 
		transform: scale(0.9); 
		opacity: 0; 
	}
	100% { 
		transform: scale(1); 
		opacity: 1; 
	}
}

.animate-scale-in {
	animation: scale-in 0.3s ease-out;
}

/* Bounce animation for dots */
@keyframes bounce {
	0%, 80%, 100% {
		transform: translateY(0);
	}
	40% {
		transform: translateY(-8px);
	}
}

.animate-bounce {
	animation: bounce 1.4s infinite;
}

/* Backdrop blur support for older browsers */
.backdrop-blur-sm {
	backdrop-filter: blur(4px);
	-webkit-backdrop-filter: blur(4px);
}

/* Fixed positioning enhancements for mobile */
.fixed.inset-0 {
	position: fixed;
	top: 0;
	right: 0;
	bottom: 0;
	left: 0;
}

/* Transition container */
.transition-container {
	position: relative;
}

/* Slide transitions */
.slide-left-enter-active,
.slide-right-enter-active {
	transition: transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.5s ease;
	will-change: transform, opacity;
	backface-visibility: hidden;
	-webkit-backface-visibility: hidden;
}

.slide-left-leave-active,
.slide-right-leave-active {
	transition: transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.2s ease;
	will-change: transform, opacity;
	backface-visibility: hidden;
	-webkit-backface-visibility: hidden;
}

.slide-left-leave-active,
.slide-right-leave-active {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	box-shadow: none !important;
}

.slide-left-enter-from {
	transform: translateX(100%);
	opacity: 0;
}

.slide-left-enter-to {
	transform: translateX(0);
	opacity: 1;
}

.slide-left-leave-from {
	transform: translateX(0);
	opacity: 1;
}

.slide-left-leave-to {
	transform: translateX(-100%);
	opacity: 0;
}

.slide-right-enter-from {
	transform: translateX(-100%);
	opacity: 0;
}

.slide-right-enter-to {
	transform: translateX(0);
	opacity: 1;
}

.slide-right-leave-from {
	transform: translateX(0);
	opacity: 1;
}

.slide-right-leave-to {
	transform: translateX(100%);
	opacity: 0;
}
</style>
