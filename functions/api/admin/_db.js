export async function ensureSchema(db) {
  await db.prepare("CREATE TABLE IF NOT EXISTS products (id TEXT PRIMARY KEY, title TEXT NOT NULL, price INTEGER NOT NULL, description TEXT, category TEXT, image TEXT);").run();
  await db.prepare("CREATE TABLE IF NOT EXISTS orders (id TEXT PRIMARY KEY, created_at INTEGER NOT NULL, name TEXT, phone TEXT, email TEXT, address TEXT, mode TEXT NOT NULL, subtotal INTEGER NOT NULL, shipping INTEGER NOT NULL, gst INTEGER NOT NULL, total INTEGER NOT NULL, items TEXT NOT NULL);").run();
}


export async function allProducts(db) {
  const { results } = await db.prepare(
    "SELECT id,title,price,description,category,image FROM products ORDER BY rowid DESC"
  ).all();
  return results || [];
}

export async function upsertProduct(db, body) {
  if (!body.title || typeof body.price !== "number") throw new Error("Invalid");
  const id = body.id || ("sku_" + Math.random().toString(36).slice(2,8));
  await db.prepare(
    "INSERT INTO products(id,title,price,description,category,image) VALUES(?,?,?,?,?,?) " +
    "ON CONFLICT(id) DO UPDATE SET title=excluded.title, price=excluded.price, description=excluded.description, category=excluded.category, image=excluded.image"
  ).bind(id, body.title, body.price, body.description||"", body.category||"", body.image||"").run();
  return id;
}

export async function deleteProduct(db, id) {
  await db.prepare("DELETE FROM products WHERE id=?").bind(id).run();
}
