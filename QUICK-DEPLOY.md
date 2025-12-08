# 🚀 Quick Deploy Commands - Hetzner

## First Time Setup

```bash
# 1. Connect to VPS
ssh root@your-server-ip

# 2. Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# 3. Create project directory
mkdir -p ~/nps-modelo && cd ~/nps-modelo

# 4. Create .env file
cat > .env << 'EOF'
NPS_API_KEY_HEADER=x-api-key
NPS_API_KEY=WnILyK16zL8WH6hi3vSL587QvC3TyaUR
NPS_DEFAULT_TOKEN=27A71581-FBE9-4D65-88D2-3A99DC4199AB
NPS_SURVEY_WEBHOOK_URL=https://n8n.vempramodelo.com/webhook/nps-modelo/EnviarPesquisa
NPS_VALIDATION_WEBHOOK_URL=https://n8n.vempramodelo.com/webhook/link-aluno/GetDadosProcesso
EOF

# 5. Download docker-compose.yml
curl -o docker-compose.yml https://raw.githubusercontent.com/marcoscdoni/nps-modelo/main/docker-compose.yml

# 6. Start application
docker compose up -d

# 7. View logs
docker compose logs -f
```

## Update Application

```bash
ssh root@your-server-ip
cd ~/nps-modelo
docker compose pull && docker compose up -d
```

## Common Commands

```bash
# View logs
docker compose logs -f

# Check status
docker compose ps

# Restart
docker compose restart

# Stop
docker compose down

# Start
docker compose up -d

# Clean old images
docker image prune -a
```

## Using Deploy Script

```bash
# Download script
curl -o deploy.sh https://raw.githubusercontent.com/marcoscdoni/nps-modelo/main/deploy.sh
chmod +x deploy.sh

# Interactive menu
./deploy.sh

# Or use commands directly
./deploy.sh update    # Update application
./deploy.sh logs      # View logs
./deploy.sh status    # Check status
./deploy.sh restart   # Restart app
```

## Access Application

- Direct: `http://YOUR_SERVER_IP:3000`
- With domain: `http://your-domain.com`

## Troubleshooting

```bash
# Check if running
docker compose ps

# View errors
docker compose logs --tail=50

# Restart everything
docker compose down && docker compose up -d

# Check connectivity
curl http://localhost:3000
```

---

**Full documentation:** See DEPLOY-HETZNER.md
