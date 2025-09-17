const jwt = require('jsonwebtoken');
const airtableService = require('../services/airtableService');

// Clé secrète pour JWT (à mettre dans .env en production)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

const authMiddleware = {
  // Générer un token JWT
  generateToken(user) {
    return jwt.sign(
      { 
        userId: user.id, 
        email: user.email 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
  },

  // Middleware pour vérifier le token
  async verifyToken(req, res, next) {
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({ 
          error: 'Access denied. No token provided.' 
        });
      }

      const decoded = jwt.verify(token, JWT_SECRET);
      
      // Récupérer les informations utilisateur depuis Airtable
      const user = await airtableService.getUserById(decoded.userId);
      
      if (!user) {
        return res.status(401).json({ 
          error: 'Invalid token. User not found.' 
        });
      }

      req.user = user;
      next();
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ 
          error: 'Invalid token.' 
        });
      }
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          error: 'Token expired.' 
        });
      }
      
      console.error('Auth middleware error:', error);
      res.status(500).json({ 
        error: 'Server error during authentication.' 
      });
    }
  },

  // Middleware optionnel (pour les routes où l'auth est optionnelle)
  async optionalAuth(req, res, next) {
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '');
      
      if (!token) {
        req.user = null;
        return next();
      }

      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await airtableService.getUserById(decoded.userId);
      
      req.user = user || null;
      next();
    } catch (error) {
      // En cas d'erreur, on continue sans utilisateur
      req.user = null;
      next();
    }
  }
};

module.exports = authMiddleware;
