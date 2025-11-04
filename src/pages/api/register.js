import PocketBase from "pocketbase";

export const POST = async ({ request, cookies }) => {
    try {
        const data = await request.json();
        const { email, password, passwordConfirm, name } = data;

        // Vérifs de base
        if (!email || !password) {
            return new Response(JSON.stringify({
                success: false,
                error: "Email et mot de passe requis"
            }), {
                status: 400,
                headers: { "Content-Type": "application/json" }
            });
        }
        if (!name || name.trim().length < 2) {
            return new Response(JSON.stringify({
                success: false,
                error: "Le nom est obligatoire"
            }), {
                status: 400,
                headers: { "Content-Type": "application/json" }
            });
        }
        if (password !== passwordConfirm) {
            return new Response(JSON.stringify({
                success: false,
                error: "Les mots de passe ne correspondent pas"
            }), {
                status: 400,
                headers: { "Content-Type": "application/json" }
            });
        }
        if (password.length < 8) {
            return new Response(JSON.stringify({
                success: false,
                error: "Le mot de passe doit faire au moins 8 caractères"
            }), {
                status: 400,
                headers: { "Content-Type": "application/json" }
            });
        }

        const pb = new PocketBase(import.meta.env.PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090');
        const userData = {
            email: email,
            password: password,
            passwordConfirm: passwordConfirm,
            name: name.trim(),
            emailVisibility: true,
        };

        await pb.collection("users").create(userData);

        // Auth auto juste après inscription
        const authData = await pb.collection("users").authWithPassword(email, password);

        cookies.set("pb_auth", pb.authStore.exportToCookie(), {
            path: "/",
            httpOnly: true,
            sameSite: "strict",
            expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        });

        return new Response(JSON.stringify({ success: true, user: authData.record }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });

    } catch (err) {
        let errorMessage = "Erreur lors de l'inscription";
        if (err.response?.data?.email) errorMessage = "Cet email est déjà utilisé";
        if (err.response?.data?.password) errorMessage = "Le mot de passe doit faire au moins 8 caractères";
        if (err.response?.data?.passwordConfirm) errorMessage = "Les mots de passe ne correspondent pas";
        return new Response(JSON.stringify({
            success: false,
            error: errorMessage
        }), {
            status: 400,
            headers: { "Content-Type": "application/json" }
        });
    }
};
