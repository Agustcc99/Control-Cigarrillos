import { useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { supabase } from "./supabaseCliente.js";
import { useSesion } from "./auth/useSesion.js";

import LayoutApp from "./pages/LayoutApp.jsx";
import HoyPage from "./pages/HoyPage.jsx";
import SemanaPage from "./pages/SemanaPage.jsx";
import MesPage from "./pages/MesPage.jsx";
import AjustesPage from "./pages/AjustesPage.jsx";

function LoginSimple() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function iniciarSesion(e) {
    e.preventDefault();
    setError("");
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) setError(error.message);
  }

  return (
    <div className="contenedor">
      <section className="tarjeta">
        <h1 className="titulo">Control de cigarrillos/tabaco</h1>
        {error ? <section className="tarjeta error">{error}</section> : null}

        <form onSubmit={iniciarSesion} style={{ display: "grid", gap: 10 }}>
          <label className="etiqueta">
            Email
            <input value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>

          <label className="etiqueta">
            Contraseña
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" />
          </label>

          <button className="boton botonPrimario" type="submit">
            Ingresar
          </button>
        </form>
      </section>
    </div>
  );
}

export default function App() {
  const { cargandoSesion, usuario } = useSesion();

  if (cargandoSesion) {
    return (
      <div className="contenedor">
        <section className="tarjeta">Cargando...</section>
      </div>
    );
  }

  if (!usuario) return <LoginSimple />;

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<LayoutApp usuario={usuario} />}>
          <Route path="/" element={<Navigate to="/hoy" replace />} />
          <Route path="/hoy" element={<HoyPage />} />
          <Route path="/semana" element={<SemanaPage />} />
          <Route path="/mes" element={<MesPage />} />
          <Route path="/ajustes" element={<AjustesPage />} />
          <Route path="*" element={<Navigate to="/hoy" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
