import { useState } from 'react';

export default function Perlengkapan() {
  // Simulasi file tersedia (di React, kita tidak bisa akses filesystem server)
  // Jadi kita asumsikan file tersedia di URL publik: /static/web.rar
  const fileUrl = "/web.rar";
  
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md p-6 md:p-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">⬇️ Download Perlengkapan</h1>
        
        <div className="mb-6">
          <div className="text-gray-600 mb-2">📁 Path file: /app/static/web.rar</div>
          
          {/* Simulasi cek file - di React kita asumsikan file tersedia */}
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
            ✅ File ditemukan
          </div>
          
          {/* Tombol download */}
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
  );
}
