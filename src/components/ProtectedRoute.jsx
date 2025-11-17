// src/components/ProtectedRoute.jsx
import { Navigate, Outlet, useLocation, useParams } from "react-router-dom";

export default function ProtectedRoute() {
  const location = useLocation();
  const { id } = useParams(); // id = ui_id random
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  const uiId = user.ui_id; // gunakan ui_id dari backend

  // cek hash UI — token_urlsafe => aman
  const isValidHash = (str) => {
    if (!str) return false;
    return /^[A-Za-z0-9_\-]{10,}$/.test(str);
  };

  // kalau tidak valid → perbaiki
  if (!isValidHash(id)) {
    return <Navigate to={`/${uiId}/home`} replace />;
  }

  // cegah user lain memakai hash berbeda
  if (id !== uiId) {
    return <Navigate to={`/${uiId}/home`} replace />;
  }

  return <Outlet />;
}
