import PocketBase from 'pocketbase';

export async function POST({ request, cookies }) {
    try {
        const body = await request.json();

        // Récupérer l'utilisateur connecté via authStore
        const authCookie = cookies.get('pb_auth');
        let userId = null;
        let userEmail = null;

        console.log('🔍 Cookie pb_auth:', authCookie ? 'présent' : 'absent');

        if (authCookie && authCookie.value) {
            try {
                const pbAuth = new PocketBase('http://127.0.0.1:8090');
                pbAuth.authStore.loadFromCookie(authCookie.value);

                if (pbAuth.authStore.isValid && pbAuth.authStore.model) {
                    userId = pbAuth.authStore.model.id;
                    userEmail = pbAuth.authStore.model.email;
                    console.log('✅ User authentifié - ID:', userId, 'Email:', userEmail);
                } else {
                    console.warn('⚠️ Cookie présent mais session invalide');
                }
            } catch (parseError) {
                console.error('❌ Erreur chargement auth:', parseError);
            }
        } else {
            console.warn('⚠️ Aucun cookie pb_auth trouvé');
        }

        if (!userId) {
            console.warn('⚠️ Aucun utilisateur connecté - la relation dans "creer" ne sera pas créée');
        }

        // Créer d'abord la lunette
        const svgData = {
            couleur_monture: body.couleur_monture || '#222d3a',
            couleur_branche: body.couleur_branche || '#222d3a',
            couleur_verres: body.couleur_verre || '#7fa1e7',
        };

        const lunetteData = {
            nom_modele: body.nom_modele,
            taille_monture: body.taille,
            couleur_monture: body.couleur_monture || '#222d3a',
            couleur_branche: body.couleur_branche || '#222d3a',
            couleur_verres: body.couleur_verre || '#7fa1e7',
            materiaux_lunettes: body.materiau?.id, // Avec un 's' !
            id_verres: body.verre?.id,
            code_svg: JSON.stringify(svgData) // Sauvegarder les couleurs en JSON
        };

        console.log('📦 Données envoyées à PocketBase:', lunetteData);

        // Créer une nouvelle instance PocketBase pour les opérations DB
        const pb = new PocketBase('http://127.0.0.1:8090');

        const lunette = await pb.collection('lunette').create(lunetteData);
        console.log('✅ Lunette créée avec ID:', lunette.id);

        // Créer la relation dans 'creer' si l'utilisateur est connecté
        if (userId && lunette.id) {
            const creerData = {
                id_utilisateur: userId,
                id_lunettes: lunette.id
            };
            console.log('🔗 Création relation dans "creer":', creerData);

            try {
                const relation = await pb.collection('creer').create(creerData);
                console.log('✅ Relation créée avec succès - ID:', relation.id);

                return new Response(JSON.stringify({
                    ok: true,
                    lunette_id: lunette.id,
                    relation_id: relation.id,
                    user_id: userId,
                    user_email: userEmail
                }), {
                    headers: { "Content-Type": "application/json" },
                    status: 200
                });
            } catch (relationError) {
                console.error('❌ Erreur création relation:', relationError);
                // Retourner quand même un succès car la lunette est créée
                return new Response(JSON.stringify({
                    ok: true,
                    lunette_id: lunette.id,
                    warning: 'Lunette créée mais erreur relation: ' + relationError.message
                }), {
                    headers: { "Content-Type": "application/json" },
                    status: 200
                });
            }
        } else {
            console.warn('⚠️ Pas de relation créée dans "creer" - utilisateur non connecté');
            return new Response(JSON.stringify({
                ok: true,
                lunette_id: lunette.id,
                warning: 'Utilisateur non connecté - relation non créée'
            }), {
                headers: { "Content-Type": "application/json" },
                status: 200
            });
        }
    } catch (e) {
        console.error('Erreur sauvegarde:', e);
        return new Response(JSON.stringify({ ok: false, error: e.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}
