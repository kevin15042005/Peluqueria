import React, { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  CalendarDays,
  Clock,
  Scissors,
  User,
  Search,
  Loader2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ArrowRight,
} from "lucide-react";

const API = import.meta.env.VITE_API_URL;
const REFRESCO_MS = 15000;

const hora = (h) => (h ? h.substring(0, 5) : "--:--");
const fechaLarga = (f) =>
  f
    ? new Date(`${f}T00:00:00`).toLocaleDateString("es-CO", {
        weekday: "long",
        day: "numeric",
        month: "long",
      })
    : "";

const leerTelefono = () => {
  try {
    return localStorage.getItem("telefonoCliente") || "";
  } catch {
    return "";
  }
};

// Mensaje principal según el estado y la posición en la fila
function estadoVisual(t) {
  if (t.ESTADO === "confirmado")
    return { titulo: "¡Es tu turno!", texto: "Te están atendiendo ahora.", color: "text-green-400", anillo: "border-green-500/50" };
  if (t.ESTADO === "completado")
    return { titulo: "Servicio completado", texto: "Gracias por visitarnos.", color: "text-white/70", anillo: "border-white/20" };
  if (t.ESTADO === "cancelado")
    return { titulo: "Turno cancelado", texto: "Puedes agendar uno nuevo cuando quieras.", color: "text-red-400", anillo: "border-red-500/40" };
  if (t.DELANTE === 0)
    return { titulo: "Eres el siguiente", texto: "Acércate al salón, ya casi es tu turno.", color: "text-gold", anillo: "border-gold" };
  return {
    titulo: `${t.DELANTE} ${t.DELANTE === 1 ? "persona" : "personas"} antes que tú`,
    texto: "Te avisamos aquí mismo cuando avance la fila.",
    color: "text-gold",
    anillo: "border-gold/50",
  };
}

function TarjetaTurno({ turno }) {
  const v = estadoVisual(turno);
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-10">
      <div className="flex flex-col items-center text-center">
        <p className="text-xs uppercase tracking-[0.35em] text-white/50">Tu turno</p>
        <div className={`mt-4 flex h-40 w-40 items-center justify-center rounded-full border-4 ${v.anillo} bg-ink`}>
          <span className="font-display text-4xl text-white">{turno.CODIGO}</span>
        </div>
        <h2 className={`mt-6 font-display text-3xl ${v.color}`}>{v.titulo}</h2>
        <p className="mt-2 text-white/60">{v.texto}</p>
      </div>

      <dl className="mt-10 grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
        <Dato icon={Scissors} titulo="Servicio" valor={`${turno.SUBSERVICIO} · ${turno.DURACION_MINUTOS} min`} />
        <Dato icon={User} titulo="Te atiende" valor={turno.EMPLEADO} />
        <Dato icon={CalendarDays} titulo="Fecha" valor={fechaLarga(turno.FECHA)} />
        <Dato icon={Clock} titulo="Hora" valor={`${hora(turno.HORA_INICIO)} - ${hora(turno.HORA_FIN)}`} />
      </dl>
    </div>
  );
}

function Dato({ icon: Icon, titulo, valor }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-white/[0.03] p-4">
      <Icon size={18} className="mt-0.5 shrink-0 text-gold" />
      <div>
        <dt className="text-xs uppercase tracking-[0.15em] text-white/40">{titulo}</dt>
        <dd className="mt-1 capitalize text-white">{valor}</dd>
      </div>
    </div>
  );
}

export default function MiTurno() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const esNuevo = params.get("nuevo") === "1";

  const [turno, setTurno] = useState(null);
  const [cargando, setCargando] = useState(Boolean(id));
  const [error, setError] = useState("");
  const [actualizado, setActualizado] = useState(null);

  const [telefono, setTelefono] = useState(leerTelefono);
  const [lista, setLista] = useState(null);
  const [buscando, setBuscando] = useState(false);

  // Estado de un turno concreto (se refresca solo)
  const cargarTurno = useCallback(async () => {
    if (!id) return;
    try {
      const res = await fetch(`${API}/turnos/estado/${id}`);
      const data = await res.json();
      if (data.success) {
        setTurno(data.turno);
        setError("");
        setActualizado(new Date());
      } else {
        setError(data.message || "No encontramos ese turno");
      }
    } catch {
      setError("No se pudo conectar con el servidor");
    } finally {
      setCargando(false);
    }
  }, [id]);

  useEffect(() => {
    if (!id) return;
    cargarTurno();
    const t = setInterval(cargarTurno, REFRESCO_MS);
    return () => clearInterval(t);
  }, [id, cargarTurno]);

  // Buscar turnos por teléfono
  const buscar = async (e) => {
    e?.preventDefault();
    const tel = telefono.replace(/\D/g, "");
    if (tel.length !== 10) {
      setError("Escribe un teléfono de 10 dígitos");
      return;
    }
    setBuscando(true);
    setError("");
    try {
      const res = await fetch(`${API}/turnos/por-telefono/${tel}`);
      const data = await res.json();
      if (data.success) {
        setLista(data.turnos);
        try {
          localStorage.setItem("telefonoCliente", tel);
        } catch {
          /* sin almacenamiento */
        }
      } else {
        setError(data.message || "No se pudo buscar");
      }
    } catch {
      setError("No se pudo conectar con el servidor");
    } finally {
      setBuscando(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink text-white">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 md:py-20">
        <div className="mb-10 text-center">
          <p className="mb-4 flex items-center justify-center gap-3 text-xs uppercase tracking-[0.35em] text-gold">
            <span className="h-px w-8 bg-gold" />
            Seguimiento
            <span className="h-px w-8 bg-gold" />
          </p>
          <h1 className="font-display text-4xl md:text-5xl">
            Mi <span className="text-gradient-gold italic">turno</span>
          </h1>
        </div>

        {esNuevo && turno && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-green-500/30 bg-green-500/10 px-5 py-4 text-green-300">
            <CheckCircle2 size={22} className="shrink-0" />
            <p>
              ¡Cita agendada! Guarda tu código <strong>{turno.CODIGO}</strong>. Esta página se actualiza sola.
            </p>
          </div>
        )}

        {/* Turno concreto */}
        {id && (
          <>
            {cargando ? (
              <div className="flex justify-center py-20">
                <Loader2 size={32} className="animate-spin text-gold" />
              </div>
            ) : turno ? (
              <>
                <TarjetaTurno turno={turno} />
                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-white/40">
                  <RefreshCw size={12} />
                  Actualizado {actualizado?.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })} · se
                  refresca cada 15 s
                </div>
              </>
            ) : null}
          </>
        )}

        {/* Buscar por teléfono */}
        <div className="mt-10 rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
          <h2 className="font-display text-xl">{id ? "¿Tienes otra cita?" : "Consulta tu turno"}</h2>
          <p className="mt-1 text-sm text-white/50">Escribe el teléfono con el que agendaste.</p>
          <form onSubmit={buscar} className="mt-5 flex flex-col gap-3 sm:flex-row">
            <input
              type="tel"
              inputMode="numeric"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="Ej: 3001234567"
              className="w-full rounded-xl border border-white/15 bg-white/[0.04] p-3.5 text-white outline-none placeholder:text-white/30 focus:border-gold"
            />
            <button
              type="submit"
              disabled={buscando}
              className="flex items-center justify-center gap-2 rounded-xl bg-gold px-6 py-3.5 text-sm font-semibold uppercase tracking-[0.12em] text-ink transition-colors hover:bg-gold-light disabled:opacity-60"
            >
              {buscando ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
              Buscar
            </button>
          </form>

          {error && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              <AlertCircle size={18} className="shrink-0" />
              {error}
            </div>
          )}

          {lista && (
            <div className="mt-6 space-y-3">
              {lista.length === 0 ? (
                <p className="text-sm text-white/50">
                  No tienes citas próximas.{" "}
                  <Link to="/Citas" className="text-gold hover:underline">
                    Agenda una aquí
                  </Link>
                  .
                </p>
              ) : (
                lista.map((t) => (
                  <button
                    key={t.ID}
                    onClick={() => navigate(`/MiTurno/${t.ID}`)}
                    className="flex w-full items-center justify-between gap-4 rounded-2xl border border-white/10 p-4 text-left transition-colors hover:border-gold/50"
                  >
                    <div>
                      <p className="font-semibold">
                        {t.CODIGO} · {t.SUBSERVICIO}
                      </p>
                      <p className="mt-1 text-sm capitalize text-white/50">
                        {fechaLarga(t.FECHA)} · {hora(t.HORA_INICIO)} · {t.ESTADO_TEXTO}
                      </p>
                    </div>
                    <ArrowRight size={18} className="shrink-0 text-gold" />
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
