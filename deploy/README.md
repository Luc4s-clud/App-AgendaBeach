# Deploy – A Beach Arena

## 1. Backend (systemd)

Para manter o backend rodando na VPS:

### Copiar o arquivo de serviço

```bash
sudo cp /var/www/abeach/deploy/abeach-backend.service /etc/systemd/system/
```

### Ativar o serviço

```bash
sudo systemctl daemon-reload
sudo systemctl enable abeach-backend
sudo systemctl start abeach-backend
```

### Comandos úteis

```bash
sudo systemctl status abeach-backend   # Ver status
sudo systemctl restart abeach-backend # Reiniciar
sudo journalctl -u abeach-backend -f  # Ver logs em tempo real
```

### Conferir caminho do Node

Se der erro de "node not found", use o caminho correto:

```bash
which node
```

Edite o serviço e ajuste a linha `ExecStart` com o caminho retornado.

---

## 2. Frontend (build + nginx)

### 2.1. Configurar .env do frontend

```bash
cp /var/www/abeach/apps/frontend/.env.example /var/www/abeach/apps/frontend/.env
```

Para produção com nginx no mesmo domínio, o `.env` deve ter:

```
VITE_API_URL="/api"
```

### 2.2. Fazer o build

```bash
cd /var/www/abeach
npm run build:frontend
```

O build será gerado em `apps/frontend/dist/`.

### 2.3. Configurar Nginx

1. Edite o arquivo de configuração e substitua `SEU_DOMINIO` pelo seu domínio ou IP:

```bash
sudo cp /var/www/abeach/deploy/nginx-abeach.conf /etc/nginx/sites-available/abeach
sudo nano /etc/nginx/sites-available/abeach
```

Na linha `server_name SEU_DOMINIO;` use o domínio (ex: `abeach.com.br`) ou o IP da VPS.

2. Ative o site e recarregue o nginx:

```bash
sudo ln -sf /etc/nginx/sites-available/abeach /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 2.4. Após alterações no frontend

Sempre que atualizar o código do frontend:

```bash
cd /var/www/abeach
npm run build:frontend
```
