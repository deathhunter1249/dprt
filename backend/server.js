export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const OWNER_ID = "735531512124145674"; // Your Discord ID

    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };

    if (request.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

    // --- 1. GET ALL JOBS ---
    if (request.method === "GET" && url.pathname === "/get-jobs") {
      const { results } = await env.DB.prepare("SELECT * FROM job_board ORDER BY display_order ASC").all();
      return new Response(JSON.stringify(results), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // --- SECURITY CHECK FOR POST ACTIONS ---
    const authHeader = request.headers.get("Authorization");
    if (request.method === "POST" && authHeader !== OWNER_ID) {
      return new Response("Unauthorized", { status: 401, headers: corsHeaders });
    }

    // --- 2. TOGGLE JOB STATUS (Open/Closed) ---
    if (request.method === "POST" && url.pathname === "/toggle-job") {
      const { id, currentStatus } = await request.json();
      const newStatus = currentStatus ? 0 : 1; // Flip the bit
      await env.DB.prepare("UPDATE job_board SET is_disabled = ? WHERE id = ?").bind(newStatus, id).run();
      return new Response("Status Updated", { headers: corsHeaders });
    }

    // --- 3. REORDER JOBS (Drag & Drop) ---
    if (request.method === "POST" && url.pathname === "/reorder-jobs") {
      const { orders } = await request.json();
      // 'orders' is an array like [{id: '01', order: 0}, {id: '02', order: 1}]
      const statements = orders.map(item => 
        env.DB.prepare("UPDATE job_board SET display_order = ? WHERE id = ?").bind(item.order, item.id)
      );
      await env.DB.batch(statements); // Runs all updates at once
      return new Response("Order Updated", { headers: corsHeaders });
    }

    return new Response("DPRT API Online", { headers: corsHeaders });
  }
};
