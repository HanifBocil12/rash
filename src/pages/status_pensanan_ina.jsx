import { useState, useEffect, useRef } from 'react';
import { AlertCircle, CheckCircle, Clock, Zap, AlertTriangle } from 'lucide-react';

export default function App() {
  const canvasRef = useRef(null);
  const [apiUrl, setApiUrl] = useState('https://api-web.up.railway.app    ');
  const [agentStatus, setAgentStatus] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [loadingXls, setLoadingXls] = useState(false);
  const [loadingSheet, setLoadingSheet] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Initialize liquid animation
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Orange liquid flow animation
    const flows = [];
    const flowCount = 8;
    
    for (let i = 0; i < flowCount; i++) {
      flows.push({
        x: Math.random() * canvas.width,
        y: -Math.random() * canvas.height,
        width: 15 + Math.random() * 30,
        height: 80 + Math.random() * 150,
        speed: 0.3 + Math.random() * 0.8,
        waveOffset: Math.random() * Math.PI * 2,
        opacity: 0.2 + Math.random() * 0.3
      });
    }
    
    let animationFrameId;
    const animate = () => {
      ctx.fillStyle = 'rgba(255, 245, 235, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      flows.forEach(flow => {
        flow.y += flow.speed;
        flow.waveOffset += 0.015;
        
        if (flow.y > canvas.height + flow.height) {
          flow.y = -flow.height;
          flow.x = Math.random() * canvas.width;
        }
        
        ctx.beginPath();
        const leftPoints = 15;
        const leftPath = [];
        for (let i = 0; i <= leftPoints; i++) {
          const progress = i / leftPoints;
          const y = flow.y + progress * flow.height;
          const wave = Math.sin(flow.waveOffset + progress * 3) * (flow.width * 0.25);
          const x = flow.x + wave;
          leftPath.push({ x, y });
        }
        
        const rightPath = [];
        for (let i = leftPoints; i >= 0; i--) {
          const progress = i / leftPoints;
          const y = flow.y + progress * flow.height;
          const wave = Math.sin(flow.waveOffset + progress * 3 + Math.PI) * (flow.width * 0.25);
          const x = flow.x + flow.width + wave;
          rightPath.push({ x, y });
        }
        
        if (leftPath.length > 0) {
          ctx.moveTo(leftPath[0].x, leftPath[0].y);
          for (let i = 1; i < leftPath.length; i++) {
            ctx.lineTo(leftPath[i].x, leftPath[i].y);
          }
          for (let i = 0; i < rightPath.length; i++) {
            ctx.lineTo(rightPath[i].x, rightPath[i].y);
          }
          ctx.closePath();
        }
        
        const gradient = ctx.createLinearGradient(
          flow.x, flow.y, 
          flow.x + flow.width, flow.y + flow.height
        );
        gradient.addColorStop(0, `rgba(255, 165, 0, ${flow.opacity * 0.8})`);
        gradient.addColorStop(0.5, `rgba(255, 100, 0, ${flow.opacity})`);
        gradient.addColorStop(1, `rgba(255, 69, 0, ${flow.opacity * 0.6})`);
        
        ctx.fillStyle = gradient;
        ctx.fill();
        
        ctx.beginPath();
        const highlightPoints = 8;
        for (let i = 0; i <= highlightPoints; i++) {
          const progress = i / highlightPoints;
          const y = flow.y + progress * flow.height;
          const wave = Math.sin(flow.waveOffset + progress * 3) * (flow.width * 0.1);
          const x = flow.x + flow.width * 0.3 + wave;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `rgba(255, 200, 150, ${flow.opacity * 0.6})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });
      
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Fetch agent status
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

      if (!response.ok) {
        setMessage({ type: 'error', text: `HTTP ${response.status}` });
        return;
      }

      const data = await response.json();
      if (data.status === 'success') {
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
    
    if (agentStatus.flag === 'RUN') {
      return (
        <div className="flex items-center space-x-2 text-yellow-700 bg-yellow-50 p-3 rounded-lg">
          <Clock className="w-5 h-5" />
          <span>
            <strong>Agent sedang berjalan</strong> (flag = RUN)
          </span>
        </div>
      );
    } else if (agentStatus.flag === 'IDLE') {
      return (
        <div className="flex items-center space-x-2 text-green-700 bg-green-50 p-3 rounded-lg">
          <CheckCircle className="w-5 h-5" />
          <span><strong>Agent siap menerima perintah</strong> (flag = IDLE)</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center space-x-2 text-blue-700 bg-blue-50 p-3 rounded-lg">
          <AlertCircle className="w-5 h-5" />
          <span>Status agent tidak diketahui: {agentStatus.flag}</span>
        </div>
      );
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Canvas Animasi di Latar Belakang */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full z-0"
      />

      {/* Konten Utama (UI) di Atas Canvas */}
      <div className="min-h-screen bg-gray-50 py-8 px-4 z-10 relative">
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md p-6 md:p-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">📄 Document Contract</h1>
          <p className="text-gray-600 mb-6">Gunakan tombol di bawah untuk mengirim perintah ke agent Railway agar menjalankan proses pemeriksaan dokumen kontrak otomatis.</p>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Masukkan URL Railway API:
            </label>
            <input
              type="text"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="https://api-web.up.railway.app        "
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

          {/* Langkah 1 - XLS Checker */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-3 flex items-center">
              <span className="mr-2">🧩</span> Langkah 1 — Jalankan Excel Checker (xls.py)
            </h2>
            <button
              onClick={() => handleTrigger('xls', setLoadingXls, 'Perintah XLS Checker berhasil dikirim ke Railway agent!')}
              disabled={loadingXls}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
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

          {/* Langkah 2 - Sheet Uploader */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-3 flex items-center">
              <span className="mr-2">📊</span> Langkah 2 — Jalankan Sheet Uploader (sheet.py)
            </h2>
            <p className="text-gray-600 mb-3 text-sm">
              Pastikan XLS Checker sudah selesai sebelum menjalankan ini.
            </p>
            <button
              onClick={() => handleTrigger('sheet', setLoadingSheet, 'Perintah Sheet Uploader berhasil dikirim ke Railway agent!')}
              disabled={loadingSheet}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
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
            <div className={`mt-4 p-3 rounded-lg ${
              message.type === 'success' ? 'bg-green-50 text-green-700' : 
              message.type === 'warning' ? 'bg-yellow-50 text-yellow-700' : 'bg-blue-50 text-blue-700'
            }`}>
              {message.text}
            </div>
          )}

          <div className="mt-8 pt-6 border-t text-center text-gray-500 text-sm">
            Dibuat dengan ❤️ menggunakan <strong>React</strong> & <strong>Tailwind CSS</strong>
          </div>
        </div>
      </div>
    </div>
  );
}