import { supabase } from "../supabaseCliente.js";

export async function crearEventoFumada({ userId, fechaLocalIso, tipo, descripcion }) {
  const payload = {
    user_id: userId,
    timestamp: new Date().toISOString(),
    fecha_local: fechaLocalIso,
    tipo,
    descripcion: descripcion?.trim() ? descripcion.trim() : null,
  };

  const { data, error } = await supabase.from("eventos_fumada").insert([payload]).select("*").single();
  if (error) throw error;
  return data;
}

export async function obtenerEventosPorFechaLocal({ fechaLocalIso }) {
  const { data, error } = await supabase
    .from("eventos_fumada")
    .select("*")
    .eq("fecha_local", fechaLocalIso)
    .order("timestamp", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function obtenerEventosPorRangoFechaLocal({ inicioIso, finIso }) {
  const { data, error } = await supabase
    .from("eventos_fumada")
    .select("*")
    .gte("fecha_local", inicioIso)
    .lte("fecha_local", finIso);

  if (error) throw error;
  return data ?? [];
}

export async function obtenerTodosLosEventosOrdenadosPorTimestampAsc() {
  const { data, error } = await supabase
    .from("eventos_fumada")
    .select("*")
    .order("timestamp", { ascending: true });

  if (error) throw error;
  return data ?? [];
}
