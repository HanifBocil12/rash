import { useState, useEffect } from 'react';
import Liquid from '../components/liquid.jsx';

export default function Perlengkapan() {
  const API_URL = "https://api-web.up.railway.app"; // URL API Railway
  const [userId, setUserId] = useState("");         // user_id asli dari server
  const [agentParam, setAgentParam] = useState(""); // parameter agent (misal folder ZIP)
  const [status, setStatus] = useState("");         // status API

  // Ambil user_id saat load halaman
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const res = await fetch(`${API_URL}/userid/get_user_id`, {
          headers: { "Authorization": "Bearer " + localStorage.getItem("token") }
        });
        const data = await res.json();
        if (data.status === "success") {
          setUserId(data.user_id);
        } else {
          setStatus(`Error ambil user_id: ${data.message}`);
        }
      } catch (err) {
        setStatus(`Gagal konek ke API: ${err.message}`);
      }
    };
    fetchUserId();
  }, []);

  // Set agent_param per-user
  const handleSetAgentParam = async () => {
    if (!agentParam) {
      alert("Masukkan parameter agent dulu!");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/userid/set_agent_param`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": "Bearer " + localStorage.getItem("token")
        },
        body: JSON.stringify({ param: agentParam, user_id: userId }) // kirim user_id ke server untuk agent
      });
      const data = await res.json();
      if (data.status === "success") {
        setStatus(`Parameter agent berhasil diset: ${data.param}, USER_ID agent: ${data.user_id}`);
      } else {
        setStatus(`Error: ${data.message}`);
      }
    } catch (err) {
      setStatus(`Gagal konek ke API: ${err.message}`);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <Liquid />

      <div className="relative z-10 min-h-screen bg-white/40 py-8 px-4">
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md p-6 md:p-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
            ⚙️ Konfigurasi Agent
          </h1>

          <div className="mb-4">
            <div className="text-gray-600 mb-2">🆔 User ID: {userId}</div>

            <input
              type="text"
              value={agentParam}
              onChange={(e) => setAgentParam(e.target.value)}
              placeholder="Masukkan parameter agent"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-2"
            />

            <button
              onClick={handleSetAgentParam}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
            >
              💾 Set Parameter Agent & User ID
            </button>

            {status && (
              <div className="text-gray-700 mt-2 text-sm">{status}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
