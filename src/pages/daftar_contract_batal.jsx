import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Clock, Zap, AlertTriangle } from 'lucide-react';
import Liquid from '../components/liquid.jsx';

export default function App() {
  const [apiUrl, setApiUrl] = useState('https://api-web.up.railway.app');
  const [agentStatus, setAgentStatus] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [loadingSheet, setLoadingSheet] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [startRow, setStartRow] = useState(0);
  const [excelPath, setExcelPath] = useState(''); // state baru untuk excel_path

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
    if (!excelPath) {
      setMessage({ type: 'error', text: 'Harap masukkan Excel path terlebih dahulu.' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const response = await fetch(`${apiUrl.trim()}/trigger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task, start_row: startRow, excel_path: excelPath }),
        timeout: 10000
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
      <Liquid />
      <div className="relative z-10 min-h-screen bg-white/40 py-8 px-4">        
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md p-6 md:p-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">⬇️ PDF, Search & Sheet Batal</h1>
          <p className="text-gray-600 mb-6">
            Gunakan tombol di bawah untuk mengirim perintah ke Railway agent agar menjalankan proses otomatis yang diinginkan.
          </p>

          {/* Input API */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Masukkan URL Railway API:
            </label>
            <input
              type="text"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              disabled
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="https://api-web.up.railway.app"
            />
          </div>

          {/* Input Excel Path */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Masukkan Excel Path:
            </label>
            <input
              type="text"
              value={excelPath}
              onChange={(e) => setExcelPath(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="C:\path\to\file.xlsx"
            />
          </div>

          {/* Input start row */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Masukkan baris mulai (biarkan 0 untuk otomatis):
            </label>
            <input
              type="number"
              min="0"
              value={startRow}
              onChange={(e) => setStartRow(parseInt(e.target.value) || 0)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          {/* Buttons */}
          <div className="mb-6">
            <button
              onClick={() => handleTrigger('batal', setLoadingPdf, `PDF Batal berhasil dikirim! (mulai dari baris ${startRow || 'otomatis'})`)}
              disabled={loadingPdf}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed mb-3"
            >
              {loadingPdf ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Mengirim perintah...</span>
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  <span>Jalankan PDF Batal via Agent</span>
                </>
              )}
            </button>

            <button
              onClick={() => handleTrigger('search_batal', setLoadingSearch, `Search Batal berhasil dikirim! (mulai dari baris ${startRow || 'otomatis'})`)}
              disabled={loadingSearch}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed mb-3"
            >
              {loadingSearch ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Mengirim perintah...</span>
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  <span>Jalankan Search Batal via Agent</span>
                </>
              )}
            </button>

            <button
              onClick={() => handleTrigger('sheet_batal', setLoadingSheet, `Sheet Batal berhasil dikirim! (mulai dari baris ${startRow || 'otomatis'})`)}
              disabled={loadingSheet}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loadingSheet ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Mengirim perintah...</span>
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  <span>Jalankan Sheet Batal via Agent</span>
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
            Dibuat dengan ❤️ menggunakan <strong>Python</strong> & <strong>Streamlit</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
