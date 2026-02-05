export const ZONA_HORARIA_CORDOBA = "America/Argentina/Cordoba";

export function obtenerFechaLocalISO(fecha = new Date(), zonaHoraria = ZONA_HORARIA_CORDOBA) {
  const partes = new Intl.DateTimeFormat("en-CA", {
    timeZone: zonaHoraria,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(fecha);

  const anio = partes.find((p) => p.type === "year")?.value;
  const mes = partes.find((p) => p.type === "month")?.value;
  const dia = partes.find((p) => p.type === "day")?.value;

  return `${anio}-${mes}-${dia}`;
}

export function formatearHoraLocal(isoTimestamp, zonaHoraria = ZONA_HORARIA_CORDOBA) {
  return new Intl.DateTimeFormat("es-AR", {
    timeZone: zonaHoraria,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(isoTimestamp));
}

function crearFechaUtcDesdeIso(fechaIso) {
  const [anio, mes, dia] = fechaIso.split("-").map(Number);
  return new Date(Date.UTC(anio, mes - 1, dia, 0, 0, 0, 0));
}

function sumarDiasAFechaIso(fechaIso, dias) {
  const fechaUtc = crearFechaUtcDesdeIso(fechaIso);
  fechaUtc.setUTCDate(fechaUtc.getUTCDate() + dias);
  const anio = String(fechaUtc.getUTCFullYear()).padStart(4, "0");
  const mes = String(fechaUtc.getUTCMonth() + 1).padStart(2, "0");
  const dia = String(fechaUtc.getUTCDate()).padStart(2, "0");
  return `${anio}-${mes}-${dia}`;
}

function obtenerDiaSemanaDesdeIso(fechaIso) {
  return crearFechaUtcDesdeIso(fechaIso).getUTCDay(); // 0=Dom..6=Sáb
}

export function obtenerRangoSemanaLunesADomingo(fechaIsoHoy) {
  const diaSemana = obtenerDiaSemanaDesdeIso(fechaIsoHoy);
  const indiceLunesCero = (diaSemana + 6) % 7; // lunes=0 ... domingo=6
  const inicio = sumarDiasAFechaIso(fechaIsoHoy, -indiceLunesCero);
  const fin = sumarDiasAFechaIso(inicio, 6);
  return { inicio, fin };
}

export function obtenerRangoMesCalendario(fechaIsoHoy) {
  const [anio, mes] = fechaIsoHoy.split("-").map(Number);
  const inicio = `${String(anio).padStart(4, "0")}-${String(mes).padStart(2, "0")}-01`;

  const fechaInicioMesUtc = new Date(Date.UTC(anio, mes - 1, 1, 0, 0, 0, 0));
  fechaInicioMesUtc.setUTCMonth(fechaInicioMesUtc.getUTCMonth() + 1);
  fechaInicioMesUtc.setUTCDate(fechaInicioMesUtc.getUTCDate() - 1);

  const fin = `${String(fechaInicioMesUtc.getUTCFullYear()).padStart(4, "0")}-${String(
    fechaInicioMesUtc.getUTCMonth() + 1
  ).padStart(2, "0")}-${String(fechaInicioMesUtc.getUTCDate()).padStart(2, "0")}`;

  return { inicio, fin };
}
