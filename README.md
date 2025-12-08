# NPS Satisfaction Survey - Vue.js

A modern and responsive web application for NPS (Net Promoter Score) satisfaction surveys built with Vue.js 3 and a mobile-first design approach.

## 📋 Features

- **Dynamic question system** loaded from JSON configuration
- **Multiple question types**: NPS (0-10), Likert scale, multiple choice, and text
- **Conditional questions** based on student category (A, B, AB)
- **Responsive design** optimized for mobile devices
- **Modern interface** with smooth slide transitions and visual feedback
- **Real-time form validation**
- **Token-based authentication** via URL parameter
- **n8n integration** for data submission via backend proxy
- **Accessibility** with keyboard navigation support
- **Customizable branding** (logo, colors, company name)

## 🚀 Getting Started

### 1. Installation

```bash
# Clone or download the files
# Navigate to the project folder
cd nps-modelo

# Install dependencies
npm install
```

### 2. Integrated Backend Configuration

This project combines frontend and backend into a single Node.js server. Configure the `.env` file so the server knows where to forward `/api/pesquisa` and `/api/validate-token` to n8n, keeping the API key secure.

```bash
NPS_SURVEY_WEBHOOK_URL=https://your-n8n-instance.com/webhook/survey
NPS_VALIDATION_WEBHOOK_URL=https://your-n8n-instance.com/webhook/validate
NPS_API_KEY=your-secret-api-key
NPS_API_KEY_HEADER=x-api-key
```

The frontend will continue calling `/api/pesquisa` and `/api/validate-token`; the server will handle forwarding requests to n8n webhooks with the correct headers.

### Tokens

- The token used to open the survey must come from the URL (query string `?token=...` or the last segment). This ensures each student uses the unique token provided by the driving school.
- The fallback in `NPS_DEFAULT_TOKEN` exists only for local manual testing and should be left blank in production. Avoid putting a real value there in public commits or builds.

## ⚠️ Common Errors

- `NPS_VALIDATION_WEBHOOK_URL missing on server`: means the `.env` file is missing `NPS_VALIDATION_WEBHOOK_URL`. Add this value so the server knows which n8n webhook to forward validation to.
- `NPS_SURVEY_WEBHOOK_URL missing on server`: provide the submission URL (`/EnviarPesquisa`).

### 3. Running the Project

```bash
# Development mode (frontend + backend together)
npm run dev

# Build production version (uses Vite)
npm run build

# Run integrated server with generated build
npm run start
```

The application will be available at `http://localhost:3000` (or the port defined by `PORT`).

## 📊 Data Structure Sent to n8n

The application sends a structured JSON with the following fields:

```json
{
  "timestamp": "2025-11-14T10:30:00.000Z",
  "autoescola": "Driving School Name",
  "nps_score": 9,
  "overall_satisfaction": "satisfied",
  "reception_service": "totally_satisfied",
  "theory_classes": "satisfied",
  "practical_classes": "satisfied",
  "practical_instructor": "totally_satisfied",
  "vehicle_conditions": "satisfied",
  "infrastructure": "neutral",
  "dislikes": ["Time to start practical classes"],
  "likes": ["Quality of practical classes", "Professionalism of instructors"],
  "comments": "Optional user comments"
}
```

### Possible values for Likert scales:
- `totally_dissatisfied`
- `dissatisfied`
- `neutral`
- `satisfied`
- `totally_satisfied`

## 📱 Mobile Features

- **Responsive layout** that adapts to any screen size
- **Touch-optimized components** with appropriate touch areas
- **Scalable fonts and spacing**
- **Smooth navigation** with fluid scrolling
- **Visual feedback** for all interactions

## 🎨 Customization

### Questions Configuration

Edit `src/config/questions.json` to customize survey questions:

```json
{
  "version": "1.0",
  "categories": {
    "car": { "label": "Carro", "description": "Aulas práticas de carro" },
    "moto": { "label": "Moto", "description": "Aulas práticas de moto" }
  },
  "questions": [
    {
      "key": "npsScore",
      "question": "De 0 a 10, quanto você indicaria nossa autoescola?",
      "type": "nps",
      "required": true,
      "order": 1
    },
    {
      "key": "overallSatisfaction",
      "question": "Como você avalia sua satisfação geral?",
      "type": "likert",
      "required": true,
      "order": 2
    }
    // ... more questions
  ]
}
```

**Supported question types:**
- `nps` - Net Promoter Score (0-10 scale)
- `likert` - 5-point satisfaction scale
- `multiple` - Multiple choice with checkboxes
- `text` - Free text input

**Conditional questions** (show based on student category):
```json
{
  "key": "practicalCarClasses",
  "conditional": true,
  "showIf": { "studentCategory": ["B", "AB"] }
}
```

See [DYNAMIC_QUESTIONS.md](DYNAMIC_QUESTIONS.md) for detailed documentation.

### Colors and Theme

Edit `src/style.css` to customize:
```css
:root {
  /* Primary colors */
  --primary-color: #3b82f6;
  --primary-dark: #2563eb;
  
  /* Background gradient */
  --bg-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
```

### Company Branding

Set environment variables in `.env`:
```bash
NPS_AUTOESCOLA_NAME=Your Driving School Name
NPS_AUTOESCOLA_LOGO_URL=/logo.png
NPS_AUTOESCOLA_SHOW_LOGO=true
```

Or edit `src/config/n8n.js` directly.

## 🔧 Project Structure

```
nps-modelo/
├── src/
│   ├── components/
│   │   ├── NPSSurvey.vue      # Main survey component
│   │   ├── LikertScale.vue    # Likert scale (1-5)
│   │   ├── MultipleChoice.vue # Multiple choice selection
│   │   ├── Alert.vue          # Alert/notification component
│   │   ├── NAButton.vue       # Not Applicable button
│   │   └── Spinner.vue        # Loading spinner
│   ├── config/
│   │   ├── questions.json     # Survey questions configuration
│   │   ├── questionsHelper.js # Question processing utilities
│   │   └── n8n.js            # Backend API integration
│   ├── assets/                # Images and static assets
│   ├── style.css             # Global styles and CSS variables
│   ├── App.vue               # Root component
│   └── main.js               # Entry point
├── server/
│   └── index.js              # Express server (proxy to n8n)
├── public/                   # Public static files
├── Dockerfile                # Docker image configuration
├── docker-compose.yml        # Docker Compose configuration
├── vite.config.js           # Vite build configuration
├── tailwind.config.js       # Tailwind CSS configuration
└── package.json             # Dependencies and scripts
```

## 🌐 n8n Integration

The integrated Node.js server exposes `/api/pesquisa` and `/api/validate-token` and forwards all requests to n8n webhooks, adding the appropriate `x-api-key` header and ensuring the token and other metadata are sent in the request body.

### Recommended Flow

```
Frontend → Protected backend proxy → n8n Webhook
```

In n8n, the workflow can be the same as before:

1. Webhook (POST) to `/webhook/survey`
2. JSON Parser (optional)
3. Processing (database, spreadsheets, notifications, etc.)

The backend is responsible for translating the JSON received from the frontend to the payload expected by n8n and for forwarding the `token` in the payload so the webhook can mark the survey as submitted.

## 🐳 Docker Deployment

### Quick Start with Docker Hub

The easiest way to deploy is using the pre-built Docker image:

```bash
# Pull the image
docker pull marcoscdoni/nps-modelo:latest

# Run with environment variables
docker run -d \
  -p 3000:3000 \
  --env-file .env \
  --name nps-modelo \
  marcoscdoni/nps-modelo:latest
```

### Using Docker Compose (Recommended)

1. Create `.env` file with your configuration
2. Run: `docker compose up -d`

The `docker-compose.yml` is already configured to use the Docker Hub image.

### Building Locally

```bash
# Build image
docker build -t marcoscdoni/nps-modelo:latest .

# Run container
docker compose up -d
```

### Deployment Guides

- **Hetzner VPS**: See [DEPLOY-HETZNER.md](DEPLOY-HETZNER.md) for complete setup guide
- **Quick Commands**: See [QUICK-DEPLOY.md](QUICK-DEPLOY.md) for common tasks
- **Docker Hub**: See [DOCKER-HUB.md](DOCKER-HUB.md) for publishing new versions

### Update Application

```bash
docker compose pull && docker compose up -d
```

## 📋 TODO / Future Improvements

- [ ] Add optional email validation
- [ ] Implement offline mode with later sync
- [ ] Add form abandonment analytics
- [ ] Multi-language support (i18n)
- [ ] CSV data export
- [ ] Results dashboard with charts
- [ ] Google Analytics integration
- [ ] A/B testing for questions
- [ ] Export questions configuration UI
- [ ] API for dynamic question loading
- [ ] Survey completion webhooks
- [ ] Custom question types (rating stars, sliders)

## 🤝 Contributing

Feel free to contribute with improvements:
1. Fork the project
2. Create a branch for your feature
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is under the MIT license. See the LICENSE file for more details.

---

**Developed with ❤️ to improve customer experience at driving schools**