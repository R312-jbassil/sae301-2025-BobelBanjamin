export async function POST({ request }) {
    try {
        const { prompt, materiaux, verres } = await request.json();

        // Créer le prompt pour l'IA
        const systemPrompt = `Tu es un designer de lunettes expert. Ton rôle est d'analyser la description d'un client et de choisir les meilleures options pour créer des lunettes personnalisées.

Matériaux disponibles:
${materiaux.map((m, i) => `${i + 1}. ${m.nom_materiaux} (${m.prix_materiaux}€)`).join('\n')}

Verres disponibles:
${verres.map((v, i) => `${i + 1}. ${v.nom_verres} (${v.prix_verres}€)`).join('\n')}

Tailles disponibles: S, M, L

Réponds UNIQUEMENT avec un JSON valide au format suivant (sans markdown, sans backticks):
{
  "materiau_index": <index du matériau choisi (0-based)>,
  "verre_index": <index des verres choisis (0-based)>,
  "taille": "<S, M ou L>",
  "couleur_monture": "<code couleur hex>",
  "couleur_branche": "<code couleur hex>",
  "couleur_verres": "<code couleur hex>",
  "explication": "<explication de tes choix en 2-3 phrases>"
}`;

        const userPrompt = `Le client demande: "${prompt}"

Choisis les meilleures options et réponds avec le JSON.`;

        // Appel à OpenRouter
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${import.meta.env.OPENROUTER_API_KEY || 'sk-or-v1-your-key-here'}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': import.meta.env.SITE || 'http://localhost:4321',
                'X-Title': 'TaVue - Générateur de Lunettes IA'
            },
            body: JSON.stringify({
                model: 'openai/gpt-oss-20b:free', // Modèle gratuit d'OpenRouter
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                temperature: 0.7,
                max_tokens: 500
            })
        });

        if (!response.ok) {
            const error = await response.text();
            console.error('OpenRouter error:', error);
            throw new Error(`OpenRouter API error: ${response.status}`);
        }

        const data = await response.json();
        const aiResponse = data.choices[0].message.content;

        console.log('🤖 Réponse brute de l\'IA:', aiResponse);

        // Parser la réponse JSON de l'IA
        let parsedResponse;
        try {
            // Nettoyer la réponse si elle contient du markdown
            const cleanedResponse = aiResponse
                .replace(/```json\n?/g, '')
                .replace(/```\n?/g, '')
                .trim();
            
            parsedResponse = JSON.parse(cleanedResponse);
        } catch (parseError) {
            console.error('Erreur parsing JSON:', parseError);
            console.error('Réponse IA:', aiResponse);
            throw new Error('Format de réponse invalide de l\'IA');
        }

        // Valider et construire la réponse
        const generation = {
            materiau: materiaux[parsedResponse.materiau_index] || materiaux[0],
            verre: verres[parsedResponse.verre_index] || verres[0],
            taille: parsedResponse.taille || 'M',
            couleur_monture: parsedResponse.couleur_monture || '#222d3a',
            couleur_branche: parsedResponse.couleur_branche || '#222d3a',
            couleur_verres: parsedResponse.couleur_verres || '#7fa1e7',
            explanation: parsedResponse.explication || 'Lunettes générées par l\'IA'
        };

        console.log('✅ Génération finale:', generation);

        return new Response(JSON.stringify({
            success: true,
            generation: generation
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('❌ Erreur génération IA:', error);
        return new Response(JSON.stringify({
            success: false,
            error: error.message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
