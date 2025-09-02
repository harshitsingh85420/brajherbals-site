export async function onRequestPost({ request, env }) {
  const { password } = await request.json();

  // FALLBACKS so you can proceed without Environment Variables
  const PASS  = env.ADMIN_PASSWORD || "ChangeMe#2025";
  const TOKEN = env.ADMIN_TOKEN    || "tok_demo_123";

  if (password === PASS) {
    return new Response(JSON.stringify({ token: TOKEN }), {
      headers: { "Content-Type": "application/json" }
    });
  }
  return new Response(JSON.stringify({ error: "Invalid" }), {
    status: 401, headers: { "Content-Type": "application/json" }
  });
}
