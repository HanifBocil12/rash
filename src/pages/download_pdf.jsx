// src/pages/download_pdf.jsx
import { useState, useEffect } from 'react';
import { Clock, Zap, AlertTriangle, CheckCircle } from 'lucide-react';
import Liquid from '../components/liquid.jsx';

export default function DownloadPDFPage() {
  const [apiUrl, setApiUrl] = useState('https://api-web.up.railway.app');
  const [agentStatus, setAgentStatus] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [loadingTrigger, setLoadingTrigger] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchAgentStatus();
    const interval = setInterval(fetchAgentStatus, 5000);
    return () => clearInterval(interval);
  }, [apiUrl]);

  const fetchAgentStatus = async () => {
    setLoadingStatus(true);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    try {
      const response = await fetch(`${apiUrl.trim()}/state`, { signal: controller.signal });
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
      if (error.name === 'AbortError') {
        setMessage({ type: 'error', text: 'Request timeout' });
      } else {
        setMessage({ type: 'error', text: error.message || 'Gagal menghubungi API' });
      }
    } finally {
      clearTimeout(timeout);
      setLoadingStatus(false);
    }
  };

  const handleTrigger = async () => {
    setLoadingTrigger(true);
    setMessage({ type: '', text: '' });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(`${apiUrl.trim()}/trigger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task: 'perfect' }),
        signal: controller.signal
      });

      if (!response.ok) {
        setMessage({ type: 'error', text: `HTTP ${response.status}` });
        return;
      }

      const data = await response.json();
      if (data.status === 'success') {
        setMessage({ type: 'success', text: 'Perintah dikirim! Agent akan menjalankan perfecfast.py.' });
      } else if (data.status === 'busy') {
        setMessage({ type: 'warning', text: 'Agent sedang sibuk menjalankan task lain.' });
      } else {
        setMessage({ type: 'error', text: data.message || 'Gagal mengirim perintah.' });
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        setMessage({ type: 'error', text: 'Request timeout' });
      } else {
        setMessage({ type: 'error', text: error.message || 'Gagal menghubungi Railway API.' });
      }
    } finally {
      clearTimeout(timeout);
      setLoadingTrigger(false);
    }
  };

  const getStatusDisplay = () => {
    if (!agentStatus) return null;

    if (agentStatus.flag === 'RUN') {
      return (
        <div className="flex items-center space-x-2 p-3 bg-yellow-50 rounded-lg">
          <Clock className="w-5 h-5 text-yellow-600" />
          <div>
            <p className="font-medium text-yellow-700">Agent sedang berjalan</p>
            <p className="text-xs text-gray-600">Task: {agentStatus.last_task || 'Tidak ada'}</p>
          </div>
        </div>
      );
    }

    if (agentStatus.flag === 'IDLE') {
      return (
        <div className="flex items-center space-x-2 p-3 bg-green-50 rounded-lg">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <div>
            <p className="font-medium text-green-700">Agent siap menerima perintah</p>
            <p className="text-xs text-gray-600">Status: IDLE</p>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
        <AlertTriangle className="w-5 h-5 text-blue-600" />
        <div>
          <p className="font-medium text-blue-700">Status agent tidak diketahui</p>
          <p className="text-xs text-gray-600">Flag: {agentStatus.flag}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
       <Liquid />
      <div className="relative z-10 min-h-screen bg-white/50 py-8 px-4">
        <div className="w-full max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
            <div className="flex items-center mb-4">
              <div className="bg-blue-100 p-2 rounded-lg mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">PDF Selesai</h1>
            </div>
            
            <p className="text-gray-600 mb-6">
              Klik tombol di bawah untuk memberi sinyal ke agent lokal melalui Railway API agar menjalankan{' '}
              <code className="bg-gray-100 px-1 rounded">perfecfast.py</code>.
            </p>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Masukkan URL Railway API:
              </label>
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
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span> Status Agent
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

            <div className="border-t pt-6 mt-6">
              <button
                onClick={handleTrigger}
                disabled={loadingTrigger}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loadingTrigger ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Mengirim sinyal...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    <span>Jalankan Downloader PDF via Agent</span>
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