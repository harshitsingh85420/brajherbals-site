// js/cart.js
// Minimal cart (localStorage). Works with shop.html's "Add to cart" button.

const CART_KEY = "cart_items";

// --- Storage helpers ---
function getCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY) || "[]"); }
  catch { return []; }
}
function setCart(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  updateCartBadge();
}
function clearCart() {
  localStorage.removeItem(CART_KEY);
  updateCartBadge();
}

// --- Basic ops ---
function addToCart(p) {
  // expects: { id, title, price }
  const items = getCart();
  const existing = items.find(i => i.id === p.id);
  if (existing) existing.qty += 1;
  else items.push({ id: p.id, title: p.title, price: Number(p.price) || 0, qty: 1 });
  setCart(items);
}
function removeFromCart(id) {
  setCart(getCart().filter(i => i.id !== id));
  renderCart();
}
function updateQty(id, qty) {
  qty = Math.max(1, Number(qty) || 1);
  const items = getCart();
  const it = items.find(i => i.id === id);
  if (it) it.qty = qty;
  setCart(items);
  renderCart();
}

// --- Totals (client-side, simple rules) ---
function computeTotals(items) {
  const subtotal = items.reduce((s, i) => s + (Number(i.price)||0) * (Number(i.qty)||1), 0);
  const shipping = subtotal >= 999 ? 0 : 49; // free shipping over ₹999
  const gst = Math.round(subtotal * 0.05);   // demo 5% GST
  const total = subtotal + shipping + gst;
  return { subtotal, shipping, gst, total };
}

// --- UI helpers ---
function cartCount() {
  return getCart().reduce((n, i) => n + (i.qty||0), 0);
}
function updateCartBadge() {
  const el = document.getElementById("cartCount");
  if (el) el.textContent = cartCount();
}
function renderCart() {
  const el = document.getElementById("cart");
  if (!el) return;

  const items = getCart();
  if (!items.length) {
    el.innerHTML = `<div class="card"><p>Your cart is empty.</p></div>`;
    return;
  }

  const { subtotal, shipping, gst, total } = computeTotals(items);

  let rows = items.map(i => `
    <tr>
      <td>${i.title}</td>
      <td>₹${Number(i.price)||0}</td>
      <td>
        <input type="number" min="1" value="${i.qty}" style="width:80px"
          onchange="updateQty('${i.id}', this.value)">
      </td>
      <td>₹${(Number(i.price)||0) * (Number(i.qty)||1)}</td>
      <td><button class="btn-outline" onclick="removeFromCart('${i.id}')">Remove</button></td>
    </tr>
  `).join("");

  el.innerHTML = `
    <div class="card">
      <table style="width:100%;border-collapse:collapse">
        <thead><tr><th align="left">Item</th><th align="left">Price</th><th align="left">Qty</th><th align="left">Line</th><th></th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <div style="margin-top:12px">
        <p><b>Subtotal:</b> ₹${subtotal}</p>
        <p><b>Shipping:</b> ₹${shipping}</p>
        <p><b>GST (5%):</b> ₹${gst}</p>
        <p><b>Total:</b> ₹${total}</p>
        <div style="display:flex;gap:8px;margin-top:8px">
          <button class="btn-outline" onclick="clearCart(); renderCart();">Clear cart</button>
          <button class="btn" onclick="alert('Demo checkout — integrate Razorpay later.');">Checkout</button>
        </div>
      </div>
    </div>
  `;
}

// Expose a few functions globally for inline handlers
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateQty = updateQty;
window.renderCart = renderCart;
window.updateCartBadge = updateCartBadge;

// Update the badge on load
updateCartBadge();
