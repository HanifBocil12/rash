import Sidebar from '../components/sidebar.jsx';
import { useState, useEffect, useRef } from 'react';
import { AlertCircle, CheckCircle, Clock, Zap, AlertTriangle } from 'lucide-react';

export default function App() {
  const [apiUrl, setApiUrl] = useState('https://api-web.up.railway.app');
  const [agentStatus, setAgentStatus] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [loadingXls, setLoadingXls] = useState(false);
  const [loadingSheet, setLoadingSheet] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
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

  // =============================
  // 🚀 FETCH STATUS & HANDLERS
  // =============================
  useEffect(() => {
    fetchAgentStatus();
    const interval = setInterval(fetchAgentStatus, 5000);
    return () => clearInterval(interval);
  }, [apiUrl]);

  const fetchAgentStatus = async () => {
    setLoadingStatus(true);
    try {
      const response = await fetch(`${apiUrl.trim()}/state`);
      if (response.ok) {
        const data = await response.json();
        setAgentStatus(data);
        setMessage({ type: 'success', text: '' });
      } else {
        setAgentStatus(null);
        setMessage({ type: 'error', text: `HTTP ${response.status}` });
      }
    } catch (error) {
      setAgentStatus(null);
      setMessage({ type: 'error', text: error.message || 'Gagal menghubungi API' });
    } finally {
      setLoadingStatus(false);
    }
  };

  const handleTrigger = async (task, setLoading, successMessage) => {
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const response = await fetch(`${apiUrl.trim()}/trigger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task: task }),
      });
      const data = await response.json();
      if (response.ok && data.status === 'success') {
        setMessage({ type: 'success', text: successMessage });
      } else {
        setMessage({ type: 'error', text: data.message || 'Gagal mengirim perintah.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Gagal menghubungi Railway API.' });
    } finally {
      setLoading(false);
    }
  };

  const getStatusDisplay = () => {
    if (!agentStatus) return null;
    if (agentStatus.flag === 'RUN')
      return (
        <div className="flex items-center space-x-2 text-yellow-700 bg-yellow-50 p-3 rounded-lg">
          <Clock className="w-5 h-5" />
          <span><strong>Agent sedang berjalan</strong> (flag = RUN)</span>
        </div>
      );
    if (agentStatus.flag === 'IDLE')
      return (
        <div className="flex items-center space-x-2 text-green-700 bg-green-50 p-3 rounded-lg">
          <CheckCircle className="w-5 h-5" />
          <span><strong>Agent siap menerima perintah</strong> (flag = IDLE)</span>
        </div>
      );
    return (
      <div className="flex items-center space-x-2 text-blue-700 bg-blue-50 p-3 rounded-lg">
        <AlertCircle className="w-5 h-5" />
        <span>Status agent tidak diketahui: {agentStatus.flag}</span>
      </div>
    );
  };

  // =============================
  // 🧩 UI
  // =============================
  return (
    <div className="relative min-h-screen overflow-hidden pl-4 m-0">
      {/* 🔸 Background canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 z-0"
        style={{ background: '#f8f9fa' }}
      />

      {/* 🔸 Foreground content */}
      <div className="fixed z-10 inset-0 min-h-screen bg-gray-500/30 backdrop-blur-md">
            <div className="relative z-10 min-h-screen py-8 px-4 flex flex-col items-center">
                <div className="max-w-2xl w-full bg-white/90 backdrop-blur-md rounded-xl shadow-md p-6 md:p-8">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">📄 Document Contract</h1>
                <p className="text-gray-600 mb-6">
                    Gunakan tombol di bawah untuk mengirim perintah ke agent Railway agar menjalankan proses pemeriksaan dokumen kontrak otomatis.
                </p>

                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Masukkan URL Railway API:</label>
                    <input
                    type="text"
                    value={apiUrl}
                    onChange={(e) => setApiUrl(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="https://api-web.up.railway.app"
                    />
                </div>

                <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-3 flex items-center">
                    <span className="mr-2">🟢</span> Status Agent
                    </h2>

                    {loadingStatus ? (
                    <div className="text-gray-500">Memuat status...</div>
                    ) : message.type === 'error' ? (
                    <div className="flex items-center space-x-2 text-red-700 bg-red-50 p-3 rounded-lg">
                        <AlertTriangle className="w-5 h-5" />
                        <span>Tidak dapat mengambil status agent ({message.text})</span>
                    </div>
                    ) : (
                    getStatusDisplay()
                    )}
                </div>

                <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-3 flex items-center">
                    <span className="mr-2">🧩</span> Langkah 1 — Jalankan Excel Checker (xls.py)
                    </h2>
                    <button
                    onClick={() =>
                        handleTrigger('xls', setLoadingXls, 'Perintah XLS Checker berhasil dikirim ke Railway agent!')
                    }
                    disabled={loadingXls}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors disabled:opacity-70"
                    >
                    {loadingXls ? (
                        <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Mengirim perintah...</span>
                        </>
                    ) : (
                        <>
                        <Zap className="w-5 h-5" />
                        <span>Jalankan XLS Checker via Agent</span>
                        </>
                    )}
                    </button>
                </div>

                <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-3 flex items-center">
                    <span className="mr-2">📊</span> Langkah 2 — Jalankan Sheet Uploader (sheet.py)
                    </h2>
                    <p className="text-gray-600 mb-3 text-sm">Pastikan XLS Checker sudah selesai sebelum menjalankan ini.</p>
                    <button
                    onClick={() =>
                        handleTrigger('sheet', setLoadingSheet, 'Perintah Sheet Uploader berhasil dikirim ke Railway agent!')
                    }
                    disabled={loadingSheet}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors disabled:opacity-70"
                    >
                    {loadingSheet ? (
                        <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Mengirim perintah...</span>
                        </>
                    ) : (
                        <>
                        <Zap className="w-5 h-5" />
                        <span>Jalankan Sheet Uploader via Agent</span>
                        </>
                    )}
                    </button>
                </div>

                {message.text && message.type !== 'error' && (
                    <div
                    className={`mt-4 p-3 rounded-lg ${
                        message.type === 'success'
                        ? 'bg-green-50 text-green-700'
                        : message.type === 'warning'
                        ? 'bg-yellow-50 text-yellow-700'
                        : 'bg-blue-50 text-blue-700'
                    }`}
                    >
                    {message.text}
                    </div>
                )}

                <div className="mt-8 pt-6 border-t text-center text-gray-500 text-sm">
                    Dibuat dengan ❤️ menggunakan <strong>React</strong> & <strong>Tailwind CSS</strong>
                </div>
                </div>
            </div>
      </div>
    </div>
  );
}