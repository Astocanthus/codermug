# Étape 1 : image officielle Node
FROM node:20-alpine

# Créer le dossier de travail
WORKDIR /app

# Copier le reste du code d'abord
COPY . .

# Installer les dépendances
RUN npm install

# Commande de lancement
CMD ["npm", "start"]