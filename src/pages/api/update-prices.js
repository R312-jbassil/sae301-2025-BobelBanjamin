import PocketBase from 'pocketbase';

export async function GET() {
    try {
        const pb = new PocketBase('http://127.0.0.1:8090');

        // Récupérer toutes les lunettes avec leurs relations
        const lunettes = await pb.collection('lunette').getFullList({
            expand: 'materiaux_lunettes,id_verres'
        });

        console.log(`🔍 Trouvé ${lunettes.length} lunettes à mettre à jour`);

        let updated = 0;
        let skipped = 0;

        for (const lunette of lunettes) {
            // Si la lunette a déjà un total > 0, on la saute
            if (lunette.total && lunette.total > 0) {
                skipped++;
                continue;
            }

            // Calculer le prix
            const prixMateriaux = lunette.expand?.materiaux_lunettes?.prix_materiaux || 0;
            const prixVerres = lunette.expand?.id_verres?.prix_verres || 0;
            const total = parseFloat(prixMateriaux) + parseFloat(prixVerres);

            console.log(`📝 Lunette ${lunette.nom_modele}: ${prixMateriaux} + ${prixVerres} = ${total}`);

            // Mettre à jour la lunette
            await pb.collection('lunette').update(lunette.id, {
                total: total
            });

            updated++;
        }

        console.log(`✅ Mise à jour terminée: ${updated} lunettes mises à jour, ${skipped} déjà à jour`);

        return new Response(JSON.stringify({
            success: true,
            updated: updated,
            skipped: skipped,
            total: lunettes.length
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
