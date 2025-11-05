import pb from '../../lib/pb.js';

export async function get() {
    const materiauxMonture = await pb.collection('materiaux_lunette').getFullList();
    const materiauxVerres = await pb.collection('materiaux_verres').getFullList();
    return new Response(JSON.stringify({ materiauxmonture, materiauxverres }), {
        headers: { "Content-Type": "application/json" }
    });
}
