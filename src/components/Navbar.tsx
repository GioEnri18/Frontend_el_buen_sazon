import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          El Buen Sazón
        </Link>
        <ul className="navbar-menu">
          <li><Link to="/">INICIO</Link></li>
          <li><Link to="/reservar">RESERVAR</Link></li>
          <li><Link to="/dashboard">DASHBOARD</Link></li>
          <li><Link to="/mesas">MESAS</Link></li>
          <li><Link to="/clientes">CLIENTES</Link></li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
