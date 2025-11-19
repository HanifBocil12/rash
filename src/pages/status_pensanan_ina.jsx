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
  const [excelPath, setExcelPath] = useState('');
  const [loadingExcelPath, setLoadingExcelPath] = useState(false);
  const canvasRef = useRef(null);

  const user = JSON.parse(localStorage.getItem("user")) || {};
  const userId = user.id;
  const token = user.token;
  const HEADERS = token ? { 'Authorization': `Bearer ${token}` } : {};

  // ============================= LIQUID
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

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();

        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 1.5);
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

  // ============================= FETCH
  useEffect(() => {
    if (!userId) return;
    fetchAgentStatus();
    const interval = setInterval(fetchAgentStatus, 5000);
    return () => clearInterval(interval);
  }, [apiUrl, userId]);

  const fetchAgentStatus = async () => {
    if (!userId) return;
    setLoadingStatus(true);
    try {
      const response = await fetch(`${apiUrl.trim()}/${userId}/state`, { headers: HEADERS });
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
    if (!userId) return;
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const response = await fetch(`${apiUrl.trim()}/${userId}/trigger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...HEADERS },
        body: JSON.stringify({ task }),
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

  const handleSetExcelPath = async () => {
    if (!userId || !excelPath.trim()) return;
    setLoadingExcelPath(true);
    setMessage({ type: '', text: '' });
    try {
      const response = await fetch(`${apiUrl.trim()}/${userId}/excel_path`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...HEADERS },
        body: JSON.stringify({ path: excelPath.trim() }),
      });

      const data = await response.json();
      if (response.ok && data.status === 'success') {
        setMessage({ type: 'success', text: `Excel path berhasil disimpan: ${data.excel_path}` });
      } else {
        setMessage({ type: 'error', text: data.message || 'Gagal menyimpan Excel path.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Gagal menghubungi Railway API.' });
    } finally {
      setLoadingExcelPath(false);
    }
  };

  const getStatusDisplay = () => {
    if (!agentStatus) return null;

    if (agentStatus.flag === 'RUN') {
      return (
        <div className="flex items-center space-x-2 text-yellow-700 bg-yellow-50 p-3 rounded-lg">
          <Clock className="w-5 h-5" />
          <span><strong>Agent sedang berjalan</strong> (flag = RUN)</span>
        </div>
      );
    }

    if (agentStatus.flag === 'IDLE') {
      return (
        <div className="flex items-center space-x-2 text-green-700 bg-green-50 p-3 rounded-lg">
          <CheckCircle className="w-5 h-5" />
          <span><strong>Agent siap menerima perintah</strong> (flag = IDLE)</span>
        </div>
      );
    }

    return (
      <div className="flex items-center space-x-2 text-blue-700 bg-blue-50 p-3 rounded-lg">
        <AlertCircle className="w-5 h-5" />
        <span>Status agent tidak diketahui: {agentStatus.flag}</span>
      </div>
    );
  };

  // ============================= UI (SUDAH SAMA PERSIS DAFTAR_BATAL!)
  return (
    <div className="relative min-h-screen overflow-hidden">

      <canvas
        ref={canvasRef}
        className="fixed inset-0 z-0"
        style={{ background: '#f8f9fa' }}
      />

      <div className="
        relative z-10 min-h-screen bg-white/40 
        py-6 px-3 md:py-8 md:px-4
        flex items-center sm:block
      ">
        
        <div className="w-full max-w-2xl mx-auto bg-white/90 rounded-xl mt-10 shadow-md p-4 md:p-8 backdrop-blur-md">

          <h1 className="text-xl md:text-3xl font-bold text-gray-800 mb-2">
            📄 Document Contract
          </h1>

          <p className="text-gray-600 mb-4 md:mb-6 text-sm md:text-base">
            Kirim perintah ke Railway Agent untuk memproses Excel dan upload Sheet secara otomatis.
          </p>

          {/* INPUT API */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">URL Railway API:</label>
            <input
              type="text"
              value={apiUrl}
              disabled
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          {/* EXCEL PATH */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Masukkan Path Excel:</label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={excelPath}
                onChange={(e) => setExcelPath(e.target.value)}
                placeholder="/path/to/file.xlsx"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
              />
              <button
                onClick={handleSetExcelPath}
                disabled={loadingExcelPath}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg disabled:opacity-70"
              >
                {loadingExcelPath ? "..." : "Simpan"}
              </button>
            </div>
          </div>

          {/* STATUS */}
          <div className="mb-6">
            <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-3 flex items-center">
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

          {/* XLS */}
          <div className="mb-6">
            <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-3 flex items-center">
              <span className="mr-2">🧩</span> Langkah 1 — Jalankan Excel Checker
            </h2>

            <button
              onClick={() =>
                handleTrigger('xls', setLoadingXls, 'Perintah XLS Checker berhasil dikirim!')
              }
              disabled={loadingXls}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center space-x-2 disabled:opacity-70"
            >
              {loadingXls ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Mengirim...</span>
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  <span>Jalankan XLS Checker</span>
                </>
              )}
            </button>
          </div>

          {/* SHEET */}
          <div className="mb-6">
            <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-3 flex items-center">
              <span className="mr-2">📊</span> Langkah 2 — Jalankan Sheet Uploader
            </h2>

            <p className="text-gray-600 mb-3 text-sm">Pastikan XLS sudah selesai.</p>

            <button
              onClick={() =>
                handleTrigger('sheet', setLoadingSheet, 'Perintah Sheet Uploader berhasil dikirim!')
              }
              disabled={loadingSheet}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center space-x-2 disabled:opacity-70"
            >
              {loadingSheet ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Mengirim...</span>
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  <span>Jalankan Sheet Uploader</span>
                </>
              )}
            </button>
          </div>

          {/* MESSAGE */}
          {message.text && message.type !== 'error' && (
            <div className={`mt-4 p-3 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-50 text-green-700'
                : 'bg-blue-50 text-blue-700'
            }`}>
              {message.text}
            </div>
          )}

          <div className="mt-6 md:mt-8 pt-4 md:pt-6 border-t text-center text-gray-500 text-xs md:text-sm">
            Dibuat dengan ❤️ menggunakan <strong>React</strong> & <strong>Tailwind CSS</strong>
          </div>

        </div>
      </div>
    </div>
  );
}
