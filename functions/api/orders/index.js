import { ensureSchema } from "../admin/_db.js";
const ok = (d,s=200) => new Response(JSON.stringify(d), { status:s, headers:{ "Content-Type":"application/json" }});

export async function onRequestPost({ request, env }) {
  try {
    const body = await request.json(); // { name, phone, email, address, mode, items:[{id,title,price,qty}], totals? }
    const items = Array.isArray(body.items) ? body.items : [];
    const subtotal = items.reduce((s,i)=> s + (Number(i.price)||0) * (Number(i.qty)||1), 0);
    const shipping = subtotal >= 999 ? 0 : 49;
    const gst = Math.round(subtotal * 0.05);
    const total = subtotal + shipping + gst;

    const id = "ord_" + Math.random().toString(36).slice(2,10);
    const db = env.DB; await ensureSchema(db);
    await db.prepare(
      "INSERT INTO orders(id,created_at,name,phone,email,address,mode,subtotal,shipping,gst,total,items) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)"
    ).bind(
      id, Date.now(), (body.name||""), (body.phone||""), (body.email||""), (body.address||""),
      (body.mode||"cod"), subtotal, shipping, gst, total, JSON.stringify(items)
    ).run();

    return ok({ ok:true, order_id:id, subtotal, shipping, gst, total });
  } catch (e) {
    return ok({ ok:false, error:String(e) }, 500);
  }
}
