// C:\raja iblis\home.jsx
import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Clock, Zap, AlertTriangle } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md p-6 md:p-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">📊 Excel Checker Dashboard</h1>
        <p className="text-gray-600 mb-6">
          Selamat datang di <strong>Excel Checker</strong> — aplikasi berbasis <em>Streamlit</em> untuk membantu
          mengecek hal-hal yang berhubungan dengan data Inaproc secara otomatis, saya raja ai.
        </p>

        <p className="text-gray-700 mb-4">
          Gunakan menu di bawah untuk berpindah ke halaman:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-gray-700 mb-6">
          <li><strong>📄 Document Contract</strong> – menampilkan daftar dan pengecekan dokumen kontrak.</li>
          <li><strong>📋 Daftar Project Inaproc</strong> – menjalankan otomatisasi dan analisis project dari Inaproc.</li>
        </ul>

        <div className="bg-orange-50 border border-orange-200 text-orange-700 px-4 py-3 rounded-lg mb-8">
          Gunakan menu navigasi di atas untuk memulai proses pemeriksaan data.
        </div>

        <div className="mt-8 pt-6 border-t text-center text-gray-500 text-sm">
          Dibuat dengan ❤️ menggunakan <strong>Python</strong> & <strong>Streamlit</strong>
        </div>
      </div>
    </div>
  );
}