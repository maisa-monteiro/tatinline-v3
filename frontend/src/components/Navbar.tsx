import { NavLink } from 'react-router-dom';
import { BookOpen, Activity, Heart, Settings } from 'lucide-react';
import './Navbar.css';

export function Navbar() {
  return (
    <nav className="bottom-nav">
      <NavLink to="/" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
        <BookOpen className="icon" />
        <span>Diário</span>
      </NavLink>

      <NavLink to="/activity" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
        <Activity className="icon" />
        <span>Atividade</span>
      </NavLink>

      <NavLink to="/health" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
        <Heart className="icon" />
        <span>Saúde</span>
      </NavLink>

      <NavLink to="/settings" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
        <Settings className="icon" />
        <span>Definições</span>
      </NavLink>
    </nav>
  );
}