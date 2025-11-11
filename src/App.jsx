// src/App.jsx
import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/sidebar';
import HomePage from './pages/home';
import Login from './pages/login';
import DownloadPDFPage from './pages/download_pdf';
import StatusPesananIna from './pages/status_pensanan_ina';
import Perlengkapan from './pages/perlengkapan';

function App() {
  return (
    <Routes>
      {/* Route publik: tanpa sidebar */}
      <Route path="/" element={<Login />} />

      {/* Layout route: semua route protected dibungkus Sidebar */}
      <Route element={<Sidebar />}>
        <Route path="/home" element={<HomePage />} />
        <Route path="/download_pdf" element={<DownloadPDFPage />} />
        <Route path="/status_pensanan_ina" element={<StatusPesananIna />} />
        <Route path="/perlengkapan" element={<Perlengkapan />} />
        {/* Tambahkan route lain di sini */}
      </Route>
    </Routes>
  );
}

export default App;