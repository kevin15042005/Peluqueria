import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Intentar cargar desde "USER" o "usuario" para compatibilidad
    const storedUser = localStorage.getItem("USER") || localStorage.getItem("usuario");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Error parsing user data:", error);
        localStorage.clear();
      }
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    // Guardar como "USER" (mayúsculas)
    localStorage.setItem("USER", JSON.stringify(userData));
    localStorage.setItem("isLoggedIn", "true");
    setUser(userData);
  };

  const logout = () => {
    // Limpiar ambas versiones para seguridad
    localStorage.removeItem("USER");
    localStorage.removeItem("usuario");
    localStorage.removeItem("isLoggedIn");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoggedIn: !!user, 
      loading, 
      login, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);