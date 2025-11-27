import { useState, useEffect } from 'react';
import JSZip from "jszip/dist/jszip.min.js";
import { saveAs } from "file-saver";
import Liquid from '../components/liquid.jsx';

export default function Perlengkapan() {
  const fileUrl = "/Perlengkapan.rar";
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

    const rarRes = await fetch(fileUrl);
    const rarData = await rarRes.arrayBuffer();
    zip.file("Perlengkapan.rar", rarData);

    const user = JSON.parse(localStorage.getItem("user")) || {};
    zip.file("user.json", JSON.stringify(user, null, 2));

    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, "web.zip");
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <Liquid />

      {/* === WRAPPER SAMA PERSIS SEPERTI home.jsx === */}
      <div
        className="
          relative z-10 min-h-screen bg-white/40
          py-6 px-3 md:py-8 md:px-4
          flex items-center sm:block
        "
      >
        <div className="w-full max-w-4xl mx-auto">

          {/* === CARD SAMA PERSIS STYLE NYA SEPERTI home.jsx === */}
          <div className="bg-white/90 rounded-xl shadow-md p-4 md:p-8 backdrop-blur-md">

            <h1 className="text-xl md:text-3xl font-bold text-gray-800 mb-2">
              ⬇️ Download Perlengkapan
            </h1>

            <p className="text-gray-600 mb-4 md:mb-6 text-sm md:text-base">
              Download paket perlengkapan dalam bentuk ZIP yang berisi file <strong>Perlengkapan.rar</strong> 
              beserta data <strong>user.json</strong> Anda.
            </p>

            <div className="mb-6">
              <div className="text-gray-600 text-sm md:text-base mb-2">
                📁 Path file: /Perlengkapan.rar
              </div>

              <div className="bg-orange-50 border border-orange-200 text-green-700 px-3 py-2 md:px-4 md:py-3 rounded-lg mb-4 text-sm md:text-base">
                ✅ File ditemukan
              </div>

              {userId && (
                <div className="text-blue-600 text-sm md:text-base mb-3">
                  👤 User ID: {userId}
                </div>
              )}

              {/* Tombol download ZIP */}
              <button
                onClick={downloadZip}
                className="
                  w-full bg-orange-500 hover:bg-orange-600
                  text-white font-medium py-3 px-4 rounded-lg
                  transition-colors duration-200
                  text-sm md:text-base
                  mb-2
                "
              >
                💾 Download ZIP (web.rar + user.json)
              </button>

              {/* Tombol baru untuk download user.json */}
              <button
                onClick={() => {
                  const user = JSON.parse(localStorage.getItem("user")) || {};
                  const blob = new Blob([JSON.stringify(user, null, 2)], { type: "application/json" });
                  saveAs(blob, "user.json");
                }}
                className="
                  w-full bg-blue-500 hover:bg-blue-600
                  text-white font-medium py-3 px-4 rounded-lg
                  transition-colors duration-200
                  text-sm md:text-base
                "
              >
                💾 Download user.json
              </button>
            </div>

            <div className="mt-6 md:mt-8 pt-4 md:pt-6 border-t text-center text-gray-500 text-xs md:text-sm">
              Dibuat dengan ❤️ menggunakan <strong>Python</strong> & <strong>Streamlit</strong>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}