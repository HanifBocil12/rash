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
  const [excelPath, setExcelPath] = useState('');

  const user = JSON.parse(localStorage.getItem("user")) || {};
  const userId = user.id;
  const token = user.token;

  const HEADERS = token ? { 'Authorization': `Bearer ${token}` } : {};

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
      const response = await fetch(`${apiUrl.trim()}/${userId}/state`, {
        headers: HEADERS,
      });
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
        body: JSON.stringify({
          task,
          start_row: startRow,
          excel_path: excelPath
        }),
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

      {/* Wrapper LUAR — tidak dipakai margin kiri */}
      <div className="relative z-10 min-h-screen bg-white/40 py-6 px-3 md:py-8 md:px-4">

        {/* WRAPPER CARD — INI yang diberi md:ml-64 & md:pt-16 */}
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md p-4 md:p-8 md:ml-64 md:pt-16">

          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">⬇️ PDF, Search & Sheet Batal</h1>
          <p className="text-gray-600 mb-6">
            Gunakan tombol di bawah untuk mengirim perintah ke Railway agent agar menjalankan proses otomatis yang diinginkan.
          </p>

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

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Masukkan Excel Path:
            </label>
            <input
              type="text"
              value={excelPath}
              onChange={(e) => setExcelPath(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="C:\\path\\to\\file.xlsx"
            />
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-3 flex items-center">
              <span className="mr-2">📕</span> Langkah 1 — Jalankan PDF Batal
            </h2>
            <button
              onClick={() => handleTrigger('batal', setLoadingPdf, `PDF Batal berhasil dikirim! (mulai dari baris ${startRow || 'otomatis'})`)}
              disabled={loadingPdf}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
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
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-3 flex items-center">
              <span className="mr-2">🔍</span> Langkah 2 — Jalankan Search Batal
            </h2>
            <button
              onClick={() => handleTrigger('search_batal', setLoadingSearch, `Search Batal berhasil dikirim! (mulai dari baris ${startRow || 'otomatis'})`)}
              disabled={loadingSearch}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
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
