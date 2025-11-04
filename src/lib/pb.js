import PocketBase from 'pocketbase';

const pb = new PocketBase(import.meta.env.PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090');

// Désactiver l'auto-cancellation pour éviter les conflits entre requêtes
pb.autoCancellation(false);

const lunettes = await pb.collection('lunette').getFullList({ sort: '-created' }); // ou 'created' pour la plus ancienne

// Prends la première pour la paire de base
const paireDeBase = lunettes[0];

export default { pb, paireDeBase };