import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { obtenerEventosPorRangoFechaLocal } from "../api/eventosApi.js";
import { obtenerFechaLocalISO, obtenerRangoMesCalendario, ZONA_HORARIA_CORDOBA } from "../utils/fechas.js";

export default function MesPage() {
  const { usuario } = useOutletContext();

  const [eventosMes, setEventosMes] = useState([]);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);

  const fechaHoyIso = useMemo(() => obtenerFechaLocalISO(new Date(), ZONA_HORARIA_CORDOBA), []);
  const { inicio, fin } = useMemo(() => obtenerRangoMesCalendario(fechaHoyIso), [fechaHoyIso]);

  useEffect(() => {
    async function cargar() {
      setError("");
      setCargando(true);
      try {
        const eventos = await obtenerEventosPorRangoFechaLocal({ inicioIso: inicio, finIso: fin });
        setEventosMes(eventos);
      } catch (err) {
        setError(err?.message ?? "No se pudieron cargar los datos del mes");
      } finally {
        setCargando(false);
      }
    }
    if (usuario) cargar();
  }, [usuario, inicio, fin]);

  const totalMensual = eventosMes.length;
  const etiquetasCompletas = Math.floor(totalMensual / 20);
  const resto = totalMensual % 20;

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <section className="tarjeta">
        <h2 className="tituloSeccion">Mes</h2>
        <div className="muted">
          Rango: {inicio} a {fin}
        </div>
      </section>

      {error ? <section className="tarjeta error">{error}</section> : null}

      <section className="tarjeta">
        {cargando ? (
          <div>Cargando...</div>
        ) : (
          <>
            <div className="textoClave">números de cigarrillos fumados este mes: {totalMensual}</div>

            <div className="filaEntre" style={{ marginBottom: 6 }}>
              <div>etiquetas completas:</div>
              <div>{etiquetasCompletas}</div>
            </div>

            <div className="filaEntre">
              <div>puchos:</div>
              <div>{resto}</div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
