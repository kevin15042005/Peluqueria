import "./App.css";
import Informacion1 from "./Informativa1.jsx";
import Informativa2 from "./Informativa2.jsx";
import Tratado from "./Tratado.jsx";
import Citas from "../Citas.jsx/";
import Horario from "./Horario.jsx";
export default function App() {
  return (
    <>
      <div>
        <section>
          <Informacion1 />
        </section>
        <section className="bg-yellow-400 opacity-[0.8] p-4 ">
          <Informativa2 />
        </section>
        <section className="bg-gray-800 opacity-[0.8] p-4 ">
          <Tratado />
        </section>
        <section className="bg-[#F7F6ED]">
          <Horario />
        </section>
      </div>
    </>
  );
}
