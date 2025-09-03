import { ensureSchema } from "../_db.js";
const ok = (d,s=200)=> new Response(JSON.stringify(d),{status:s,headers:{"Content-Type":"application/json"}});
const getToken = env => env.ADMIN_TOKEN || "tok_demo_123";
const authed = (req, env) => (req.headers.get("Authorization")||"") === ("Bearer " + getToken(env));

export async function onRequestGet({ request, env }) {
  if (!authed(request, env)) return ok({ error:"Unauthorized" }, 401);
  try {
    const db = env.DB; await ensureSchema(db);
    const url = new URL(request.url);
    const limit = Math.min(200, Math.max(1, Number(url.searchParams.get("limit")||100)));
    const { results } = await db.prepare(
      "SELECT id,created_at,name,phone,email,mode,subtotal,shipping,gst,total FROM orders ORDER BY created_at DESC LIMIT ?"
    ).bind(limit).all();
    return ok(results || []);
  } catch (e) {
    return ok({ error:String(e) }, 500);
  }
}
