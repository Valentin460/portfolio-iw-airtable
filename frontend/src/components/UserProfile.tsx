import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface UserProfileProps {
  onViewChange: (view: string) => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ onViewChange }) => {
  const { user, updateProfile, deleteAccount } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      await updateProfile(formData);
      setSuccess('Profil mis à jour avec succès');
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setLoading(true);
      await deleteAccount();
      // L'utilisateur sera automatiquement déconnecté et redirigé
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la suppression du compte');
      setLoading(false);
    }
  };

  const containerStyle: React.CSSProperties = {
    maxWidth: '600px',
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

  const sectionStyle: React.CSSProperties = {
    marginBottom: '2rem',
    padding: '1.5rem',
    backgroundColor: '#1a1a1a',
    borderRadius: '8px',
    border: '1px solid #444'
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: '1.2rem',
    color: '#61dafb',
    marginBottom: '1rem',
    fontWeight: 'bold'
  };

  const infoRowStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem',
    color: '#ffffff'
  };

  const labelStyle: React.CSSProperties = {
    fontWeight: 'bold',
    color: '#888'
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
    padding: '0.75rem 1.5rem',
    fontSize: '1rem',
    backgroundColor: '#61dafb',
    color: '#282c34',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'background-color 0.3s'
  };

  const secondaryButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: '#888',
    color: '#ffffff'
  };

  const dangerButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: '#ff6b6b',
    color: '#ffffff'
  };

  const disabledButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: '#444',
    cursor: 'not-allowed'
  };

  const buttonGroupStyle: React.CSSProperties = {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center'
  };

  const messageStyle: React.CSSProperties = {
    padding: '1rem',
    borderRadius: '4px',
    marginBottom: '1rem',
    textAlign: 'center'
  };

  const successStyle: React.CSSProperties = {
    ...messageStyle,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    border: '1px solid #4caf50',
    color: '#4caf50'
  };

  const errorStyle: React.CSSProperties = {
    ...messageStyle,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    border: '1px solid #ff6b6b',
    color: '#ff6b6b'
  };

  const confirmDialogStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  };

  const dialogContentStyle: React.CSSProperties = {
    backgroundColor: '#282c34',
    padding: '2rem',
    borderRadius: '8px',
    border: '1px solid #61dafb',
    maxWidth: '400px',
    textAlign: 'center'
  };

  if (!user) {
    return (
      <div style={containerStyle}>
        <div style={{ textAlign: 'center', color: '#ff6b6b' }}>
          Erreur : utilisateur non connecté
        </div>
      </div>
    );
  }

  return (
    <>
      <div style={containerStyle}>
        <h2 style={titleStyle}>Mon Profil</h2>
        
        {success && <div style={successStyle}>{success}</div>}
        {error && <div style={errorStyle}>{error}</div>}
        
        {/* Informations du compte */}
        <div style={sectionStyle}>
          <h3 style={sectionTitleStyle}>Informations du compte</h3>
          <div style={infoRowStyle}>
            <span style={labelStyle}>Email :</span>
            <span>{user.email}</span>
          </div>
          <div style={infoRowStyle}>
            <span style={labelStyle}>Membre depuis :</span>
            <span>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</span>
          </div>
          <div style={infoRowStyle}>
            <span style={labelStyle}>Dernière mise à jour :</span>
            <span>{user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'N/A'}</span>
          </div>
        </div>

        {/* Informations personnelles */}
        <div style={sectionStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={sectionTitleStyle}>Informations personnelles</h3>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                style={buttonStyle}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#4fa8c5';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#61dafb';
                }}
              >
                Modifier
              </button>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={handleSubmit} style={formStyle}>
              <div>
                <label style={labelStyle}>Prénom :</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  style={inputStyle}
                  required
                />
              </div>
              
              <div>
                <label style={labelStyle}>Nom :</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  style={inputStyle}
                  required
                />
              </div>
              
              <div>
                <label style={labelStyle}>Téléphone :</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  style={inputStyle}
                  placeholder="Optionnel"
                />
              </div>
              
              <div style={buttonGroupStyle}>
                <button
                  type="submit"
                  disabled={loading}
                  style={loading ? disabledButtonStyle : buttonStyle}
                >
                  {loading ? 'Sauvegarde...' : 'Sauvegarder'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      firstName: user.firstName,
                      lastName: user.lastName,
                      phone: user.phone || ''
                    });
                    setError(null);
                    setSuccess(null);
                  }}
                  style={secondaryButtonStyle}
                  disabled={loading}
                >
                  Annuler
                </button>
              </div>
            </form>
          ) : (
            <>
              <div style={infoRowStyle}>
                <span style={labelStyle}>Prénom :</span>
                <span>{user.firstName}</span>
              </div>
              <div style={infoRowStyle}>
                <span style={labelStyle}>Nom :</span>
                <span>{user.lastName}</span>
              </div>
              <div style={infoRowStyle}>
                <span style={labelStyle}>Téléphone :</span>
                <span>{user.phone || 'Non renseigné'}</span>
              </div>
            </>
          )}
        </div>

        {/* Actions dangereuses */}
        <div style={sectionStyle}>
          <h3 style={sectionTitleStyle}>Zone de danger</h3>
          <p style={{ color: '#888', marginBottom: '1rem' }}>
            La suppression de votre compte est irréversible. Toutes vos données seront perdues.
          </p>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            style={dangerButtonStyle}
            disabled={loading}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = '#ff5252';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = '#ff6b6b';
              }
            }}
          >
            Supprimer mon compte
          </button>
        </div>
      </div>

      {/* Dialog de confirmation de suppression */}
      {showDeleteConfirm && (
        <div style={confirmDialogStyle}>
          <div style={dialogContentStyle}>
            <h3 style={{ color: '#ff6b6b', marginBottom: '1rem' }}>
              Confirmer la suppression
            </h3>
            <p style={{ color: '#ffffff', marginBottom: '2rem' }}>
              Êtes-vous sûr de vouloir supprimer votre compte ? 
              Cette action est irréversible.
            </p>
            <div style={buttonGroupStyle}>
              <button
                onClick={handleDeleteAccount}
                style={dangerButtonStyle}
                disabled={loading}
              >
                {loading ? 'Suppression...' : 'Oui, supprimer'}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                style={secondaryButtonStyle}
                disabled={loading}
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UserProfile;
