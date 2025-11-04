export function GET({ cookies }) {
    cookies.set('pb_auth', '', { path: '/' });
    return new Response(null, {
        status: 302,
        headers: { Location: '/' }
    });
}
