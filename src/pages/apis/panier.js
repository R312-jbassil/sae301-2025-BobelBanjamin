import PocketBase from 'pocketbase';

export async function GET({ request, cookies }) {
    try {
        // Charger l'authentification depuis le cookie
        const authCookie = cookies.get('pb_auth');

        if (!authCookie) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Non authentifié'
            }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const pb = new PocketBase(import.meta.env.PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090');
        pb.authStore.loadFromCookie(authCookie.value);

        if (!pb.authStore.isValid) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Non authentifié'
            }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const userId = pb.authStore.model?.id;

        // Récupérer les items du panier de l'utilisateur (expand pour avoir les détails)
        const panierItems = await pb.collection('commander').getFullList({
            filter: `id_user = "${userId}"`,
            expand: 'id_lunette',
            sort: '-created'
        });

        return new Response(JSON.stringify({
            success: true,
            items: panierItems
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('❌ Erreur lors de la récupération du panier:', error);
        return new Response(JSON.stringify({
            success: false,
            error: error.message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

export async function POST({ request, cookies }) {
    try {
        // Charger l'authentification depuis le cookie
        const authCookie = cookies.get('pb_auth');

        if (!authCookie) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Non authentifié'
            }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const pb = new PocketBase(import.meta.env.PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090');
        pb.authStore.loadFromCookie(authCookie.value);

        if (!pb.authStore.isValid) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Non authentifié'
            }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const userId = pb.authStore.model?.id;
        const { id_lunette, nom, prix } = await request.json();

        console.log('📦 Données reçues:', { id_lunette, nom, prix });

        // Vérifier si la lunette est déjà dans le panier
        const existing = await pb.collection('commander').getFullList({
            filter: `id_user = "${userId}" && id_lunette = "${id_lunette}"`
        });

        if (existing.length > 0) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Cette lunette est déjà dans votre panier'
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Ajouter au panier (le prix sera lu depuis la lunette via expand)
        const panierItem = await pb.collection('commander').create({
            id_user: userId,
            id_lunette: id_lunette
        });

        console.log('✅ Item ajouté au panier:', panierItem.id);

        return new Response(JSON.stringify({
            success: true,
            item: panierItem
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('❌ Erreur lors de l\'ajout au panier:', error);
        return new Response(JSON.stringify({
            success: false,
            error: error.message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

export async function DELETE({ request, cookies }) {
    try {
        // Charger l'authentification depuis le cookie
        const authCookie = cookies.get('pb_auth');

        if (!authCookie) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Non authentifié'
            }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const pb = new PocketBase(import.meta.env.PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090');
        pb.authStore.loadFromCookie(authCookie.value);

        if (!pb.authStore.isValid) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Non authentifié'
            }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const { itemId } = await request.json();

        // Supprimer l'item du panier
        await pb.collection('commander').delete(itemId);

        console.log('✅ Item supprimé du panier:', itemId);

        return new Response(JSON.stringify({
            success: true
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('❌ Erreur lors de la suppression du panier:', error);
        return new Response(JSON.stringify({
            success: false,
            error: error.message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
