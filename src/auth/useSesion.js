import { useEffect, useState } from "react";
import { supabase } from "../supabaseCliente.js";

export function useSesion() {
  const [cargandoSesion, setCargandoSesion] = useState(true);
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    let suscripcion = null;

    async function cargarSesionInicial() {
      const { data, error } = await supabase.auth.getSession();
      if (!error) setUsuario(data.session?.user ?? null);
      setCargandoSesion(false);

      const { data: listener } = supabase.auth.onAuthStateChange((_evento, sesion) => {
        setUsuario(sesion?.user ?? null);
      });

      suscripcion = listener.subscription;
    }

    cargarSesionInicial();

    return () => {
      if (suscripcion) suscripcion.unsubscribe();
    };
  }, []);

  return { cargandoSesion, usuario };
}
