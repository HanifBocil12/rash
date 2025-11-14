// src/components/ProtectedRoute.jsx
import { Navigate, Outlet, useLocation, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProtectedRoute() {
  const location = useLocation();
  const { user } = useAuth();
  const { userId } = useParams();

  if (!user) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  // Pastikan userId sesuai user login
  if (userId && parseInt(userId) !== user.id) {
    return <Navigate to={`/user/${user.id}/home`} replace />;
  }

  return <Outlet />;
}
