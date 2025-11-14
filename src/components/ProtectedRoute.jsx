// src/components/ProtectedRoute.jsx
import { Navigate, Outlet, useLocation, useParams } from "react-router-dom";
import base64 from "base-64";

export default function ProtectedRoute() {
  const location = useLocation();
  const { id } = useParams();

  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  // Decode ID dari URL untuk dicek
  let decodedId = id;
  try {
    decodedId = base64.decode(id);
  } catch (e) {
    // Jika decode gagal, redirect ke home user
    return <Navigate to={`/${user.id}/home`} replace />;
  }

  // Cegah user A masuk URL user B
  if (decodedId && decodedId !== String(user.id)) {
    return <Navigate to={`/${user.id}/home`} replace />;
  }

  return <Outlet />;
}