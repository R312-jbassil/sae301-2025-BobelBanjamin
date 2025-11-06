# 🗄️ Déploiement PocketBase - Guide Complet

## ❌ Problème actuel

Votre connexion/inscription ne fonctionne pas en production car **PocketBase n'est pas accessible depuis internet**.

Actuellement, PocketBase tourne seulement en local sur `http://127.0.0.1:8090`, ce qui ne marche que sur votre ordinateur.

## ✅ Solution : Déployer PocketBase sur votre VPS

### 📋 Prérequis

- Accès SSH à votre VPS
- PocketBase installé sur le VPS
- Un port ouvert (ex: 8090)

### 🚀 Étape 1 : Installer PocketBase sur le VPS

```bash
# Connectez-vous à votre VPS
ssh votre-utilisateur@votre-vps-ip

# Créez un dossier pour PocketBase
mkdir -p ~/pocketbase
cd ~/pocketbase

# Téléchargez PocketBase (Linux version)
wget https://github.com/pocketbase/pocketbase/releases/download/v0.31.0/pocketbase_0.31.0_linux_amd64.zip

# Décompressez
unzip pocketbase_0.31.0_linux_amd64.zip

# Rendez-le exécutable
chmod +x pocketbase
```

### 📤 Étape 2 : Transférer vos données

```bash
# Sur votre Mac, compressez vos données PocketBase
cd ~/Desktop/sae301-2025-BobelBanjamin/pocketbase
tar -czf pb_data.tar.gz pb_data/

# Transférez sur le VPS
scp pb_data.tar.gz votre-utilisateur@votre-vps-ip:~/pocketbase/

# Sur le VPS, décompressez
ssh votre-utilisateur@votre-vps-ip
cd ~/pocketbase
tar -xzf pb_data.tar.gz
```

### ⚙️ Étape 3 : Configurer PocketBase comme service

Créez un service systemd pour que PocketBase démarre automatiquement:

```bash
# Sur le VPS, créez le fichier de service
sudo nano /etc/systemd/system/pocketbase.service
```

Contenu du fichier:

```ini
[Unit]
Description=PocketBase
After=network.target

[Service]
Type=simple
User=votre-utilisateur
WorkingDirectory=/home/votre-utilisateur/pocketbase
ExecStart=/home/votre-utilisateur/pocketbase/pocketbase serve --http=0.0.0.0:8090
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

```bash
# Activez et démarrez le service
sudo systemctl daemon-reload
sudo systemctl enable pocketbase
sudo systemctl start pocketbase

# Vérifiez le statut
sudo systemctl status pocketbase
```

### 🔥 Étape 4 : Configurer le firewall

```bash
# Ouvrez le port 8090
sudo ufw allow 8090/tcp
sudo ufw reload
```

### 🌐 Étape 5 : Configurer Nginx (recommandé)

Pour sécuriser avec HTTPS, configurez un reverse proxy Nginx:

```bash
sudo nano /etc/nginx/sites-available/pocketbase
```

Contenu:

```nginx
server {
    listen 80;
    server_name pb.sae301.banjamin-bobel.com;  # Sous-domaine pour PocketBase

    location / {
        proxy_pass http://127.0.0.1:8090;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket support (pour l'admin UI)
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

```bash
# Activez la config
sudo ln -s /etc/nginx/sites-available/pocketbase /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Installez un certificat SSL avec Certbot
sudo certbot --nginx -d pb.sae301.banjamin-bobel.com
```

### 🔧 Étape 6 : Mettre à jour votre .env

**Option A : Avec sous-domaine (recommandé)**
```env
PUBLIC_POCKETBASE_URL=https://pb.sae301.banjamin-bobel.com
```

**Option B : Avec port direct (moins sécurisé)**
```env
PUBLIC_POCKETBASE_URL=http://votre-vps-ip:8090
```

### 📝 Étape 7 : Redéployer votre site Astro

```bash
# Sur votre Mac
cd ~/Desktop/sae301-2025-BobelBanjamin

# Assurez-vous que le .env est à jour
git add .env
git commit -m "Update PocketBase URL for production"
git push

# Sur le VPS, mettez à jour le site
ssh votre-utilisateur@votre-vps-ip
cd ~/votre-site
git pull
npm run build
pm2 restart astro
```

## ✅ Vérification

1. **Testez PocketBase directement:**
   - Avec sous-domaine: https://pb.sae301.banjamin-bobel.com/_/
   - Ou avec IP: http://votre-vps-ip:8090/_/

2. **Testez la connexion sur votre site:**
   - Allez sur https://sae301.banjamin-bobel.com/login
   - Essayez de vous connecter

3. **Vérifiez les logs:**
   ```bash
   # Logs PocketBase
   sudo journalctl -u pocketbase -f
   
   # Logs Astro
   pm2 logs astro
   ```

## 🔒 Sécurité (Important!)

1. **Changez le mot de passe admin PocketBase:**
   - Connectez-vous à https://pb.sae301.banjamin-bobel.com/_/
   - Settings → Admins → Changez le mot de passe

2. **Configurez les CORS:**
   - Dans PocketBase Admin: Settings → Application
   - Allowed origins: `https://sae301.banjamin-bobel.com`

3. **Sauvegardez régulièrement:**
   ```bash
   # Script de backup automatique
   0 2 * * * tar -czf ~/backups/pb_data_$(date +\%Y\%m\%d).tar.gz ~/pocketbase/pb_data/
   ```

## 🆘 Dépannage

### PocketBase ne démarre pas
```bash
sudo journalctl -u pocketbase -n 50
```

### Port 8090 pas accessible
```bash
sudo netstat -tlnp | grep 8090
sudo ufw status
```

### Erreur CORS sur le site
- Vérifiez les "Allowed origins" dans PocketBase Admin
- Ajoutez votre domaine: `https://sae301.banjamin-bobel.com`

### Base de données corrompue
```bash
cd ~/pocketbase/pb_data
# Restaurez depuis un backup
cp data.db data.db.backup
# Puis relancez PocketBase
```

## 📚 Ressources

- [Documentation PocketBase](https://pocketbase.io/docs/)
- [Guide de déploiement officiel](https://pocketbase.io/docs/going-to-production/)
- [Configuration Nginx](https://pocketbase.io/docs/going-to-production/#using-reverse-proxy)
