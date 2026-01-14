import { Navigate } from "react-router-dom";

const RutaProtegida = ({ children, rolPermitido }) => {
  const isLoggedIn = localStorage.getItem("isLoggedIn");
  const user = JSON.parse(localStorage.getItem("USER"));


  if (!isLoggedIn || !user) {
    return <Navigate to="/" replace />;
  }

  if (rolPermitido && user.ROL !== rolPermitido) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default RutaProtegida;
