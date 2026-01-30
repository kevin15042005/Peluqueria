import "./App.css";
import Informacion1 from "./Informativa1.jsx";
import Informativa2 from "./Informativa2.jsx";
import Citas from "../Citas.jsx/";
import Horario from "./Horario.jsx";
export default function App() {
  return (
    <>
      <div>
        <section>
          <Informacion1 />
        </section>
        <section className="bg-[#272724]  p-4 ">
          <Informativa2 />
        </section>
        <section className="bg-yellow-400 opacity-[0.8] p-4 ">
        </section>
        <section className="bg-[#222222]">
          <Horario />
        </section>
      </div>
    </>
  );
}
