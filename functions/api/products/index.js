import { ensureSchema } from "../admin/_db.js";
const ok = d => new Response(JSON.stringify(d), { headers:{ "Content-Type":"application/json" }});

export async function onRequestGet({ request, env }) {
  try {
    const db = env.DB; await ensureSchema(db);

    const url = new URL(request.url);
    const q  = (url.searchParams.get("q") || "").trim();
    const cat = (url.searchParams.get("category") || "").trim();
    const sort = (url.searchParams.get("sort") || "newest").toLowerCase();

    const where = [];
    const binds = [];
    if (q) { where.push("(title LIKE ? OR description LIKE ?)"); binds.push(`%${q}%`, `%${q}%`); }
    if (cat) { where.push("category = ?"); binds.push(cat); }

    let order = "ORDER BY rowid DESC"; // newest
    if (sort === "price_asc")  order = "ORDER BY price ASC, rowid DESC";
    if (sort === "price_desc") order = "ORDER BY price DESC, rowid DESC";
    if (sort === "title_asc")  order = "ORDER BY title ASC";
    if (sort === "title_desc") order = "ORDER BY title DESC";

    const sql = `SELECT id,title,price,description,category,image FROM products ${where.length?'WHERE '+where.join(' AND '):''} ${order}`;
    const stmt = db.prepare(sql);
    const { results } = await stmt.bind(...binds).all();
    return ok(results || []);
  } catch (e) {
    return new Response(JSON.stringify({ error:String(e) }), { status:500, headers:{ "Content-Type":"application/json" }});
  }
}
