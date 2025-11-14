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
      <Route path="/" element={<Login />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<Sidebar />}>
          <Route path="/user/:userId/home" element={<HomePage />} />
          <Route path="/user/:userId/gabung_pdf" element={<Gabung_pdf />} />
          <Route path="/user/:userId/download_pdf" element={<DownloadPDFPage />} />
          <Route path="/user/:userId/status_pensanan_ina" element={<StatusPesananIna />} />
          <Route path="/user/:userId/perlengkapan" element={<Perlengkapan />} />
          <Route path="/user/:userId/document_batal" element={<Document_batal />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;