export async function onRequestPost({ request, env }){
  const token = (request.headers.get("Authorization")||"");
  const expected = "Bearer " + (env.ADMIN_TOKEN || "tok_demo_123");
  if (token !== expected) return new Response(JSON.stringify({error:"Unauthorized"}), { status:401, headers:{"Content-Type":"application/json"}});
  try {
    const db = env.DB; await ensureSchema(db);
    const body = await request.json();
    body.price = Number(body.price);
    if (!Number.isFinite(body.price)) return new Response(JSON.stringify({ error:"Invalid price"}), { status:400, headers:{"Content-Type":"application/json"}});
    const id = await upsertProduct(db, body);
    return new Response(JSON.stringify({ id }), { headers: { "Content-Type":"application/json" }});
  } catch (e) {
    return new Response(JSON.stringify({ error:String(e) }), { status:500, headers:{ "Content-Type":"application/json" }});
  }
}
