# 🚀 Guide de Déploiement sur VPS

## ⚠️ IMPORTANT : PocketBase doit être déployé aussi!

**Votre connexion/inscription ne fonctionnera PAS tant que PocketBase n'est pas accessible depuis internet.**

👉 **Lisez d'abord: [POCKETBASE_DEPLOYMENT.md](./POCKETBASE_DEPLOYMENT.md)**

## 📋 Checklist avant déploiement

### 1. Variables d'environnement à modifier

Créez un fichier `.env` sur votre VPS avec:

```bash
# OpenRouter API Key (MÊME clé qu'en local)
OPENROUTER_API_KEY=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

# URL du site (OPTIONNEL - détection automatique)
# Laissez vide pour auto-détection ou spécifiez manuellement
SITE=

# URL de production (utilisée pour l'auto-détection)
PUBLIC_PRODUCTION_URL=https://votre-domaine.com

# ⚠️ CRITIQUE: URL PocketBase accessible depuis internet
# Option 1 (recommandée): Sous-domaine avec HTTPS
PUBLIC_POCKETBASE_URL=https://pb.votre-domaine.com

# Option 2 (moins sécurisée): IP + port
# PUBLIC_POCKETBASE_URL=http://votre-vps-ip:8090
```

### ✨ Détection automatique

Le système détecte automatiquement l'environnement:
- **Local**: Utilise `http://localhost:4321`
- **Production**: Utilise le domaine de la requête (avec https)

Vous n'avez PLUS BESOIN de modifier `.env` entre local et production!

### 2. Exemple de configuration (fonctionne partout)

#### Configuration universelle (local ET production):
```bash
OPENROUTER_API_KEY=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
SITE=
PUBLIC_PRODUCTION_URL=https://sae301.banjamin-bobel.com
PUBLIC_POCKETBASE_URL=https://pb.sae301.banjamin-bobel.com
```

Cette configuration fonctionne:
- ✅ En local: détecte automatiquement `http://localhost:4321`
- ✅ En production: détecte automatiquement `https://sae301.banjamin-bobel.com`

#### Si vous voulez forcer une URL spécifique:
```bash
SITE=https://app.tavue.fr
```

### 3. Configuration PocketBase

Si PocketBase est accessible via un domaine public:
- Mettez à jour `PUBLIC_POCKETBASE_URL` dans `.env`
- Configurez CORS dans PocketBase pour autoriser votre domaine

### 4. Build du projet

```bash
# Sur votre VPS
npm install
npm run build

# Le dossier dist/ contiendra les fichiers statiques
```

### 5. Configuration Nginx (exemple)

```nginx
server {
    listen 80;
    server_name votre-domaine.com;

    # Redirection HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name votre-domaine.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # Site Astro
    location / {
        proxy_pass http://localhost:4321;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # PocketBase (optionnel, si vous voulez un sous-chemin)
    location /api/ {
        proxy_pass http://localhost:8090/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
    }
}
```

## 🔐 Sécurité

### Variables sensibles
- ❌ NE COMMITEZ JAMAIS le fichier `.env` dans git
- ✅ Utilisez `.env.example` pour documenter
- ✅ Le `.gitignore` contient déjà `.env`

### Fichiers à vérifier avant commit:
```bash
# Vérifier que .env n'est pas suivi
git status

# Si .env apparaît, ajoutez-le au .gitignore:
echo ".env" >> .gitignore
```

## 📊 Vérification après déploiement

1. **Test de l'IA**:
   - Allez sur `https://votre-domaine.com/ia-generator`
   - Testez une génération
   - Vérifiez la console (F12) pour les logs

2. **Test PocketBase**:
   - Essayez de vous connecter
   - Testez la création de lunettes
   - Vérifiez le panier

3. **OpenRouter Dashboard**:
   - Allez sur https://openrouter.ai/activity
   - Vérifiez que vos requêtes apparaissent
   - Le referer devrait montrer votre domaine

## 🔄 Mise à jour de la configuration

Si vous changez de domaine plus tard:
```bash
# Sur le VPS
nano .env
# Modifiez SITE=https://nouveau-domaine.com
# Redémarrez l'application
pm2 restart tavue  # ou votre commande de redémarrage
```

## ❓ Problèmes courants

### L'IA ne fonctionne pas en production
1. Vérifiez que `SITE` est bien configuré
2. Vérifiez les logs: `pm2 logs` ou `journalctl`
3. Testez l'API directement: `curl https://votre-domaine.com/api/generate-ia`

### Erreur CORS
- Ajoutez votre domaine dans la config PocketBase
- Vérifiez que les headers CORS sont corrects

### Clé API invalide
- Vérifiez qu'il n'y a pas d'espaces dans la clé
- Testez la clé sur https://openrouter.ai/playground

## 📝 Commandes utiles

```bash
# Voir les variables d'environnement chargées
npm run dev  # affiche les vars au démarrage

# Tester la connexion OpenRouter
curl -X POST https://openrouter.ai/api/v1/chat/completions \
  -H "Authorization: Bearer $OPENROUTER_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"openai/gpt-oss-20b:free","messages":[{"role":"user","content":"test"}]}'
```
