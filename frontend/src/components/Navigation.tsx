import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface NavigationProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentView, onViewChange }) => {
  const { user, logout } = useAuth();

  const [isMobile, setIsMobile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const updateIsMobile = () => setIsMobile(window.innerWidth <= 768);
    updateIsMobile();
    window.addEventListener('resize', updateIsMobile);
    return () => window.removeEventListener('resize', updateIsMobile);
  }, []);

  const handleLogout = () => {
    logout();
    onViewChange('projects');
    if (isMobile) setMenuOpen(false);
  };

  const navStyle: React.CSSProperties = {
    backgroundColor: '#282c34',
    padding: '1rem 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '2px solid #61dafb',
    marginBottom: '2rem',
    position: 'relative'
  };

  const logoStyle: React.CSSProperties = {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#61dafb',
    cursor: 'pointer'
  };

  const navLinksDesktopStyle: React.CSSProperties = {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center'
  };

  const navLinksMobileStyle: React.CSSProperties = {
    display: menuOpen ? 'flex' : 'none',
    flexDirection: 'column',
    gap: '0.5rem',
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#282c34',
    padding: '1rem',
    borderBottom: '2px solid #61dafb',
    zIndex: 1000
  };

  const navLinksStyle: React.CSSProperties = isMobile
    ? navLinksMobileStyle
    : navLinksDesktopStyle;

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

  const hamburgerButtonStyle: React.CSSProperties = {
    display: isMobile ? 'block' : 'none',
    width: '36px',
    height: '32px',
    padding: 0,
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    marginLeft: '1rem'
  };

  const hamburgerBarStyle: React.CSSProperties = {
    display: 'block',
    width: '100%',
    height: '3px',
    backgroundColor: '#61dafb',
    borderRadius: '2px',
    transition: 'transform 0.2s ease, opacity 0.2s ease',
    marginTop: '6px'
  };

  const handleLinkClick = (view: string) => {
    onViewChange(view);
    if (isMobile) setMenuOpen(false);
  };

  return (
    <nav style={navStyle}>
      <div 
        style={logoStyle}
        onClick={() => handleLinkClick('projects')}
      >
        Portfolio IW
      </div>
      
      <div id="nav-links" style={navLinksStyle}>
        <span
          style={currentView === 'projects' ? activeLinkStyle : linkStyle}
          onClick={() => handleLinkClick('projects')}
        >
          Projets
        </span>
        
        <span
          style={currentView === 'search' ? activeLinkStyle : linkStyle}
          onClick={() => handleLinkClick('search')}
        >
          Recherche
        </span>
        
        {user ? (
          <>
            <span
              style={currentView === 'profile' ? activeLinkStyle : linkStyle}
              onClick={() => handleLinkClick('profile')}
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
              onClick={() => handleLinkClick('login')}
            >
              Connexion
            </span>
            <span
              style={currentView === 'register' ? activeLinkStyle : linkStyle}
              onClick={() => handleLinkClick('register')}
            >
              Inscription
            </span>
          </>
        )}
      </div>

      <button
        style={hamburgerButtonStyle}
        aria-label="Menu"
        aria-controls="nav-links"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((o) => !o)}
      >
        <span style={{ ...hamburgerBarStyle, marginTop: 0, transform: menuOpen ? 'translateY(9px) rotate(45deg)' : 'none' }} />
        <span style={{ ...hamburgerBarStyle, opacity: menuOpen ? 0 : 1 }} />
        <span style={{ ...hamburgerBarStyle, transform: menuOpen ? 'translateY(-9px) rotate(-45deg)' : 'none' }} />
      </button>
    </nav>
  );
};

export default Navigation;
