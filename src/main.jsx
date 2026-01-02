import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import App from "./Page/App/App.jsx";
import Layout from "./Components/Layout.jsx";
import Servicios from "./Page/Servicios.jsx";
import Citas from "./Page/Citas.jsx";

{/*Footer*/}
import Contacto from "./Page/Footer/Contacto.jsx"
import Quines_somos from "./Page/Footer/Quienes_somos.jsx";
import Politica_privacidad from "./Page/Footer/Politica_privacidad.jsx";
import Terminos_condiciones from "./Page/Footer/Terminos_condiciones.jsx";

{/*Login*/}
import Ingreso from "./Page/Sesion/Ingreso.jsx"

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<App />} />
  <Route path="/Servicios" element={<Servicios/>}/>
          <Route path="/Citas" element={<Citas/>} />
          {/*Footer*/}
          <Route path="/Contacto" element={<Contacto/>}/>
          <Route path="/Quienes_somos" element={<Quines_somos/>}/>
          <Route path="/Politica_privacidad"element={<Politica_privacidad/>}/>
          <Route path="/Terminos_condiciones"element={<Terminos_condiciones/>}/>

          {/*Login*/}
          <Route path="/Ingreso" element={<Ingreso/>}/>
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
