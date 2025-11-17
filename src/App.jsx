// src/App.jsx
import { Routes, Route } from "react-router-dom";
import Sidebar from "./components/sidebar.jsx";
import HomePage from "./pages/home";
import Login from "./pages/login";
import DownloadPDFPage from "./pages/download_pdf";
import StatusPesananIna from "./pages/status_pensanan_ina";
import Perlengkapan from "./pages/perlengkapan";
import Gabung_pdf from "./pages/gabung_pdf";
import Document_batal from "./pages/daftar_contract_batal";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

function App() {
  return (
    <Routes>
      {/* PUBLIC ROUTE */}
      <Route path="/" element={<Login />} />

      {/* PROTECTED */}
      <Route element={<ProtectedRoute />}>
        {/* ❗❗ FIX: REMOVE SLASH */}
        <Route path=":id" element={<Sidebar />}>
          <Route path="home" element={<HomePage />} />
          <Route path="gabung_pdf" element={<Gabung_pdf />} />
          <Route path="download_pdf" element={<DownloadPDFPage />} />
          <Route path="status_pensanan_ina" element={<StatusPesananIna />} />
          <Route path="perlengkapan" element={<Perlengkapan />} />
          <Route path="document_batal" element={<Document_batal />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
