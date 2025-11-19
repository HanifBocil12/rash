// C:\raja iblis\home.jsx
import { useState, useEffect, useRef } from 'react';
import { AlertCircle, CheckCircle, Clock, Zap, AlertTriangle } from 'lucide-react';
import Liquid from '../components/liquid.jsx';

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <Liquid />

      {/* 🔸 Konten foreground */}
      <div className="relative z-10 min-h-screen bg-white/40 py-6 px-3 md:py-8 md:px-4">
        <div className="w-full max-w-4xl mx-auto">

          <div className="bg-white/90 rounded-xl shadow-md 
            p-4 md:p-8 backdrop-blur-md">

            {/* 🔥 Heading: kecil di HP, normal di desktop */}
            <h1 className="text-xl md:text-3xl font-bold text-gray-800 mb-2">
              📊 Excel Checker Dashboard
            </h1>

            <p className="text-gray-600 mb-4 md:mb-6 text-sm md:text-base">
              Selamat datang di <strong>Excel Checker</strong> — aplikasi berbasis <em>Streamlit</em> 
              untuk membantu mengecek hal-hal yang berhubungan dengan data Inaproc secara otomatis.
            </p>

            <p className="text-gray-700 mb-3 md:mb-4 text-sm md:text-base">
              Gunakan menu di sebelah kiri untuk berpindah ke halaman:
            </p>

            {/* 🔥 List lebih rapat di HP */}
            <ul className="list-disc pl-4 md:pl-5 space-y-1.5 md:space-y-2 text-gray-700 mb-5 md:mb-6 text-sm md:text-base">
              <li><strong>📄 Document Contract</strong> – menampilkan daftar dan pengecekan dokumen kontrak.</li>
              <li><strong>📋 Daftar Project Inaproc</strong> – menjalankan otomatisasi dan analisis project dari Inaproc.</li>
            </ul>

            {/* 🔥 Box info lebih kecil di HP */}
            <div className="bg-orange-50 border border-orange-200 text-orange-700 
              px-3 py-2 md:px-4 md:py-3 rounded-lg mb-6 md:mb-8 text-sm md:text-base">
              Gunakan menu navigasi di sidebar untuk memulai proses pemeriksaan data.
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
