import React, { useState, useEffect } from 'react';
import { Project } from '../types';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface SearchProjectsProps {
  onProjectSelect: (project: Project) => void;
}

const SearchProjects: React.FC<SearchProjectsProps> = ({ onProjectSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [filteredResults, setFilteredResults] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Charger tous les projets au démarrage
  useEffect(() => {
    loadAllProjects();
  }, [user]);

  // Filtrer les projets quand le terme de recherche change
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredResults(allProjects);
    } else {
      const filtered = allProjects.filter(project => 
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredResults(filtered);
    }
  }, [searchTerm, allProjects]);

  const loadAllProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const projectsData = await apiService.getProjects();
      setAllProjects(projectsData);
      setFilteredResults(projectsData);
    } catch (err) {
      setError('Erreur lors du chargement des projets');
      console.error('Error loading projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!user) {
      alert('Vous devez être connecté pour liker un projet');
      return;
    }

    try {
      if (project.isLiked) {
        await apiService.unlikeProject(project.airtableId.toString());
      } else {
        await apiService.likeProject(project.airtableId.toString());
      }
      
      // Mettre à jour les projets localement
      const updateProjects = (projects: Project[]) =>
        projects.map(p =>
          p.id === project.id
            ? { 
                ...p, 
                isLiked: !p.isLiked, 
                likes: p.isLiked ? p.likes - 1 : p.likes + 1 
              }
            : p
        );
      
      setAllProjects(updateProjects);
      setFilteredResults(updateProjects);
    } catch (err) {
      console.error('Error toggling like:', err);
      alert('Erreur lors de la mise à jour du like');
    }
  };

  const containerStyle: React.CSSProperties = {
    padding: '2rem',
    maxWidth: '1200px',
    margin: '0 auto'
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '2rem',
    marginBottom: '2rem',
    color: '#61dafb',
    textAlign: 'center'
  };

  const searchFormStyle: React.CSSProperties = {
    display: 'flex',
    gap: '1rem',
    marginBottom: '2rem',
    maxWidth: '600px',
    margin: '0 auto 2rem auto'
  };

  const searchInputStyle: React.CSSProperties = {
    flex: 1,
    padding: '0.75rem',
    fontSize: '1rem',
    borderRadius: '4px',
    border: '1px solid #61dafb',
    backgroundColor: '#1a1a1a',
    color: '#ffffff'
  };

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '2rem'
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: '#282c34',
    border: '1px solid #61dafb',
    borderRadius: '8px',
    padding: '1.5rem',
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s'
  };

  const cardHoverStyle: React.CSSProperties = {
    ...cardStyle,
    transform: 'translateY(-4px)',
    boxShadow: '0 4px 12px rgba(97, 218, 251, 0.3)'
  };

  const projectTitleStyle: React.CSSProperties = {
    fontSize: '1.3rem',
    fontWeight: 'bold',
    color: '#61dafb',
    marginBottom: '1rem'
  };

  const descriptionStyle: React.CSSProperties = {
    color: '#ffffff',
    marginBottom: '1rem',
    lineHeight: '1.5'
  };

  const metaStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '0.9rem',
    color: '#888'
  };

  const likeButtonStyle: React.CSSProperties = {
    background: 'none',
    border: 'none',
    fontSize: '1.2rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: '#888',
    transition: 'color 0.2s'
  };

  const likedButtonStyle: React.CSSProperties = {
    ...likeButtonStyle,
    color: '#ff6b6b'
  };

  const messageStyle: React.CSSProperties = {
    textAlign: 'center',
    fontSize: '1.2rem',
    color: '#61dafb',
    padding: '2rem'
  };

  const errorStyle: React.CSSProperties = {
    textAlign: 'center',
    fontSize: '1.2rem',
    color: '#ff6b6b',
    padding: '1rem',
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderRadius: '4px',
    border: '1px solid #ff6b6b',
    marginBottom: '2rem'
  };

  const highlightSearchTerm = (text: string, term: string) => {
    if (!term) return text;
    
    const regex = new RegExp(`(${term})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) =>
      regex.test(part) ? (
        <span key={index} style={{ backgroundColor: '#61dafb', color: '#282c34', padding: '0 2px' }}>
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  if (loading) {
    return <div style={messageStyle}>Chargement des projets...</div>;
  }

  if (error) {
    return (
      <div style={containerStyle}>
        <div style={errorStyle}>
          {error}
          <br />
          <button 
            onClick={loadAllProjects}
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              backgroundColor: '#61dafb',
              color: '#282c34',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>Rechercher des Projets</h1>
      
      <div style={searchFormStyle}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Rechercher par titre ou description..."
          style={searchInputStyle}
        />
      </div>

      {searchTerm && (
        <div style={{ ...messageStyle, marginBottom: '2rem' }}>
          {filteredResults.length} projet{filteredResults.length > 1 ? 's' : ''} trouvé{filteredResults.length > 1 ? 's' : ''} pour "{searchTerm}"
        </div>
      )}

      {filteredResults.length === 0 && searchTerm ? (
        <div style={messageStyle}>
          Aucun projet trouvé pour "{searchTerm}"
        </div>
      ) : (
        <div style={gridStyle}>
          {filteredResults.map((project) => (
            <div
              key={project.id}
              style={cardStyle}
              onClick={() => onProjectSelect(project)}
              onMouseEnter={(e) => {
                Object.assign(e.currentTarget.style, cardHoverStyle);
              }}
              onMouseLeave={(e) => {
                Object.assign(e.currentTarget.style, cardStyle);
              }}
            >
              <h3 style={projectTitleStyle}>
                {highlightSearchTerm(project.title, searchTerm)}
              </h3>
              {project.picture && (
                <img 
                  src={project.picture} 
                  alt={project.title}
                  style={{
                    width: '100%',
                    height: '200px',
                    objectFit: 'cover',
                    borderRadius: '4px',
                    marginBottom: '1rem'
                  }}
                />
              )}
              <p style={descriptionStyle}>
                {highlightSearchTerm(
                  project.description.length > 150 
                    ? `${project.description.substring(0, 150)}...` 
                    : project.description,
                  searchTerm
                )}
              </p>
              <div style={metaStyle}>
                <span>Créé le {new Date(project.createdAt).toLocaleDateString()}</span>
                <button
                  style={project.isLiked ? likedButtonStyle : likeButtonStyle}
                  onClick={(e) => handleLike(project, e)}
                  onMouseEnter={(e) => {
                    if (!project.isLiked) {
                      e.currentTarget.style.color = '#ff6b6b';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!project.isLiked) {
                      e.currentTarget.style.color = '#888';
                    }
                  }}
                >
                  {project.isLiked ? '❤️' : '🤍'} {project.likes}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!searchTerm && allProjects.length > 0 && (
        <div style={{ ...messageStyle, fontSize: '1rem', color: '#888' }}>
          {allProjects.length} projet{allProjects.length > 1 ? 's' : ''} disponible{allProjects.length > 1 ? 's' : ''}. Tapez dans la barre de recherche pour filtrer.
        </div>
      )}
    </div>
  );
};

export default SearchProjects;
