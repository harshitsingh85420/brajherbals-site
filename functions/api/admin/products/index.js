import { ensureSchema, allProducts, upsertProduct } from "../_db.js";
const ok = d => new Response(JSON.stringify(d), { headers: { "Content-Type": "application/json" }});
const getToken = env => env.ADMIN_TOKEN || "tok_demo_123"; // fallback if env vars are missing
const authed = (req, env) => (req.headers.get("Authorization")||"") === ("Bearer " + getToken(env));

export async function onRequestGet({ env }){
  const db = env.DB; await ensureSchema(db);
  return ok(await allProducts(db));
}
export async function onRequestPost({ request, env }){
  if(!authed(request, env)) return new Response(JSON.stringify({error:"Unauthorized"}),{status:401,headers:{"Content-Type":"application/json"}});
  const db = env.DB; await ensureSchema(db);
  const id = await upsertProduct(db, await request.json());
  return ok({ id });
}
