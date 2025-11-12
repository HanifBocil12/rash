// C:\raja iblis\home.jsx
import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Clock, Zap, AlertTriangle } from 'lucide-react';

export default function HomePage() {
  const canvasRef = useRef(null);
  // =============================
  // 💧 LIQUID BACKGROUND EFFECT
  // =============================
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();

    const particleCount = 80;
    const particles = [];
    const colors = [
      'rgba(234, 88, 12, 0.6)',
      'rgba(245, 98, 20, 0.5)',
      'rgba(220, 70, 5, 0.4)',
      'rgba(255, 105, 30, 0.5)',
    ];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 20 + 10,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Hubungkan partikel yang berdekatan
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[j].x - particles[i].x;
          const dy = particles[j].y - particles[i].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 120) {
            ctx.beginPath();
            ctx.strokeStyle = particles[i].color.replace(
              '0.6',
              (0.05 + (120 - distance) / 120 * 0.2).toString()
            );
            ctx.lineWidth = 0.3;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Gambar partikel
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();

        const gradient = ctx.createRadialGradient(
          p.x, p.y, 0,
          p.x, p.y, p.radius * 1.5
        );
        gradient.addColorStop(0, p.color);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.fill();

        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      }

      requestAnimationFrame(animate);
    }

    window.addEventListener('resize', resize);
    animate();

    return () => window.removeEventListener('resize', resize);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* 🔸 Background canvas */}
        <canvas
          ref={canvasRef}
          className="fixed inset-0 z-0"
          style={{ background: '#f8f9fa' }}
        />

      <div className="relative z-10 min-h-screen bg-gray-500/30 backdrop-blur-md py-8 px-4">
        <div className="w-full max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">📊 Excel Checker Dashboard</h1>
            <p className="text-gray-600 mb-6">
              Selamat datang di <strong>Excel Checker</strong> — aplikasi berbasis <em>Streamlit</em> untuk membantu
              mengecek hal-hal yang berhubungan dengan data Inaproc secara otomatis.
            </p>

            <p className="text-gray-700 mb-4">
              Gunakan menu di sebelah kiri untuk berpindah ke halaman:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-gray-700 mb-6">
              <li><strong>📄 Document Contract</strong> – menampilkan daftar dan pengecekan dokumen kontrak.</li>
              <li><strong>📋 Daftar Project Inaproc</strong> – menjalankan otomatisasi dan analisis project dari Inaproc.</li>
            </ul>

            <div className="bg-orange-50 border border-orange-200 text-orange-700 px-4 py-3 rounded-lg mb-8">
              Gunakan menu navigasi di sidebar untuk memulai proses pemeriksaan data.
            </div>

            <div className="mt-8 pt-6 border-t text-center text-gray-500 text-sm">
              Dibuat dengan ❤️ menggunakan <strong>Python</strong> & <strong>Streamlit</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}