import { NavLink, Outlet } from "react-router-dom";

export default function LayoutApp({ usuario }) {
  return (
    <div className="contenedor">
      <header className="encabezado">
        <div className="marca">Control</div>

        <nav className="nav">
          <NavLink to="/hoy" className={({ isActive }) => (isActive ? "link activo" : "link")}>
            Hoy
          </NavLink>
          <NavLink to="/semana" className={({ isActive }) => (isActive ? "link activo" : "link")}>
            Semana
          </NavLink>
          <NavLink to="/mes" className={({ isActive }) => (isActive ? "link activo" : "link")}>
            Mes
          </NavLink>
          <NavLink to="/ajustes" className={({ isActive }) => (isActive ? "link activo" : "link")}>
            Ajustes
          </NavLink>
        </nav>
      </header>

      <main className="principal">
        <Outlet context={{ usuario }} />
      </main>
    </div>
  );
}
