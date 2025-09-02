const ok = d => new Response(JSON.stringify(d), { headers: { "Content-Type": "application/json" }});
const getToken = env => env.ADMIN_TOKEN || "tok_demo_123";
const authed = (req, env) => (req.headers.get("Authorization")||"") === ("Bearer " + getToken(env));

export async function onRequestGet({ env }) {
  const all = [];
  let cursor;
  do {
    const l = await env.PRODUCTS.list({ prefix: "prod:", cursor });
    for (const k of l.keys) {
      const val = await env.PRODUCTS.get(k.name);
      if (val) all.push(JSON.parse(val));
    }
    cursor = l.cursor;
  } while (cursor);
  all.sort((a,b)=> (b.createdAt||0) - (a.createdAt||0));
  return ok(all);
}

export async function onRequestPost({ request, env }) {
  if (!authed(request, env)) return new Response(JSON.stringify({ error:"Unauthorized"}), { status: 401, headers: { "Content-Type":"application/json" }});
  const body = await request.json();
  if (!body.title || typeof body.price !== "number") return new Response(JSON.stringify({ error:"Invalid"}), { status: 400, headers:{ "Content-Type":"application/json"}});
  const id = body.id || ("sku_" + Math.random().toString(36).slice(2,8));
  const product = { id, title: body.title, price: body.price, description: body.description||"", category: body.category||"", image: body.image||"", createdAt: Date.now() };
  await env.PRODUCTS.put("prod:"+id, JSON.stringify(product));
  return ok({ id });
}
