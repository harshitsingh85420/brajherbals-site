import { ensureSchema, upsertProduct, deleteProduct } from "../_db.js";
const ok = d => new Response(JSON.stringify(d), { headers: { "Content-Type": "application/json" }});
const getToken = env => env.ADMIN_TOKEN || "tok_demo_123"; // fallback if env vars missing
const authed = (req, env) => (req.headers.get("Authorization")||"") === ("Bearer " + getToken(env));

export async function onRequestPut({ request, env, params }){
  if(!authed(request, env)) return new Response(JSON.stringify({error:"Unauthorized"}),{status:401,headers:{"Content-Type":"application/json"}});
  const db = env.DB; await ensureSchema(db);
  const body = await request.json(); body.id = params.id;
  return ok({ id: await upsertProduct(db, body) });
}
export async function onRequestDelete({ request, env, params }){
  if(!authed(request, env)) return new Response(JSON.stringify({error:"Unauthorized"}),{status:401,headers:{"Content-Type":"application/json"}});
  const db = env.DB; await ensureSchema(db);
  await deleteProduct(db, params.id);
  return ok({ ok: true });
}
