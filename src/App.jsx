import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/sidebar';
import HomePage from './pages/home.jsx';
import Login from './pages/login.jsx';
import DownloadPDFPage from './pages/download_pdf.jsx';
import StatusPesananIna from './pages/status_pensanan_ina.jsx';

// Layout component that renders Sidebar + children
function AppLayout({ children }) {
  return <Sidebar>{children}</Sidebar>;
}

function App() {
  return (
    <Routes>
      {/* Public route — no sidebar */}
      <Route path="/" element={<Login />} />

      {/* Protected routes — wrapped with Sidebar */}
      <Route
        path="/"
        element={<AppLayout />}
      >
        <Route path="home" element={<HomePage />} />
        <Route path="download_pdf" element={<DownloadPDFPage />} />
        <Route path="status_pensanan_ina" element={<StatusPesananIna />} />
      </Route>
    </Routes>
  );
}

export default App;