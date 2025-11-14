// src/components/ProtectedRoute.jsx
import { Navigate, Outlet, useLocation, useParams } from "react-router-dom";

export default function ProtectedRoute() {
  const location = useLocation();
  const { id } = useParams();

  // Ambil data user dari localStorage
  const user = JSON.parse(localStorage.getItem("user"));

  // Jika belum login, redirect ke login
  if (!user) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  // Decode ID dari URL untuk dicek
  let decodedId;
  try {
    // atob() untuk decode Base64 dari URL
    decodedId = atob(id);
  } catch (e) {
    // Jika decode gagal, redirect ke home user sendiri
    return <Navigate to={`/${user.id}/home`} replace />;
  }

  // Cegah user A masuk URL user B
  // decodedId = dari URL, user.id = dari localStorage (angka/string)
  if (decodedId && decodedId !== String(user.id)) {
    return <Navigate to={`/${user.id}/home`} replace />;
  }

  // Jika semua oke, render child routes
  return <Outlet />;
}