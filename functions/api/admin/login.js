export async function onRequestPost({ request, env }) {
  const { password } = await request.json();
  const PASS  = env.ADMIN_PASSWORD || "ChangeMe#2025"; // fallback
  const TOKEN = env.ADMIN_TOKEN    || "tok_demo_123";  // fallback
  if (password === PASS) {
    return new Response(JSON.stringify({ token: TOKEN }), { headers: { "Content-Type": "application/json" }});
  }
  return new Response(JSON.stringify({ error: "Invalid" }), { status: 401, headers: { "Content-Type": "application/json" }});
}
