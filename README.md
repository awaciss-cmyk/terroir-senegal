# 🌿 Terroir Sénégal — Déploiement Railway

## Déploiement en ligne (Railway + MongoDB Atlas)

### Étape 1 — Créer la base de données MongoDB Atlas (gratuit)

1. Aller sur https://cloud.mongodb.com → créer un compte gratuit
2. Créer un **Cluster gratuit (M0)**
3. Dans "Database Access" → créer un utilisateur avec mot de passe
4. Dans "Network Access" → ajouter `0.0.0.0/0` (accès depuis partout)
5. Cliquer "Connect" → "Compass" → copier l'URI qui ressemble à :
   ```
   mongodb+srv://monuser:monpassword@cluster0.xxxxx.mongodb.net/terroir_senegal
   ```

### Étape 2 — Mettre le projet sur GitHub

1. Créer un compte sur https://github.com
2. Créer un **nouveau dépôt public** (ex: `terroir-senegal`)
3. Extraire le ZIP téléchargé
4. Dans le dossier extrait, ouvrir un terminal :
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/VOTRE_NOM/terroir-senegal.git
   git push -u origin main
   ```

### Étape 3 — Déployer sur Railway

1. Aller sur https://railway.app → se connecter avec GitHub
2. Cliquer **"New Project"** → **"Deploy from GitHub repo"**
3. Sélectionner votre dépôt `terroir-senegal`
4. Railway détecte Node.js automatiquement et démarre le déploiement

### Étape 4 — Ajouter les variables d'environnement

Dans Railway → votre projet → onglet **"Variables"** → ajouter :

| Variable      | Valeur                                    |
|---------------|-------------------------------------------|
| MONGODB_URI   | mongodb+srv://user:pass@cluster.../terroir_senegal |
| JWT_SECRET    | une_chaine_secrete_longue_et_aleatoire    |
| NODE_ENV      | production                                |

### Étape 5 — Obtenir votre lien public

1. Railway → votre projet → onglet **"Settings"**
2. Section **"Domains"** → cliquer **"Generate Domain"**
3. Vous obtenez un lien comme : `https://terroir-senegal-production.up.railway.app`

### Étape 6 — Initialiser les produits (optionnel)

Pour pré-remplir la boutique avec les produits de démonstration,
vous pouvez exécuter depuis votre terminal local (avec .env renseigné) :
```bash
npm run seed
```

---

## Compte Admin par défaut (après seed)

- **Email :** admin@terroir.sn
- **Mot de passe :** admin1234

⚠️ Changez le mot de passe après le premier déploiement !
