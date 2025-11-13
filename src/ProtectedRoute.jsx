// src/components/ProtectedRoute.jsx
import { Navigate, Outlet, useLocation } from "react-router-dom";

export default function ProtectedRoute() {
  const location = useLocation();

  // Cek apakah user sudah login
  const user = localStorage.getItem("user"); // contoh, sesuaikan dengan sistemmu

  // Kalau belum login → redirect ke halaman login
  if (!user) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  // Kalau sudah login → render child route (Outlet)
  return <Outlet />;
}
