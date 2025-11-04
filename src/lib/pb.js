import PocketBase from 'pocketbase';

const pb = new PocketBase(import.meta.env.PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090');

// Désactiver l'auto-cancellation pour éviter les conflits entre requêtes
pb.autoCancellation(false);

export default pb;