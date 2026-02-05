import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { crearEventoFumada, obtenerEventosPorFechaLocal } from "../api/eventosApi.js";
import { formatearHoraLocal, obtenerFechaLocalISO, ZONA_HORARIA_CORDOBA } from "../utils/fechas.js";

export default function HoyPage() {
  const { usuario } = useOutletContext();

  const [error, setError] = useState("");
  const [tipoSeleccionado, setTipoSeleccionado] = useState("cigarrillo");
  const [descripcion, setDescripcion] = useState("");

  const [eventosDelDia, setEventosDelDia] = useState([]);
  const [cargando, setCargando] = useState(true);

  const fechaHoyIso = useMemo(() => obtenerFechaLocalISO(new Date(), ZONA_HORARIA_CORDOBA), []);

  async function cargarEventos() {
    setError("");
    setCargando(true);
    try {
      const eventos = await obtenerEventosPorFechaLocal({ fechaLocalIso: fechaHoyIso });
      setEventosDelDia(eventos);
    } catch (err) {
      setError(err?.message ?? "No se pudieron cargar los eventos de hoy");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarEventos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function registrarEvento() {
    setError("");
    try {
      const nuevo = await crearEventoFumada({
        userId: usuario.id,
        fechaLocalIso: fechaHoyIso,
        tipo: tipoSeleccionado,
        descripcion,
      });

      setEventosDelDia((prev) => [nuevo, ...prev]);
      setDescripcion("");
    } catch (err) {
      setError(err?.message ?? "No se pudo registrar el evento");
    }
  }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <section className="tarjeta">
        <div className="filaEntre">
          <h2 className="tituloSeccion">Hoy</h2>
          <div className="muted">{fechaHoyIso}</div>
        </div>

        <div className="filaEntre" style={{ marginTop: 8 }}>
          <div>Total de hoy:</div>
          <strong>{eventosDelDia.length}</strong>
        </div>
      </section>

      {error ? <section className="tarjeta error">{error}</section> : null}

      <section className="tarjeta">
        <div className="fila">
          <label className="etiqueta">
            Tipo
            <select value={tipoSeleccionado} onChange={(e) => setTipoSeleccionado(e.target.value)}>
              <option value="cigarrillo">Cigarrillo</option>
              <option value="tabaco">Tabaco</option>
            </select>
          </label>

          <label className="etiqueta etiquetaFlexible">
            Descripción (opcional)
            <input
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Ej: después de comer"
            />
          </label>
        </div>

        <button className="botonGrande botonPrimario" onClick={registrarEvento}>
          +1
        </button>
      </section>

      <section className="tarjeta">
        <div className="filaEntre">
          <h3 className="tituloSeccion">Momentos del día</h3>
          <button className="boton" onClick={cargarEventos} disabled={cargando}>
            {cargando ? "Actualizando..." : "Refrescar"}
          </button>
        </div>

        {!eventosDelDia.length && !cargando ? (
          <div className="muted" style={{ marginTop: 10 }}>
            Todavía no fumaste hoy.
          </div>
        ) : null}

        <ul className="lista">
          {eventosDelDia.map((ev) => (
            <li key={ev.id} className="itemLista">
              <span className="hora">{formatearHoraLocal(ev.timestamp, ZONA_HORARIA_CORDOBA)}</span>
              <span className="tipo">{ev.tipo}</span>
              <span className="descripcion">{ev.descripcion ?? ""}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
