import { Link, NavLink } from 'react-router-dom';

function Header() {
  return (
    <header className="app-header">
      <div className="header-content">
        <Link className="brand" to="/ordens">
          Ordens de Producao
        </Link>
        <nav>
          <NavLink to="/ordens">Listagem</NavLink>
          <NavLink to="/ordens/nova">Nova Ordem</NavLink>
        </nav>
      </div>
    </header>
  );
}

export default Header;
