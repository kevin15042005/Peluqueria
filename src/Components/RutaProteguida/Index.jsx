import { Navigate } from "react-router-dom";

const RutaProtegida = ({ children, rolPermitido }) => {
  // Leer del localStorage - buscar en ambas claves para compatibilidad
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const userStr = localStorage.getItem("USER") || localStorage.getItem("usuario");
  
  let user = null;
  if (userStr) {
    try {
      user = JSON.parse(userStr);
    } catch (error) {
      console.error("Error parsing user data:", error);
      localStorage.clear();
    }
  }

  console.log("🔍 RUTA PROTEGIDA - DEBUG:");
  console.log("🔍 isLoggedIn:", isLoggedIn);
  console.log("🔍 User:", user);
  console.log("🔍 Rol del usuario:", user?.ROL);
  console.log("🔍 Rol permitido:", rolPermitido);

  // Si no está logueado, redirigir al login
  if (!isLoggedIn || !user) {
    console.log("❌ No autenticado, redirigiendo a /Ingreso");
    return <Navigate to="/Ingreso" replace />;
  }

  // Si se especifica un rol, verificar que coincida
  if (rolPermitido) {
    const rolUsuario = user.ROL ? user.ROL.toString().toLowerCase().trim() : '';
    const rolRequerido = rolPermitido.toString().toLowerCase().trim();
    
    console.log("🔍 Comparando roles:");
    console.log("🔍 Rol usuario:", rolUsuario);
    console.log("🔍 Rol requerido:", rolRequerido);
    
    if (rolUsuario !== rolRequerido) {
      console.log(`❌ Rol no coincide. Usuario: ${rolUsuario}, Requerido: ${rolRequerido}`);
      
      // Redirigir según el rol del usuario
      if (rolUsuario === "administrador" || rolUsuario === "2") {
        console.log("🔀 Redirigiendo administrador a /Administrador");
        return <Navigate to="/Administrador" replace />;
      } else if (rolUsuario === "empleado" || rolUsuario === "1") {
        console.log("🔀 Redirigiendo empleado a /Empleado");
        return <Navigate to="/Empleado" replace />;
      } else {
        console.log("❌ Rol desconocido, redirigiendo a login");
        return <Navigate to="/Ingreso" replace />;
      }
    }
  }

  console.log("✅ Acceso permitido");
  return children;
};

export default RutaProtegida;