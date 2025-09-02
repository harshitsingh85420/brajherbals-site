export async function onRequestPost({ request, env }) {
  try {
    const { total, currency = "INR", receipt = "rcpt_"+Date.now() } = await request.json();
    if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
      return new Response(JSON.stringify({ error: "Missing Razorpay env vars" }), { status: 500, headers: { "Content-Type":"application/json" }});
    }
    const creds = btoa(env.RAZORPAY_KEY_ID + ":" + env.RAZORPAY_KEY_SECRET);
    const payload = { amount: Math.round((total||0) * 100), currency, receipt };
    const r = await fetch("https://api.razorpay.com/v1/orders", {
      method:"POST",
      headers:{ "Authorization":"Basic "+creds, "Content-Type":"application/json" },
      body: JSON.stringify(payload)
    });
    if(!r.ok) return new Response(JSON.stringify({ error:"Razorpay order failed" }), { status:500, headers:{ "Content-Type":"application/json" }});
    const d = await r.json();
    return new Response(JSON.stringify({ order_id:d.id, amount:d.amount, currency:d.currency, key_id: env.RAZORPAY_KEY_ID }), { headers:{ "Content-Type":"application/json" }});
  } catch (e) {
    return new Response(JSON.stringify({ error:String(e) }), { status:500, headers:{ "Content-Type":"application/json" }});
  }
}
