import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/sidebar';
import HomePage from './pages/home.jsx';
import Login from './pages/login.jsx';
import DownloadPDFPage from './pages/download_pdf.jsx';
import StatusPesananIna from './pages/status_pensanan_ina.jsx';

function App() {
  return (
    <Sidebar>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/download_pdf" element={<DownloadPDFPage />} />
        <Route path="/status_pensanan_ina" element={<StatusPesananIna />} />
      </Routes>
    </Sidebar>
  );
}

export default App;
