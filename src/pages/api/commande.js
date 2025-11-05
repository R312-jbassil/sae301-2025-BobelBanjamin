import pb from '../../lib/pb';

export async function POST({ request }) {
    try {
        // Charger l'authentification depuis le cookie
        const cookieHeader = request.headers.get('cookie');
        console.log('🍪 Cookie header:', cookieHeader);

        pb.authStore.loadFromCookie(cookieHeader || '');

        if (!pb.authStore.isValid) {
            console.log('❌ Utilisateur non authentifié');
            return new Response(JSON.stringify({
                success: false,
                error: 'Non authentifié'
            }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const userId = pb.authStore.model?.id;
        console.log('👤 User ID:', userId);

        // Récupérer les données de la commande
        const { items, total } = await request.json();
        console.log('📦 Items:', items);
        console.log('💰 Total:', total);

        // Créer la commande dans PocketBase
        const commande = await pb.collection('commande').create({
            id_utilisateur: userId,
            items: JSON.stringify(items),
            total: total,
            statut: 'pending'
        });

        console.log('✅ Commande créée:', commande.id);

        return new Response(JSON.stringify({
            success: true,
            commande_id: commande.id
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('❌ Erreur lors de la création de la commande:', error);
        return new Response(JSON.stringify({
            success: false,
            error: error.message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
