const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const airtableService = require('./services/airtableService');
const authMiddleware = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());


// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'Portfolio IW API is running!', 
    timestamp: new Date().toISOString() 
  });
});


// Récupérer tous les projets
app.get('/api/projects', authMiddleware.optionalAuth, async (req, res) => {
  try {
    const projects = await airtableService.getAllProjects();
    
    // Si l'utilisateur est connecté, ajouter l'info sur les likes
    if (req.user) {
      for (let project of projects) {
        project.isLiked = await airtableService.hasUserLikedProject(req.user.id, project.airtableId.toString());
      }
    }
    
    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// Récupérer un projet par ID
app.get('/api/projects/:id', authMiddleware.optionalAuth, async (req, res) => {
  try {
    const project = await airtableService.getProjectById(req.params.id);
    
    // Si l'utilisateur est connecté, ajouter l'info sur le like
    if (req.user) {
      project.isLiked = await airtableService.hasUserLikedProject(req.user.id, project.airtableId.toString());
    }
    
    res.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(404).json({ error: 'Project not found' });
  }
});

// Rechercher des projets
app.get('/api/projects/search/:keywords', authMiddleware.optionalAuth, async (req, res) => {
  try {
    const projects = await airtableService.searchProjects(req.params.keywords);
    
    // Si l'utilisateur est connecté, ajouter l'info sur les likes
    if (req.user) {
      for (let project of projects) {
        project.isLiked = await airtableService.hasUserLikedProject(req.user.id, project.airtableId.toString());
      }
    }
    
    res.json(projects);
  } catch (error) {
    console.error('Error searching projects:', error);
    res.status(500).json({ error: 'Failed to search projects' });
  }
});


// Inscription
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone } = req.body;
    
    // Validation des données
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ 
        error: 'Email, password, firstName and lastName are required' 
      });
    }
    
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await airtableService.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ 
        error: 'User already exists with this email' 
      });
    }
    
    // Hasher le mot de passe
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    // Créer l'utilisateur
    const user = await airtableService.createUser({
      email,
      passwordHash,
      firstName,
      lastName,
      phone: phone || null
    });
    
    // Générer le token
    const token = authMiddleware.generateToken(user);
    
    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Connexion
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email and password are required' 
      });
    }
    
    // Récupérer l'utilisateur
    const user = await airtableService.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid email or password' 
      });
    }
    
    // Vérifier le mot de passe
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ 
        error: 'Invalid email or password' 
      });
    }
    
    // Générer le token
    const token = authMiddleware.generateToken(user);
    
    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});


// Profil utilisateur
app.get('/api/user/profile', authMiddleware.verifyToken, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user.id,
        email: req.user.email,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        phone: req.user.phone,
        createdAt: req.user.createdAt,
        updatedAt: req.user.updatedAt
      }
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Mettre à jour le profil
app.put('/api/user/profile', authMiddleware.verifyToken, async (req, res) => {
  try {
    const { firstName, lastName, phone } = req.body;
    
    const updatedUser = await airtableService.updateUser(req.user.id, {
      firstName: firstName || req.user.firstName,
      lastName: lastName || req.user.lastName,
      phone: phone !== undefined ? phone : req.user.phone
    });
    
    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Supprimer le compte
app.delete('/api/user/profile', authMiddleware.verifyToken, async (req, res) => {
  try {
    await airtableService.deleteUser(req.user.id);
    
    res.json({
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
});


// Liker un projet
app.post('/api/projects/:projectId/like', authMiddleware.verifyToken, async (req, res) => {
  try {
    const result = await airtableService.addLike(req.user.id, req.params.projectId);
    
    res.json({
      message: 'Project liked successfully',
      ...result
    });
  } catch (error) {
    if (error.message === 'Like already exists') {
      return res.status(400).json({ error: 'You have already liked this project' });
    }
    
    console.error('Like error:', error);
    res.status(500).json({ error: 'Failed to like project' });
  }
});

// Supprimer un like
app.delete('/api/projects/:projectId/like', authMiddleware.verifyToken, async (req, res) => {
  try {
    await airtableService.removeLike(req.user.id, req.params.projectId);
    
    res.json({
      message: 'Like removed successfully'
    });
  } catch (error) {
    if (error.message === 'Like not found') {
      return res.status(404).json({ error: 'Like not found' });
    }
    
    console.error('Unlike error:', error);
    res.status(500).json({ error: 'Failed to remove like' });
  }
});

// Route par défaut
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to Portfolio IW API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      projects: '/api/projects',
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login'
      },
      user: {
        profile: '/api/user/profile'
      }
    }
  });
});

app.listen(PORT, () => {
  console.log(`Portfolio IW API is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});
