// src/components/ProtectedRoute.jsx
import { Navigate, Outlet, useLocation, useParams } from "react-router-dom";

export default function ProtectedRoute() {
  const location = useLocation();
  const { id } = useParams();

  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  // Cegah user A masuk URL user B
  if (id && id !== String(user.id)) {
    return <Navigate to={`/${user.id}/home`} replace />;
  }

  return <Outlet />;
}