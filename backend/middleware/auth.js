const jwt = require('jsonwebtoken');

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

      // Ne pas appeler Airtable ici : on se contente du contenu du JWT
      req.user = {
        id: decoded.userId,
        email: decoded.email
      };
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

      // Auth optionnelle : on ne recharge pas l'utilisateur depuis Airtable
      req.user = {
        id: decoded.userId,
        email: decoded.email
      };
      next();
    } catch (error) {
      // En cas d'erreur, on continue sans utilisateur
      req.user = null;
      next();
    }
  }
};

module.exports = authMiddleware;
