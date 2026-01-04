import { Navigate } from "react-router-dom";
import { useAuth } from "./AutoContext.jsx";


const RutaProtegida = ({ children }) => {
  const { isLoggedIn } = useAuth();

  return isLoggedIn ? children : <Navigate to="/Ingreso" replace />;
};

export default RutaProtegida;
