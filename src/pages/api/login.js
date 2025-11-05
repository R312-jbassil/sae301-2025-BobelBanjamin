import PocketBase from "pocketbase";

export const POST = async ({ request, cookies }) => {
    try {
        const data = await request.json();
        const { email, password } = data;

        if (!email || !password)
            return new Response(JSON.stringify({ success: false, error: "Email et mot de passe requis" }), { status: 400, headers: { "Content-Type": "application/json" } });

        const pb = new PocketBase(import.meta.env.PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090');
        const authData = await pb.collection("users").authWithPassword(email, password);

        cookies.set("pb_auth", pb.authStore.exportToCookie(), {
            path: "/",
            httpOnly: true,
            sameSite: "strict",
            expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        });

        return new Response(JSON.stringify({ success: true, user: authData.record }), { status: 200, headers: { "Content-Type": "application/json" } });
    } catch (err) {
        return new Response(JSON.stringify({ success: false, error: "Mauvais email ou mot de passe" }), { status: 401, headers: { "Content-Type": "application/json" } });
    }
};
