// src/pages/download_pdf.jsx
import { useState, useEffect } from 'react';
import { Clock, Zap, AlertTriangle, CheckCircle } from 'lucide-react';

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
        <div className="flex items-center space-x-3 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
          <Clock className="w-6 h-6 text-yellow-600" />
          <div>
            <p className="font-medium text-yellow-700">Agent sedang berjalan</p>
            <p className="text-sm text-gray-600">Task: {agentStatus.last_task || 'Tidak ada'}</p>
          </div>
        </div>
      );
    }

    if (agentStatus.flag === 'IDLE') {
      return (
        <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-xl border border-green-200">
          <CheckCircle className="w-6 h-6 text-green-600" />
          <div>
            <p className="font-medium text-green-700">Agent siap menerima perintah</p>
            <p className="text-sm text-gray-600">Status: IDLE</p>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
        <AlertTriangle className="w-6 h-6 text-blue-600" />
        <div>
          <p className="font-medium text-blue-700">Status agent tidak diketahui</p>
          <p className="text-sm text-gray-600">Flag: {agentStatus.flag}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
        <div className="flex items-center mb-6">
          <div className="bg-blue-100 p-3 rounded-xl mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800">PDF Selesai</h1>
        </div>
        
        <p className="text-gray-600 mb-6 text-lg leading-relaxed">
          Klik tombol di bawah untuk memberi sinyal ke agent lokal melalui Railway API agar menjalankan <code className="bg-gray-100 px-2 py-1 rounded">perfecfast.py</code>.
        </p>

        <div className="mb-8">
          <label className="block text-lg font-medium text-gray-700 mb-3">
            Masukkan URL Railway API:
          </label>
          <input
            type="text"
            value={apiUrl}
            onChange={(e) => setApiUrl(e.target.value)}
            className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-orange-200 focus:border-orange-500 text-lg"
            placeholder="https://api-web.up.railway.app"
          />
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
            <span className="w-3 h-3 bg-green-500 rounded-full mr-3"></span> Status Agent
          </h2>

          {loadingStatus ? (
            <div className="p-6 bg-gray-50 rounded-xl text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-orange-500 border-t-transparent mx-auto mb-3"></div>
              <p className="text-gray-600">Memuat status agent...</p>
            </div>
          ) : message.type === 'error' ? (
            <div className="p-5 bg-red-50 rounded-xl border border-red-200">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-6 h-6 text-red-500" />
                <span className="text-red-700">Tidak dapat mengambil status agent ({message.text})</span>
              </div>
            </div>
          ) : (
            getStatusDisplay()
          )}
        </div>

        <div className="border-t pt-6 mt-6">
          <button
            onClick={handleTrigger}
            disabled={loadingTrigger}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center space-x-3 text-lg disabled:opacity-80 disabled:cursor-not-allowed"
          >
            {loadingTrigger ? (
              <>
                <div className="animate-spin rounded-full h-7 w-7 border-3 border-white border-t-transparent"></div>
                <span>Mengirim sinyal...</span>
              </>
            ) : (
              <>
                <Zap className="w-6 h-6" />
                <span>Jalankan Downloader PDF via Agent</span>
              </>
            )}
          </button>
        </div>

        {message.text && message.type !== 'error' && (
          <div
            className={`mt-6 p-5 rounded-xl ${
              message.type === 'success'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="mt-10 pt-6 border-t text-center text-gray-500 text-base">
          <p>Dibuat dengan ❤️ menggunakan <strong>React</strong> & <strong>Tailwind CSS</strong></p>
        </div>
      </div>
    </div>
  );
}