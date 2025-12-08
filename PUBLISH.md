# 🚀 Publicar no Docker Hub - Comandos Rápidos

## Login no Docker Hub
```bash
docker login
```

## Build e Push (Versão Simples)
```bash
# Build
docker build -t marcoscdoni/nps-modelo:latest .

# Push
docker push marcoscdoni/nps-modelo:latest
```

## Build e Push com Versionamento (Recomendado)
```bash
# Defina a versão
VERSION=v1.0.0

# Build com múltiplas tags
docker build -t marcoscdoni/nps-modelo:latest -t marcoscdoni/nps-modelo:$VERSION .

# Push ambas as tags
docker push marcoscdoni/nps-modelo:latest
docker push marcoscdoni/nps-modelo:$VERSION
```

## Comando All-in-One
```bash
VERSION=v1.0.0 && \
docker build -t marcoscdoni/nps-modelo:latest -t marcoscdoni/nps-modelo:$VERSION . && \
docker push marcoscdoni/nps-modelo:latest && \
docker push marcoscdoni/nps-modelo:$VERSION
```

---

## 📦 Atualizar na VPS (após publicar)

```bash
# SSH na VPS
ssh user@your-vps-ip

# Navegar para o diretório
cd ~/nps-modelo

# Atualizar (pull + restart)
docker compose pull && docker compose up -d

# Ver logs
docker compose logs -f
```

## Comando SSH direto
```bash
ssh user@your-vps-ip "cd ~/nps-modelo && docker compose pull && docker compose up -d"
```

---

## 🔍 Verificar Imagem no Docker Hub

Após fazer push, verifique em:
https://hub.docker.com/r/marcoscdoni/nps-modelo/tags

---

## 📝 Checklist de Publicação

- [ ] Código testado localmente
- [ ] Build da imagem sem erros
- [ ] Login no Docker Hub feito
- [ ] Push concluído com sucesso
- [ ] Imagem visível no Docker Hub
- [ ] Pull e restart na VPS
- [ ] Aplicação funcionando em produção
