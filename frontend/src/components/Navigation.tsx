import React from 'react';
import { useAuth } from '../contexts/AuthContext';

interface NavigationProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentView, onViewChange }) => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    onViewChange('projects');
  };

  const navStyle: React.CSSProperties = {
    backgroundColor: '#282c34',
    padding: '1rem 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '2px solid #61dafb',
    marginBottom: '2rem'
  };

  const logoStyle: React.CSSProperties = {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#61dafb',
    cursor: 'pointer'
  };

  const navLinksStyle: React.CSSProperties = {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center'
  };

  const linkStyle: React.CSSProperties = {
    color: '#ffffff',
    textDecoration: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.3s'
  };

  const activeLinkStyle: React.CSSProperties = {
    ...linkStyle,
    backgroundColor: '#61dafb',
    color: '#282c34'
  };

  const buttonStyle: React.CSSProperties = {
    backgroundColor: '#61dafb',
    color: '#282c34',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold'
  };

  const userInfoStyle: React.CSSProperties = {
    color: '#ffffff',
    marginRight: '1rem'
  };

  return (
    <nav style={navStyle}>
      <div 
        style={logoStyle}
        onClick={() => onViewChange('projects')}
      >
        Portfolio IW
      </div>
      
      <div style={navLinksStyle}>
        <span
          style={currentView === 'projects' ? activeLinkStyle : linkStyle}
          onClick={() => onViewChange('projects')}
        >
          Projets
        </span>
        
        <span
          style={currentView === 'search' ? activeLinkStyle : linkStyle}
          onClick={() => onViewChange('search')}
        >
          Recherche
        </span>
        
        {user ? (
          <>
            <span
              style={currentView === 'profile' ? activeLinkStyle : linkStyle}
              onClick={() => onViewChange('profile')}
            >
              Mon Profil
            </span>
            <span style={userInfoStyle}>
              Bonjour, {user.firstName}
            </span>
            <button
              style={buttonStyle}
              onClick={handleLogout}
            >
              Déconnexion
            </button>
          </>
        ) : (
          <>
            <span
              style={currentView === 'login' ? activeLinkStyle : linkStyle}
              onClick={() => onViewChange('login')}
            >
              Connexion
            </span>
            <span
              style={currentView === 'register' ? activeLinkStyle : linkStyle}
              onClick={() => onViewChange('register')}
            >
              Inscription
            </span>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
