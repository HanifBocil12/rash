import { useState, useEffect } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import Liquid from '../components/liquid.jsx';

export default function Perlengkapan() {
  const fileUrl = "/web.rar";
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    async function fetchUserId() {
      const user = JSON.parse(localStorage.getItem("user"));
      const token = user?.token;
      if (!token) return;
      try {
        const res = await fetch("https://api-web.up.railway.app/userid/get_user_id", {
          headers: { "Authorization": `Bearer ${token}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        if (data.status === "success") setUserId(data.user_id);
      } catch (err) {
        console.error(err);
      }
    }
    fetchUserId();
  }, []);

  const downloadZip = async () => {
    const zip = new JSZip();

    // 1️⃣ Ambil web.rar sebagai ArrayBuffer
    const rarRes = await fetch(fileUrl);
    const rarData = await rarRes.arrayBuffer();
    zip.file("web.rar", rarData);

    // 2️⃣ Ambil user.json dari localStorage
    const user = JSON.parse(localStorage.getItem("user")) || {};
    zip.file("user.json", JSON.stringify(user, null, 2));

    // 3️⃣ Generate ZIP dan trigger download
    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, "perlengkapan.zip");
  };

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

            {userId && <div className="text-blue-600 mb-2">👤 User ID: {userId}</div>}

            <button
              onClick={downloadZip}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 mb-4"
            >
              💾 Download ZIP (web.rar + user.json)
            </button>
          </div>

          <div className="mt-8 pt-6 border-t text-center text-gray-500 text-sm">
            Dibuat dengan ❤️ menggunakan <strong>Python</strong> & <strong>Streamlit</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
