import "./App.css";
import Informacion1 from "./Informativa1.jsx";
import Informativa2 from "./Informativa2.jsx";
import Horario from "./Horario.jsx";

export default function App() {
  return (
    <div className="bg-ink">
      <Informacion1 />
      <Informativa2 />
      <Horario />
    </div>
  );
}
