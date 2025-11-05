import pb from '../../lib/pb.js';

export async function post({ request }) {
    const body = await request.json();

    // Adaptation aux champs de la collection lunette (voir tes screenshots)
    const recordData = {
        nom_modele: body.nom_modele,
        taille_monture: body.taille,
        couleur_monture: body.couleur_monture,
        couleur_branche: body.couleur_branche,
        // Relations (attention : id de la sélection)
        materiaux_lunettes: body.materiau?.id,
        id_verres: body.verre?.id,
        // Optionnel : tu peux stocker la couleur des verres dans code_svg ou un autre champ texte
        code_svg: '', // (à remplir si tu veux, par exemple le SVG complet ou JSON)
        // Ajoute ici d'autres champs si besoin !
    };

    try {
        const creation = await pb.collection('lunette').create(recordData);
        return new Response(JSON.stringify({ ok: true, id: creation.id }), {
            headers: { "Content-Type": "application/json" },
            status: 200
        });
    } catch (e) {
        return new Response(JSON.stringify({ ok: false, error: e.message }), { status: 500 });
    }
}
