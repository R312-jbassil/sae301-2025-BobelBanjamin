# 🚨 PROBLÈME: Connexion/Inscription ne marche pas en production

## ❌ Pourquoi ça ne marche pas ?

Votre code essaie de se connecter à PocketBase à l'adresse `http://127.0.0.1:8090`, mais cette adresse ne fonctionne **QUE sur votre ordinateur local**.

En production (sur internet), vos visiteurs ne peuvent pas accéder à `127.0.0.1` car c'est **votre ordinateur local**, pas votre serveur VPS.

## ✅ Solution Simple

### 1. Déployez PocketBase sur votre VPS

**Guide complet:** [POCKETBASE_DEPLOYMENT.md](./POCKETBASE_DEPLOYMENT.md)

**Version courte:**
```bash
# Connectez-vous à votre VPS
ssh votre-utilisateur@votre-vps

# Installez PocketBase
mkdir ~/pocketbase && cd ~/pocketbase
wget https://github.com/pocketbase/pocketbase/releases/download/v0.31.0/pocketbase_0.31.0_linux_amd64.zip
unzip pocketbase_0.31.0_linux_amd64.zip
chmod +x pocketbase

# Démarrez-le
./pocketbase serve --http=0.0.0.0:8090
```

### 2. Ouvrez le port 8090 sur votre VPS

```bash
sudo ufw allow 8090/tcp
sudo ufw reload
```

### 3. Mettez à jour votre `.env` sur le VPS

```bash
PUBLIC_POCKETBASE_URL=http://VOTRE-IP-VPS:8090
```

Remplacez `VOTRE-IP-VPS` par l'adresse IP de votre serveur.

### 4. Redéployez votre site

```bash
# Sur le VPS
cd ~/votre-site
git pull
npm run build
pm2 restart astro
```

## 🔒 Version Sécurisée (Recommandé)

Au lieu d'utiliser l'IP avec le port, utilisez un sous-domaine avec HTTPS:

1. **Créez un sous-domaine:** `pb.sae301.banjamin-bobel.com` pointant vers votre VPS
2. **Configurez Nginx** comme reverse proxy (voir [POCKETBASE_DEPLOYMENT.md](./POCKETBASE_DEPLOYMENT.md))
3. **Installez un certificat SSL** avec Certbot
4. **Mettez à jour .env:**
   ```bash
   PUBLIC_POCKETBASE_URL=https://pb.sae301.banjamin-bobel.com
   ```

## 🧪 Comment tester

### Testez PocketBase directement:
```bash
# Dans votre navigateur, allez sur:
http://VOTRE-IP-VPS:8090/_/

# Vous devriez voir l'interface d'admin PocketBase
```

### Testez depuis votre site:
1. Allez sur: https://sae301.banjamin-bobel.com/diagnostic
2. Vérifiez que PocketBase est accessible ✅
3. Testez la connexion: https://sae301.banjamin-bobel.com/login

## 📊 Diagnostic Rapide

### ✅ Ça marche en local mais pas en production
→ PocketBase n'est pas déployé sur le VPS

### ✅ Erreur "Failed to fetch"
→ Le port 8090 n'est pas ouvert ou PocketBase n'est pas démarré

### ✅ Erreur CORS
→ Configurez les "Allowed origins" dans PocketBase Admin (Settings)

## 💡 En Résumé

| Environnement | PocketBase URL | Status |
|---------------|----------------|--------|
| **Local (votre Mac)** | `http://127.0.0.1:8090` | ✅ Fonctionne |
| **Production (internet)** | `http://127.0.0.1:8090` | ❌ Ne fonctionne PAS |
| **Production (correct)** | `http://votre-vps-ip:8090` | ✅ Fonctionne |
| **Production (sécurisé)** | `https://pb.votre-domaine.com` | ✅ Fonctionne + HTTPS |

---

**🚀 Prochaine étape:** Lisez [POCKETBASE_DEPLOYMENT.md](./POCKETBASE_DEPLOYMENT.md) pour le guide complet!
