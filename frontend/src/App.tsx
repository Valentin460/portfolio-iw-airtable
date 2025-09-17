import React, { useState } from 'react';
import './App.css';
import { AuthProvider } from './contexts/AuthContext';
import Navigation from './components/Navigation';
import ProjectList from './components/ProjectList';
import SearchProjects from './components/SearchProjects';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import UserProfile from './components/UserProfile';
import { Project } from './types';

function App() {
  const [currentView, setCurrentView] = useState('projects');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const handleViewChange = (view: string) => {
    setCurrentView(view);
    setSelectedProject(null);
  };

  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project);
    setCurrentView('project-detail');
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'projects':
        return <ProjectList onProjectSelect={handleProjectSelect} />;
      
      case 'search':
        return <SearchProjects onProjectSelect={handleProjectSelect} />;
      
      case 'login':
        return <LoginForm onSuccess={() => setCurrentView('projects')} />;
      
      case 'register':
        return <RegisterForm onSuccess={() => setCurrentView('projects')} />;
      
      case 'profile':
        return <UserProfile onViewChange={handleViewChange} />;
      
      case 'project-detail':
        return selectedProject ? (
          <ProjectDetail 
            project={selectedProject} 
            onBack={() => setCurrentView('projects')} 
          />
        ) : (
          <ProjectList onProjectSelect={handleProjectSelect} />
        );
      
      default:
        return <ProjectList onProjectSelect={handleProjectSelect} />;
    }
  };

  return (
    <AuthProvider>
      <div className="App">
        <Navigation 
          currentView={currentView} 
          onViewChange={handleViewChange} 
        />
        {renderCurrentView()}
      </div>
    </AuthProvider>
  );
}

// Composant pour afficher le détail d'un projet
interface ProjectDetailProps {
  project: Project;
  onBack: () => void;
}

const ProjectDetail: React.FC<ProjectDetailProps> = ({ project, onBack }) => {
  const containerStyle: React.CSSProperties = {
    maxWidth: '800px',
    margin: '2rem auto',
    padding: '2rem',
    backgroundColor: '#282c34',
    borderRadius: '8px',
    border: '1px solid #61dafb'
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '2.5rem',
    color: '#61dafb',
    marginBottom: '1rem'
  };

  const descriptionStyle: React.CSSProperties = {
    fontSize: '1.1rem',
    color: '#ffffff',
    lineHeight: '1.6',
    marginBottom: '2rem'
  };

  const metaStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem',
    backgroundColor: '#1a1a1a',
    borderRadius: '4px',
    marginBottom: '2rem'
  };

  const backButtonStyle: React.CSSProperties = {
    padding: '0.75rem 1.5rem',
    fontSize: '1rem',
    backgroundColor: '#61dafb',
    color: '#282c34',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold'
  };

  const likeInfoStyle: React.CSSProperties = {
    fontSize: '1.2rem',
    color: project.isLiked ? '#ff6b6b' : '#888'
  };

  return (
    <div style={containerStyle}>
      <button 
        onClick={onBack}
        style={backButtonStyle}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#4fa8c5';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#61dafb';
        }}
      >
        ← Retour aux projets
      </button>
      
      <h1 style={titleStyle}>{project.title}</h1>
      
      {project.picture && (
        <img 
          src={project.picture} 
          alt={project.title}
          style={{
            width: '100%',
            maxHeight: '400px',
            objectFit: 'cover',
            borderRadius: '8px',
            marginBottom: '2rem'
          }}
        />
      )}
      
      <div style={metaStyle}>
        <span style={{ color: '#888' }}>
          Créé le {new Date(project.createdAt).toLocaleDateString()}
        </span>
        <span style={likeInfoStyle}>
          {project.isLiked ? '❤️' : '🤍'} {project.likes} like{project.likes > 1 ? 's' : ''}
        </span>
      </div>
      
      <div style={descriptionStyle}>
        {project.description}
      </div>
    </div>
  );
};

export default App;
