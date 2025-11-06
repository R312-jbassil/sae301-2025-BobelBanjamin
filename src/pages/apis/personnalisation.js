import pb from '../../lib/pb.js';

export async function GET() {
    try {
        const materiauxMonture = await pb.collection('materiaux_lunette').getFullList();
        const materiauxVerres = await pb.collection('materiaux_verres').getFullList();
        return new Response(JSON.stringify({ materiauxMonture, materiauxVerres }), {
            headers: { "Content-Type": "application/json" }
        });
    } catch (e) {
        console.error('Erreur API personnalisation:', e);
        return new Response(JSON.stringify({ materiauxMonture: [], materiauxVerres: [], error: e.message }), {
            headers: { "Content-Type": "application/json" },
            status: 500
        });
    }
}
