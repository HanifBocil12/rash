import { useState } from 'react';
import { AlertCircle, CheckCircle, AlertTriangle, Zap } from 'lucide-react';
import Liquid from '../components/liquid.jsx';

export default function Gabung_Pdf() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [debugOpen, setDebugOpen] = useState(false);
  const [inputFolder, setInputFolder] = useState('');
  const [outputFolder, setOutputFolder] = useState('C:\\web\\zip\\Perlengkapan\\download\\output');

  const user = JSON.parse(localStorage.getItem("user")) || {};
  const userId = user.id;
  const token = user.token;
  const API_BASE = "https://api-web.up.railway.app";
  const HEADERS = token ? { 'Authorization': `Bearer ${token}` } : {};

  const handleRunScript = async () => {
    if (!userId) return;
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch(`${API_BASE}/${userId}/trigger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...HEADERS },
        body: JSON.stringify({
          task: 'gabung',
          input_folder: inputFolder,
          output_folder: outputFolder
        }),
      });

      const data = await response.json();

      if (response.ok && data.status === 'success') {
        setMessage({
          type: 'success',
          text: `✅ Task '${data.task}' berhasil dikirim ke agent!`,
        });
      } else {
        throw new Error(data.message || 'Gagal mengirim task ke agent.');
      }

    } catch (error) {
      setMessage({
        type: 'error',
        text: `Gagal menghubungi API: ${error.message}`,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <Liquid />

      <div className="relative z-10 min-h-screen bg-white/40 py-6 px-3 flex items-center sm:block">
        <div className="w-full max-w-2xl mx-auto mt-10 bg-white/90 rounded-xl shadow-md p-6 md:p-8 backdrop-blur-md">

          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">📎 Gabung PDF</h1>

          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-3 py-2 md:px-4 md:py-3 rounded-lg mb-6 text-sm md:text-base">
            Gunakan tombol di bawah untuk menjalankan script <code className="bg-blue-100 px-1 rounded">gabung.py</code> melalui <strong>Railway API</strong>.
          </div>

          <div className="mb-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Folder Input PDF:</label>
              <input
                type="text"
                value={inputFolder}
                onChange={(e) => setInputFolder(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="C:\\web\\zip\\Perlengkapan\\download\\hal 1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Folder Output PDF:</label>
              <input
                type="text"
                value={outputFolder}
                onChange={(e) => setOutputFolder(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                disabled
              />
            </div>
          </div>

          <div className="mb-6">
            <button
              onClick={() => setDebugOpen(!debugOpen)}
              className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 flex justify-between items-center"
            >
              <span className="flex items-center">
                <Zap className="w-4 h-4 mr-2" />
                ⚙️ Debug Info
              </span>
              <span>{debugOpen ? '▲' : '▼'}</span>
            </button>

            {debugOpen && (
              <div className="mt-3 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
                <div>API Endpoint: {API_BASE}/{userId}/trigger</div>
                <div>Task: gabung</div>
                <div>Python Script Path: /app/gabung.py</div>
              </div>
            )}
          </div>

          <div className="mb-6">
            <button
              onClick={handleRunScript}
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Mengirim task ke API...</span>
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  <span>Jalankan Gabung PDF</span>
                </>
              )}
            </button>
          </div>

          {message.text && (
            <div className={`mt-4 p-3 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {message.type === 'success' ? (
                <span className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {message.text}
                </span>
              ) : (
                <span className="flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  {message.text}
                </span>
              )}
            </div>
          )}

          <div className="mt-6 md:mt-8 pt-4 md:pt-6 border-t text-center text-gray-500 text-xs md:text-sm">
            Dibuat dengan ❤️ menggunakan <strong>Python</strong> & <strong>Railway API</strong>
          </div>

        </div>
      </div>
    </div>
  );
}
