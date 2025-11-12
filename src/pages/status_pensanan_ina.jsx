import Sidebar from '../components/sidebar.jsx';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, Clock, Zap, AlertTriangle } from 'lucide-react';

export default function App() {
  const [apiUrl, setApiUrl] = useState('https://api-web.up.railway.app');
  const [agentStatus, setAgentStatus] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [loadingXls, setLoadingXls] = useState(false);
  const [loadingSheet, setLoadingSheet] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Fetch agent status on load and periodically
  useEffect(() => {
    fetchAgentStatus();
    const interval = setInterval(fetchAgentStatus, 5000);
    return () => clearInterval(interval);
  }, [apiUrl]);

  const fetchAgentStatus = async () => {
    setLoadingStatus(true);
    try {
      const response = await fetch(`${apiUrl.trim()}/state`, { timeout: 5000 });
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
        body: JSON.stringify({ task }),
        timeout: 10000,
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
          <span><strong>Agent sedang berjalan</strong> (flag = RUN)</span>
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
    <div className="relative min-h-screen bg-gray-50 overflow-hidden">
      {/* 🔮 Liquid Animated Background */}
      <motion.div
        className="absolute inset-0 -z-10 overflow-hidden"
        animate={{
          backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: 'linear',
        }}
        style={{
          background: 'linear-gradient(120deg, #ff9a9e, #fad0c4, #fcb69f)',
          backgroundSize: '400% 400%',
          filter: 'blur(100px)',
          opacity: 0.6,
        }}
      />

      {/* 🧱 Main Card */}
      <div className="relative z-10 max-w-2xl mx-auto bg-white rounded-xl shadow-md p-6 md:p-8 mt-10 mb-10">
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

        {/* Langkah 1 */}
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

        {/* Langkah 2 */}
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
            message.type === 'success'
              ? 'bg-green-50 text-green-700'
              : message.type === 'warning'
              ? 'bg-yellow-50 text-yellow-700'
              : 'bg-blue-50 text-blue-700'
          }`}>
            {message.text}
          </div>
        )}

        <div className="mt-8 pt-6 border-t text-center text-gray-500 text-sm">
          Dibuat dengan ❤️ menggunakan <strong>React</strong> & <strong>Tailwind CSS</strong>
        </div>
      </div>
    </div>
  );
}
