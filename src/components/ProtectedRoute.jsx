// src/components/ProtectedRoute.jsx
import { Navigate, Outlet, useLocation, useParams } from "react-router-dom";

export default function ProtectedRoute() {
  const location = useLocation();
  const { id } = useParams(); // id sekarang = hash random

  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  // Ambil session hash dari localStorage
  const storedHash = user.sessionHash;

  // Fungsi cek hash valid (panjang minimal & karakter aman)
  const isValidHash = (str) => {
    if (!str) return false;
    return /^[a-fA-F0-9-]{8,}$/.test(str);
  };

  // Jika hash invalid → pakai hash user yang benar
  if (!isValidHash(id)) {
    return <Navigate to={`/${storedHash}/home`} replace />;
  }

  // Cegah user A masuk URL user B
  if (id !== storedHash) {
    return <Navigate to={`/${storedHash}/home`} replace />;
  }

  return <Outlet />;
}