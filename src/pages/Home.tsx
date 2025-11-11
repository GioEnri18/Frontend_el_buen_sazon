import { useNavigate } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home">
      <div className="hero-section">
        <div className="hero-overlay">
          <div className="hero-content">
            <h1>Bienvenido a El Buen Sazón</h1>
            <p>Sabores auténticos, ambiente acogedor y servicio excepcional.</p>
            <p>Reserva tu mesa y vive la experiencia.</p>
            <button 
              className="btn-reservar"
              onClick={() => navigate('/reservar')}
            >
              RESERVAR AHORA
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
