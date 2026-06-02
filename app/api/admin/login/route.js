export async function POST(request) {
    try {
        const { password } = await request.json();

        const adminPassword = process.env.ADMIN_PASSWORD;

        if (!adminPassword) {
            return new Response(
                JSON.stringify({ error: "Admin password not configured" }),
                { status: 500 }
            );
        }

        if (password === adminPassword) {
            return new Response(
                JSON.stringify({ success: true, token: "admin_authenticated" }),
                { status: 200 }
            );
        } else {
            return new Response(JSON.stringify({ error: "Invalid password" }), {
                status: 401,
            });
        }
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
        });
    }
}
