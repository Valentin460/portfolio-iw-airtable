import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface RegisterFormProps {
  onSuccess: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { register } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.email || !formData.password || !formData.firstName || !formData.lastName) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      await register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone || undefined
      });
      
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  const containerStyle: React.CSSProperties = {
    maxWidth: '500px',
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

  const rowStyle: React.CSSProperties = {
    display: 'flex',
    gap: '1rem'
  };

  const inputGroupStyle: React.CSSProperties = {
    flex: 1
  };

  const inputStyle: React.CSSProperties = {
    padding: '0.75rem',
    fontSize: '1rem',
    borderRadius: '4px',
    border: '1px solid #61dafb',
    backgroundColor: '#1a1a1a',
    color: '#ffffff',
    width: '100%',
    boxSizing: 'border-box'
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

  const requiredStyle: React.CSSProperties = {
    color: '#ff6b6b'
  };

  const infoStyle: React.CSSProperties = {
    textAlign: 'center',
    marginTop: '1rem',
    color: '#888',
    fontSize: '0.9rem',
    lineHeight: '1.4'
  };

  return (
    <div style={containerStyle}>
      <h2 style={titleStyle}>Inscription</h2>
      
      {error && <div style={errorStyle}>{error}</div>}
      
      <form onSubmit={handleSubmit} style={formStyle}>
        <div style={rowStyle}>
          <div style={inputGroupStyle}>
            <label style={labelStyle}>
              Prénom <span style={requiredStyle}>*</span>
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              style={inputStyle}
              placeholder="Votre prénom"
              required
            />
          </div>
          
          <div style={inputGroupStyle}>
            <label style={labelStyle}>
              Nom <span style={requiredStyle}>*</span>
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              style={inputStyle}
              placeholder="Votre nom"
              required
            />
          </div>
        </div>
        
        <div>
          <label style={labelStyle}>
            Email <span style={requiredStyle}>*</span>
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            style={inputStyle}
            placeholder="votre@email.com"
            required
          />
        </div>
        
        <div>
          <label style={labelStyle}>
            Téléphone
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            style={inputStyle}
            placeholder="06 12 34 56 78 (optionnel)"
          />
        </div>
        
        <div style={rowStyle}>
          <div style={inputGroupStyle}>
            <label style={labelStyle}>
              Mot de passe <span style={requiredStyle}>*</span>
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              style={inputStyle}
              placeholder="Min. 6 caractères"
              required
            />
          </div>
          
          <div style={inputGroupStyle}>
            <label style={labelStyle}>
              Confirmer <span style={requiredStyle}>*</span>
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              style={inputStyle}
              placeholder="Répétez le mot de passe"
              required
            />
          </div>
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
          {loading ? 'Inscription...' : 'S\'inscrire'}
        </button>
      </form>
      
      <div style={infoStyle}>
        <p>
          Créez un compte pour liker des projets et laisser vos coordonnées 
          pour être contacté par le service admissions.
        </p>
        <p>
          <span style={requiredStyle}>*</span> Champs obligatoires
        </p>
      </div>
    </div>
  );
};

export default RegisterForm;
