import { useState, useEffect } from 'react';
import Liquid from '../components/liquid.jsx';

export default function Perlengkapan() {
  const fileUrl = "/web.rar";

  const [userId, setUserId] = useState(null);

  useEffect(() => {
    async function fetchUserId() {
      try {
        const token = localStorage.getItem("token");  // misal token disimpan di sini
        const res = await fetch("https://api-web.up.railway.app/userid/get_user_id", {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (data.status === "success") {
          setUserId(data.user_id);
        } else {
          console.error("Gagal ambil user_id:", data.message);
        }
      } catch (err) {
        console.error("Error fetch user_id:", err);
      }
    }

    fetchUserId();
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden">
      <Liquid />

      <div className="relative z-10 min-h-screen bg-white/40 py-8 px-4">
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md p-6 md:p-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
            ⬇️ Download Perlengkapan
          </h1>
          
          <div className="mb-6">
            <div className="text-gray-600 mb-2">📁 Path file: /app/static/web.rar</div>
            
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
              ✅ File ditemukan
            </div>

            {userId && (
              <div className="text-blue-600 mb-2">
                👤 User ID: {userId}
              </div>
            )}

            <div className="text-blue-600 mb-2">
                👤 User ID: {userId}
              </div>
            
            <a
              href={fileUrl}
              download="web.rar"
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <span>💾 Download ZIP</span>
            </a>
          </div>

          <div className="mt-8 pt-6 border-t text-center text-gray-500 text-sm">
            Dibuat dengan ❤️ menggunakan <strong>Python</strong> & <strong>Streamlit</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
