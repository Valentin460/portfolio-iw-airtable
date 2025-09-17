import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface LoginFormProps {
  onSuccess: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await login(email, password);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la connexion');
    } finally {
      setLoading(false);
    }
  };

  const containerStyle: React.CSSProperties = {
    maxWidth: '400px',
    margin: '2rem auto',
    padding: '2rem',
    backgroundColor: '#282c34',
    borderRadius: '8px',
    border: '1px solid #61dafb'
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '1.8rem',
    color: '#61dafb',
    textAlign: 'center',
    marginBottom: '2rem'
  };

  const formStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  };

  const inputStyle: React.CSSProperties = {
    padding: '0.75rem',
    fontSize: '1rem',
    borderRadius: '4px',
    border: '1px solid #61dafb',
    backgroundColor: '#1a1a1a',
    color: '#ffffff'
  };

  const buttonStyle: React.CSSProperties = {
    padding: '0.75rem',
    fontSize: '1rem',
    backgroundColor: '#61dafb',
    color: '#282c34',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'background-color 0.3s'
  };

  const disabledButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: '#888',
    cursor: 'not-allowed'
  };

  const errorStyle: React.CSSProperties = {
    color: '#ff6b6b',
    textAlign: 'center',
    marginBottom: '1rem',
    padding: '0.5rem',
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderRadius: '4px',
    border: '1px solid #ff6b6b'
  };

  const labelStyle: React.CSSProperties = {
    color: '#ffffff',
    marginBottom: '0.5rem',
    fontWeight: 'bold'
  };

  return (
    <div style={containerStyle}>
      <h2 style={titleStyle}>Connexion</h2>
      
      {error && <div style={errorStyle}>{error}</div>}
      
      <form onSubmit={handleSubmit} style={formStyle}>
        <div>
          <label style={labelStyle}>Email :</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
            placeholder="votre@email.com"
            required
          />
        </div>
        
        <div>
          <label style={labelStyle}>Mot de passe :</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
            placeholder="Votre mot de passe"
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          style={loading ? disabledButtonStyle : buttonStyle}
          onMouseEnter={(e) => {
            if (!loading) {
              e.currentTarget.style.backgroundColor = '#4fa8c5';
            }
          }}
          onMouseLeave={(e) => {
            if (!loading) {
              e.currentTarget.style.backgroundColor = '#61dafb';
            }
          }}
        >
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>
      </form>
      
      <div style={{ 
        textAlign: 'center', 
        marginTop: '1rem', 
        color: '#888',
        fontSize: '0.9rem'
      }}>
        Connectez-vous pour liker des projets et gérer votre profil
      </div>
    </div>
  );
};

export default LoginForm;
