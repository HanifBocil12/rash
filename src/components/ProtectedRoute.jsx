// src/components/ProtectedRoute.jsx
import { Navigate, Outlet, useLocation, useParams } from "react-router-dom";

export default function ProtectedRoute() {
  const location = useLocation();
  const { id } = useParams();

  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  // Fungsi untuk cek apakah Base64 valid
  const isValidBase64 = (str) => {
    try {
      return btoa(atob(str)) === str;
    } catch {
      return false;
    }
  };

  // Jika Base64 invalid → pakai Base64 user.id yang benar
  if (!isValidBase64(id)) {
    const safeBase64 = btoa(String(user.id));
    return <Navigate to={`/${safeBase64}/home`} replace />;
  }

  // Decode aman
  const decodedId = atob(id);

  // Cegah user A masuk URL user B
  if (decodedId !== String(user.id)) {
    const safeBase64 = btoa(String(user.id));
    return <Navigate to={`/${safeBase64}/home`} replace />;
  }

  return <Outlet />;
}
