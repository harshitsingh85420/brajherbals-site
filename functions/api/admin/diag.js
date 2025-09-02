import { ensureSchema } from "./_db.js";
const ok = d => new Response(JSON.stringify(d), { headers: { "Content-Type":"application/json" }});

export async function onRequestGet({ env }){
  if (!env.DB) return ok({ ok:false, error:"DB binding missing" });
  try {
    await ensureSchema(env.DB);
    const { results } = await env.DB.prepare("SELECT COUNT(*) AS c FROM products").all();
    return ok({ ok:true, d1:true, count: results?.[0]?.c ?? 0 });
  } catch (e) {
    return ok({ ok:false, error: String(e) });
  }
}
