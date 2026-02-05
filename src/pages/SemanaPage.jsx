import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { obtenerEventosPorRangoFechaLocal } from "../api/eventosApi.js";
import { obtenerFechaLocalISO, obtenerRangoSemanaLunesADomingo, ZONA_HORARIA_CORDOBA } from "../utils/fechas.js";

function contarPorFechaLocal(eventos) {
  const mapa = new Map();
  for (const e of eventos) {
    mapa.set(e.fecha_local, (mapa.get(e.fecha_local) ?? 0) + 1);
  }
  return mapa;
}

function generarDiasSemana(inicioIso) {
  // inicioIso ya es lunes
  const dias = [];
  const nombres = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

  const base = new Date(`${inicioIso}T00:00:00Z`); // solo para iterar
  for (let i = 0; i < 7; i++) {
    const d = new Date(base);
    d.setUTCDate(base.getUTCDate() + i);

    const anio = String(d.getUTCFullYear()).padStart(4, "0");
    const mes = String(d.getUTCMonth() + 1).padStart(2, "0");
    const dia = String(d.getUTCDate()).padStart(2, "0");
    const fechaIso = `${anio}-${mes}-${dia}`;

    const diaSemana = d.getUTCDay();
    dias.push({ fechaIso, nombreDia: nombres[diaSemana] });
  }

  return dias;
}

export default function SemanaPage() {
  const { usuario } = useOutletContext();

  const [eventosSemana, setEventosSemana] = useState([]);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);

  const fechaHoyIso = useMemo(() => obtenerFechaLocalISO(new Date(), ZONA_HORARIA_CORDOBA), []);
  const { inicio, fin } = useMemo(() => obtenerRangoSemanaLunesADomingo(fechaHoyIso), [fechaHoyIso]);

  useEffect(() => {
    async function cargar() {
      setError("");
      setCargando(true);
      try {
        const eventos = await obtenerEventosPorRangoFechaLocal({ inicioIso: inicio, finIso: fin });
        setEventosSemana(eventos);
      } catch (err) {
        setError(err?.message ?? "No se pudieron cargar los datos de la semana");
      } finally {
        setCargando(false);
      }
    }
    if (usuario) cargar();
  }, [usuario, inicio, fin]);

  const conteo = contarPorFechaLocal(eventosSemana);
  const filas = generarDiasSemana(inicio).map((d) => ({
    ...d,
    total: conteo.get(d.fechaIso) ?? 0,
  }));

  const totalSemanal = eventosSemana.length;

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <section className="tarjeta">
        <h2 className="tituloSeccion">Semana</h2>
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
            <div style={{ display: "grid", gap: 8 }}>
              {filas.map((f) => (
                <div key={f.fechaIso} className="filaSemana">
                  <div>{f.nombreDia}</div>
                  <div className="muted">{f.fechaIso}</div>
                  <div style={{ textAlign: "right" }}>{f.total}</div>
                </div>
              ))}
            </div>

            <div className="separador" />
            <div className="filaEntre">
              <strong>Total semanal</strong>
              <strong>{totalSemanal}</strong>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
