import { useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { supabase } from "../supabaseCliente.js";
import { obtenerTodosLosEventosOrdenadosPorTimestampAsc } from "../api/eventosApi.js";
import { ZONA_HORARIA_CORDOBA } from "../utils/fechas.js";

function crearNombreArchivoBackup() {
  const ahora = new Date();
  const fecha = new Intl.DateTimeFormat("en-CA", {
    timeZone: ZONA_HORARIA_CORDOBA,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(ahora);
  return `backup_eventos_fumada_${fecha}.json`;
}

function descargarJsonComoArchivo(objeto, nombreArchivo) {
  const contenido = JSON.stringify(objeto, null, 2);
  const blob = new Blob([contenido], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = nombreArchivo;
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();

  URL.revokeObjectURL(url);
}

function esTipoValido(tipo) {
  return tipo === "cigarrillo" || tipo === "tabaco";
}

function normalizarEventoParaImportar(eventoCrudo, userIdActual) {
  const id = typeof eventoCrudo.id === "string" ? eventoCrudo.id : undefined;
  const timestamp = typeof eventoCrudo.timestamp === "string" ? eventoCrudo.timestamp : null;
  const fecha_local = typeof eventoCrudo.fecha_local === "string" ? eventoCrudo.fecha_local : null;
  const tipo = typeof eventoCrudo.tipo === "string" ? eventoCrudo.tipo : null;

  const descripcion =
    typeof eventoCrudo.descripcion === "string" && eventoCrudo.descripcion.trim()
      ? eventoCrudo.descripcion.trim()
      : null;

  if (!timestamp || !fecha_local || !tipo || !esTipoValido(tipo)) return null;

  const base = {
    user_id: userIdActual,
    timestamp,
    fecha_local,
    tipo,
    descripcion,
  };

  return id ? { id, ...base } : base;
}

export default function AjustesPage() {
  const { usuario } = useOutletContext();

  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [exportando, setExportando] = useState(false);
  const [importando, setImportando] = useState(false);

  const inputArchivoRef = useRef(null);

  async function cerrarSesion() {
    setError("");
    setMensaje("");
    const { error } = await supabase.auth.signOut();
    if (error) setError(error.message);
  }

  async function exportarJson() {
    setError("");
    setMensaje("");
    setExportando(true);

    try {
      const eventos = await obtenerTodosLosEventosOrdenadosPorTimestampAsc();

      const backup = {
        version: 1,
        zonaHoraria: ZONA_HORARIA_CORDOBA,
        exportadoEn: new Date().toISOString(),
        eventos,
      };

      descargarJsonComoArchivo(backup, crearNombreArchivoBackup());
      setMensaje("Exportación completada.");
    } catch (err) {
      setError(err?.message ?? "No se pudo exportar.");
    } finally {
      setExportando(false);
    }
  }

  function pedirArchivoImportacion() {
    setError("");
    setMensaje("");
    if (inputArchivoRef.current) {
      inputArchivoRef.current.value = "";
      inputArchivoRef.current.click();
    }
  }

  async function importarDesdeArchivo(e) {
    const archivo = e.target.files?.[0];
    if (!archivo) return;

    setError("");
    setMensaje("");
    setImportando(true);

    try {
      const texto = await archivo.text();
      const json = JSON.parse(texto);

      const eventosCrudos = Array.isArray(json?.eventos) ? json.eventos : null;
      if (!eventosCrudos) throw new Error("El archivo no tiene el formato esperado: falta la lista 'eventos'.");

      const eventosNormalizados = eventosCrudos
        .map((ev) => normalizarEventoParaImportar(ev, usuario.id))
        .filter(Boolean);

      if (eventosNormalizados.length === 0) throw new Error("No hay eventos válidos para importar.");

      const TAMANIO_LOTE = 500;
      let totalProcesados = 0;

      for (let i = 0; i < eventosNormalizados.length; i += TAMANIO_LOTE) {
        const lote = eventosNormalizados.slice(i, i + TAMANIO_LOTE);

        const { error } = await supabase
          .from("eventos_fumada")
          .upsert(lote, { onConflict: "id", ignoreDuplicates: true });

        if (error) throw error;
        totalProcesados += lote.length;
      }

      setMensaje(`Importación completada. Eventos procesados: ${totalProcesados}.`);
    } catch (err) {
      setError(err?.message ?? "No se pudo importar.");
    } finally {
      setImportando(false);
    }
  }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <section className="tarjeta">
        <h2 className="tituloSeccion">Ajustes</h2>
        <div className="muted">Backup manual en JSON. La importación no borra nada; solo agrega.</div>
      </section>

      {error ? <section className="tarjeta error">{error}</section> : null}
      {mensaje ? <section className="tarjeta">{mensaje}</section> : null}

      <section className="tarjeta">
        <h3 className="tituloSeccion">Backup</h3>
        <div className="fila" style={{ alignItems: "center" }}>
          <button className="boton botonPrimario" onClick={exportarJson} disabled={exportando}>
            {exportando ? "Exportando..." : "Exportar JSON"}
          </button>

          <button className="boton" onClick={pedirArchivoImportacion} disabled={importando}>
            {importando ? "Importando..." : "Importar JSON"}
          </button>

          <input
            ref={inputArchivoRef}
            type="file"
            accept="application/json"
            onChange={importarDesdeArchivo}
            style={{ display: "none" }}
          />
        </div>

        <div className="muted" style={{ marginTop: 10 }}>
          Importar el mismo backup no debería duplicar si el archivo incluye ids.
        </div>
      </section>

      <section className="tarjeta">
        <button className="boton" onClick={cerrarSesion}>
          Cerrar sesión
        </button>
      </section>
    </div>
  );
}
