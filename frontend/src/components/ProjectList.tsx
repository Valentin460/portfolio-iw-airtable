import React, { useState, useEffect } from "react";
import Skeleton from "@mui/material/Skeleton";
import { Project } from "../types";
import { apiService } from "../services/api";
import { useAuth } from "../contexts/AuthContext";

interface ProjectListProps {
  onProjectSelect: (project: Project) => void;
}

const ProjectList: React.FC<ProjectListProps> = ({ onProjectSelect }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    loadProjects();
  }, [user]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const projectsData = await apiService.getProjects();
      await new Promise<void>((resolve) => setTimeout(resolve, 1000));
      setProjects(projectsData);
      setError(null);
    } catch (err) {
      setError("Erreur lors du chargement des projets");
      console.error("Error loading projects:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!user) {
      alert("Vous devez être connecté pour liker un projet");
      return;
    }

    try {
      if (project.isLiked) {
        await apiService.unlikeProject(project.airtableId.toString());
      } else {
        await apiService.likeProject(project.airtableId.toString());
      }

      // Recharger les projets pour mettre à jour les likes
      await loadProjects();
    } catch (err) {
      console.error("Error toggling like:", err);
      alert("Erreur lors de la mise à jour du like");
    }
  };

  const containerStyle: React.CSSProperties = {
    padding: "2rem",
    maxWidth: "1200px",
    margin: "0 auto",
  };

  const titleStyle: React.CSSProperties = {
    fontSize: "2rem",
    marginBottom: "2rem",
    color: "#61dafb",
    textAlign: "center",
  };

  const gridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "2rem",
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: "#282c34",
    border: "1px solid #61dafb",
    borderRadius: "8px",
    padding: "1.5rem",
    cursor: "pointer",
    transition: "transform 0.2s, box-shadow 0.2s",
    position: "relative",
  };

  const cardHoverStyle: React.CSSProperties = {
    ...cardStyle,
    transform: "translateY(-4px)",
    boxShadow: "0 4px 12px rgba(97, 218, 251, 0.3)",
  };

  const projectTitleStyle: React.CSSProperties = {
    fontSize: "1.3rem",
    fontWeight: "bold",
    color: "#61dafb",
    marginBottom: "1rem",
  };

  const descriptionStyle: React.CSSProperties = {
    color: "#ffffff",
    marginBottom: "1rem",
    lineHeight: "1.5",
  };

  const metaStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "0.9rem",
    color: "#888",
  };

  const likeButtonStyle: React.CSSProperties = {
    background: "none",
    border: "none",
    fontSize: "1.2rem",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    color: "#888",
    transition: "color 0.2s",
  };

  const likedButtonStyle: React.CSSProperties = {
    ...likeButtonStyle,
    color: "#ff6b6b",
  };

  const loadingStyle: React.CSSProperties = {
    textAlign: "center",
    fontSize: "1.2rem",
    color: "#61dafb",
    padding: "2rem",
  };

  const errorStyle: React.CSSProperties = {
    textAlign: "center",
    fontSize: "1.2rem",
    color: "#ff6b6b",
    padding: "2rem",
  };

  if (loading) {
    return (
      <div style={containerStyle}>
        <h1 style={titleStyle}>Projets étudiants - Ingénierie du Web</h1>
        <div style={gridStyle}>
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} style={cardStyle}>
              <Skeleton
                variant="text"
                width="60%"
                height={28}
                sx={{ bgcolor: "grey.800" }}
              />
              <Skeleton
                variant="rectangular"
                height={200}
                sx={{ borderRadius: "4px", my: 1, bgcolor: "grey.900" }}
              />
              <Skeleton
                variant="text"
                width="90%"
                sx={{ bgcolor: "grey.800" }}
              />
              <Skeleton
                variant="text"
                width="80%"
                sx={{ bgcolor: "grey.800" }}
              />
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: "0.5rem",
                }}
              >
                <Skeleton
                  variant="text"
                  width={120}
                  sx={{ bgcolor: "grey.800" }}
                />
                <Skeleton
                  variant="circular"
                  width={24}
                  height={24}
                  sx={{ bgcolor: "grey.800" }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={errorStyle}>
        {error}
        <br />
        <button
          onClick={loadProjects}
          style={{
            marginTop: "1rem",
            padding: "0.5rem 1rem",
            backgroundColor: "#61dafb",
            color: "#282c34",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>Projets Étudiants - Ingénierie du Web</h1>

      {projects.length === 0 ? (
        <div style={loadingStyle}>Aucun projet disponible</div>
      ) : (
        <div style={gridStyle}>
          {projects.map((project) => (
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
              <h3 style={projectTitleStyle}>{project.title}</h3>
              {project.picture && (
                <img
                  src={project.picture}
                  alt={project.title}
                  style={{
                    width: "100%",
                    height: "200px",
                    objectFit: "cover",
                    borderRadius: "4px",
                    marginBottom: "1rem",
                  }}
                />
              )}
              <p style={descriptionStyle}>
                {project.description.length > 150
                  ? `${project.description.substring(0, 150)}...`
                  : project.description}
              </p>
              <div style={metaStyle}>
                <span>
                  Créé le {new Date(project.createdAt).toLocaleDateString()}
                </span>
                <button
                  style={project.isLiked ? likedButtonStyle : likeButtonStyle}
                  onClick={(e) => handleLike(project, e)}
                  onMouseEnter={(e) => {
                    if (!project.isLiked) {
                      e.currentTarget.style.color = "#ff6b6b";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!project.isLiked) {
                      e.currentTarget.style.color = "#888";
                    }
                  }}
                >
                  {project.isLiked ? "❤️" : "🤍"} {project.likes}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectList;
