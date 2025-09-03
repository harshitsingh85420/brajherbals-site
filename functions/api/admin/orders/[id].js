import { ensureSchema } from "../_db.js";
const ok = (d,s=200)=> new Response(JSON.stringify(d),{status:s,headers:{"Content-Type":"application/json"}});
const getToken = env => env.ADMIN_TOKEN || "tok_demo_123";
const authed = (req, env) => (req.headers.get("Authorization")||"") === ("Bearer " + getToken(env));

export async function onRequestGet({ request, env, params }) {
  if (!authed(request, env)) return ok({ error:"Unauthorized" }, 401);
  try {
    const db = env.DB; await ensureSchema(db);
    const { results } = await db.prepare(
      "SELECT id,created_at,name,phone,email,address,mode,subtotal,shipping,gst,total,items FROM orders WHERE id=?"
    ).bind(params.id).all();
    return ok(results?.[0] || null);
  } catch (e) {
    return ok({ error:String(e) }, 500);
  }
}

export async function onRequestDelete({ request, env, params }) {
  if (!authed(request, env)) return ok({ error:"Unauthorized" }, 401);
  try {
    const db = env.DB; await ensureSchema(db);
    await db.prepare("DELETE FROM orders WHERE id=?").bind(params.id).run();
    return ok({ ok:true });
  } catch (e) {
    return ok({ error:String(e) }, 500);
  }
}
