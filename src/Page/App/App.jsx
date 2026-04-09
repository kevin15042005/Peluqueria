import "./App.css";
import Informacion1 from "./Informativa1.jsx";
import Informativa2 from "./Informativa2.jsx";
import Citas from "../Citas.jsx/";
import Horario from "./Horario.jsx";
export default function App() {
  return (
    <>
      <div>
        <section className="">
          <Informacion1 />
        </section>
        <section >
          <Informativa2 />
        </section>
        <section className="bg-linear-to-t from-[#000000]  to-[#364153]">
          <Horario />
        </section>
      </div>
    </>
  );
}
