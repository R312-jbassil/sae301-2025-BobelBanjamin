import PocketBase from 'pocketbase';

export async function GET({ cookies }) {
    try {
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

        const pb = new PocketBase('http://127.0.0.1:8090');
        pb.authStore.loadFromCookie(authCookie.value);

        if (!pb.authStore.isValid) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Session invalide'
            }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const userId = pb.authStore.model?.id;

        // Récupérer tous les items du panier de l'utilisateur
        const panierItems = await pb.collection('commander').getFullList({
            filter: `id_user = "${userId}"`,
            expand: 'id_lunette'
        });

        console.log(`🔍 Trouvé ${panierItems.length} items dans le panier`);

        let updated = 0;
        let skipped = 0;
        let errors = [];

        for (const item of panierItems) {
            // Si l'item a déjà un total, on le saute
            if (item.total && item.total > 0) {
                skipped++;
                console.log(`⏭️ Item ${item.id} déjà à jour (${item.total}€)`);
                continue;
            }

            // Récupérer le prix de la lunette
            const lunette = item.expand?.id_lunette;
            if (!lunette) {
                errors.push(`Item ${item.id}: lunette non trouvée`);
                console.error(`❌ Item ${item.id}: lunette non trouvée`);
                continue;
            }

            const total = lunette.total || 0;
            console.log(`💰 Item ${item.id} (${lunette.nom_modele}): mise à jour du prix à ${total}€`);

            try {
                // Mettre à jour l'item du panier
                await pb.collection('commander').update(item.id, {
                    total: total
                });
                updated++;
            } catch (e) {
                errors.push(`Item ${item.id}: ${e.message}`);
                console.error(`❌ Erreur mise à jour item ${item.id}:`, e);
            }
        }

        console.log(`✅ Mise à jour terminée: ${updated} items mis à jour, ${skipped} déjà à jour`);

        return new Response(JSON.stringify({
            success: true,
            updated: updated,
            skipped: skipped,
            total: panierItems.length,
            errors: errors
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('❌ Erreur:', error);
        return new Response(JSON.stringify({
            success: false,
            error: error.message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
