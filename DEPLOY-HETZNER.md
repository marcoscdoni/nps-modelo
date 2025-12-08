# Deploy on Hetzner VPS

Complete guide to deploy the NPS application on Hetzner using Docker Hub.

## 📋 Prerequisites

- Hetzner VPS already created and running
- SSH access to the server
- Docker Hub image published: `marcoscdoni/nps-modelo:latest`

## 🚀 Step-by-Step Deployment

### 1. Connect to VPS via SSH

```bash
ssh root@your-server-ip
```

Or if you have a custom user:
```bash
ssh username@your-server-ip
```

### 2. Update System and Install Docker

```bash
# Update packages
apt update && apt upgrade -y

# Install dependencies
apt install -y apt-transport-https ca-certificates curl software-properties-common

# Add Docker GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | apt-key add -

# Add Docker repository
add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"

# Install Docker
apt update
apt install -y docker-ce docker-ce-cli containerd.io

# Install Docker Compose
apt install -y docker-compose-plugin

# Verify installation
docker --version
docker compose version
```

### 3. Create Project Directory

```bash
mkdir -p ~/nps-modelo
cd ~/nps-modelo
```

### 4. Create Environment File

```bash
nano .env
```

Add your environment variables:
```env
NPS_API_KEY_HEADER=x-api-key
NPS_API_KEY=WnILyK16zL8WH6hi3vSL587QvC3TyaUR
NPS_DEFAULT_TOKEN=27A71581-FBE9-4D65-88D2-3A99DC4199AB
NPS_SURVEY_WEBHOOK_URL=https://n8n.vempramodelo.com/webhook/nps-modelo/EnviarPesquisa
NPS_VALIDATION_WEBHOOK_URL=https://n8n.vempramodelo.com/webhook/link-aluno/GetDadosProcesso
```

Save and exit: `Ctrl + X`, then `Y`, then `Enter`

### 5. Create docker-compose.yml

```bash
nano docker-compose.yml
```

Add the following content:
```yaml
version: '3.8'

services:
  nps-survey:
    image: marcoscdoni/nps-modelo:latest
    container_name: nps-modelo
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - NPS_SURVEY_WEBHOOK_URL=${NPS_SURVEY_WEBHOOK_URL}
      - NPS_VALIDATION_WEBHOOK_URL=${NPS_VALIDATION_WEBHOOK_URL}
      - NPS_API_KEY=${NPS_API_KEY}
      - NPS_API_KEY_HEADER=${NPS_API_KEY_HEADER:-x-api-key}
      - NPS_DEFAULT_TOKEN=${NPS_DEFAULT_TOKEN}
    env_file:
      - .env
    networks:
      - nps-network

networks:
  nps-network:
    driver: bridge
```

Save and exit: `Ctrl + X`, then `Y`, then `Enter`

### 6. Pull Image and Start Container

```bash
# Pull the image from Docker Hub
docker compose pull

# Start the container in background
docker compose up -d

# View logs
docker compose logs -f
```

### 7. Verify Application

```bash
# Check container status
docker compose ps

# Test locally
curl http://localhost:3000

# View logs
docker compose logs --tail=50
```

### 8. Configure Firewall (UFW)

```bash
# Install UFW if not installed
apt install -y ufw

# Allow SSH (important!)
ufw allow 22/tcp

# Allow HTTP
ufw allow 80/tcp

# Allow HTTPS
ufw allow 443/tcp

# Allow app port (if accessing directly)
ufw allow 3000/tcp

# Enable firewall
ufw enable

# Check status
ufw status
```

## 🌐 Domain and Reverse Proxy (Optional but Recommended)

### Install and Configure Nginx

```bash
# Install Nginx
apt install -y nginx

# Create Nginx configuration
nano /etc/nginx/sites-available/nps-modelo
```

Add the following configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the site:
```bash
# Create symbolic link
ln -s /etc/nginx/sites-available/nps-modelo /etc/nginx/sites-enabled/

# Test Nginx configuration
nginx -t

# Restart Nginx
systemctl restart nginx
```

### Install SSL Certificate with Let's Encrypt

```bash
# Install Certbot
apt install -y certbot python3-certbot-nginx

# Obtain certificate
certbot --nginx -d your-domain.com -d www.your-domain.com

# Test auto-renewal
certbot renew --dry-run
```

## 🔄 Update Application

When a new version is available:

```bash
cd ~/nps-modelo

# Pull new image
docker compose pull

# Restart with new image
docker compose up -d

# View logs
docker compose logs -f
```

**Single command:**
```bash
cd ~/nps-modelo && docker compose pull && docker compose up -d && docker compose logs --tail=50
```

## 📊 Monitoring and Maintenance

### View Logs

```bash
# Real-time logs
docker compose logs -f

# Last 100 lines
docker compose logs --tail=100

# Logs from specific time
docker compose logs --since 30m
```

### Restart Application

```bash
docker compose restart
```

### Stop Application

```bash
docker compose down
```

### Check Resource Usage

```bash
# Container stats
docker stats

# System resources
htop

# Disk usage
df -h
docker system df
```

### Clean Old Images

```bash
# Remove unused images
docker image prune -a

# Complete cleanup
docker system prune -a
```

## 🔐 Security Best Practices

1. **Change default SSH port:**
```bash
nano /etc/ssh/sshd_config
# Change Port 22 to Port 2222
systemctl restart sshd
```

2. **Disable root login via SSH:**
```bash
nano /etc/ssh/sshd_config
# Set PermitRootLogin no
systemctl restart sshd
```

3. **Create a sudo user:**
```bash
adduser marcos
usermod -aG sudo marcos
usermod -aG docker marcos
```

4. **Install fail2ban:**
```bash
apt install -y fail2ban
systemctl enable fail2ban
systemctl start fail2ban
```

5. **Regular updates:**
```bash
apt update && apt upgrade -y
```

## 🛠️ Troubleshooting

### Container won't start

```bash
# Check logs
docker compose logs

# Check if port is in use
netstat -tulpn | grep 3000

# Check environment variables
docker compose config
```

### Can't connect to application

```bash
# Check if container is running
docker compose ps

# Check firewall
ufw status

# Check Nginx (if using)
nginx -t
systemctl status nginx

# Test locally
curl http://localhost:3000
```

### Out of disk space

```bash
# Check disk usage
df -h
docker system df

# Clean Docker
docker system prune -a
docker volume prune
```

## 📝 Useful Commands

```bash
# SSH to server
ssh root@your-server-ip

# Navigate to project
cd ~/nps-modelo

# Check status
docker compose ps

# View logs
docker compose logs -f

# Restart
docker compose restart

# Update
docker compose pull && docker compose up -d

# Stop
docker compose down

# Start
docker compose up -d
```

## 🔗 Access Points

After deployment, your application will be available at:

- Direct access: `http://your-server-ip:3000`
- With domain: `http://your-domain.com`
- With SSL: `https://your-domain.com`

## 📞 Support

If you encounter issues:
1. Check logs: `docker compose logs`
2. Verify environment variables: `docker compose config`
3. Check container status: `docker compose ps`
4. Review this documentation
5. Check Docker Hub for image updates
