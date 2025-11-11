import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Reservar from './pages/Reservar';
import Dashboard from './pages/Dashboard';
import Mesas from './pages/Mesas';
import Clientes from './pages/Clientes';
import './App.css';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/reservar" element={<Reservar />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/mesas" element={<Mesas />} />
          <Route path="/clientes" element={<Clientes />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
