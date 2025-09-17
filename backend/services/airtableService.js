const Airtable = require('airtable');

// Configuration Airtable
const base = new Airtable({
  apiKey: process.env.AIRTABLE_KEY
}).base(process.env.AIRTABLE_BASE_ID);

const airtableService = {
  
  // Récupérer tous les projets
  async getAllProjects() {
    try {
      const records = await base(process.env.AIRTABLE_PROJECT_TABLE_ID).select().all();
      
      return records.map(record => ({
        id: record.id,
        airtableId: record.fields.id,
        title: record.fields.title,
        description: record.fields.description,
        createdAt: record.fields.createdAt,
        likes: record.fields.Like ? record.fields.Like.length : 0,
        picture: record.fields.picture && record.fields.picture.length > 0 
          ? record.fields.picture[0].url 
          : null
      }));
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  },

  // Récupérer un projet par ID
  async getProjectById(projectId) {
    try {
      const record = await base(process.env.AIRTABLE_PROJECT_TABLE_ID).find(projectId);
      
      return {
        id: record.id,
        airtableId: record.fields.id,
        title: record.fields.title,
        description: record.fields.description,
        createdAt: record.fields.createdAt,
        likes: record.fields.Like ? record.fields.Like.length : 0,
        picture: record.fields.picture && record.fields.picture.length > 0 
          ? record.fields.picture[0].url 
          : null
      };
    } catch (error) {
      console.error('Error fetching project:', error);
      throw error;
    }
  },

  // Rechercher des projets par mots-clés
  async searchProjects(keywords) {
    try {
      const records = await base(process.env.AIRTABLE_PROJECT_TABLE_ID).select({
        filterByFormula: `OR(SEARCH("${keywords}", {title}), SEARCH("${keywords}", {description}))`
      }).all();
      
      return records.map(record => ({
        id: record.id,
        airtableId: record.fields.id,
        title: record.fields.title,
        description: record.fields.description,
        createdAt: record.fields.createdAt,
        likes: record.fields.Like ? record.fields.Like.length : 0,
        picture: record.fields.picture && record.fields.picture.length > 0 
          ? record.fields.picture[0].url 
          : null
      }));
    } catch (error) {
      console.error('Error searching projects:', error);
      throw error;
    }
  },

  
  // Créer un utilisateur
  async createUser(userData) {
    try {
      // Préparer les champs (sans createdAt/updatedAt qui sont calculés)
      const fields = {
        email: userData.email,
        passwordHash: userData.passwordHash,
        firstName: userData.firstName,
        lastName: userData.lastName
      };
      
      // Ajouter le téléphone seulement s'il est fourni et le convertir en nombre
      if (userData.phone && userData.phone.trim() !== '') {
        // Nettoyer le numéro (supprimer espaces, tirets, etc.)
        const cleanPhone = userData.phone.replace(/[\s\-\(\)]/g, '');
        // Convertir en nombre si c'est un numéro valide
        const phoneNumber = parseFloat(cleanPhone);
        if (!isNaN(phoneNumber)) {
          fields.phone = phoneNumber;
        }
      }
      
      const records = await base(process.env.AIRTABLE_USER_TABLE_ID).create([
        { fields }
      ]);
      
      const record = records[0];
      return {
        id: record.id,
        email: record.fields.email,
        firstName: record.fields.firstName,
        lastName: record.fields.lastName,
        phone: record.fields.phone,
        createdAt: record.fields.createdAt
      };
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  // Récupérer un utilisateur par email
  async getUserByEmail(email) {
    try {
      const records = await base(process.env.AIRTABLE_USER_TABLE_ID).select({
        filterByFormula: `{email} = "${email}"`
      }).all();
      
      if (records.length === 0) {
        return null;
      }
      
      const record = records[0];
      return {
        id: record.id,
        airtableId: record.fields.id,
        email: record.fields.email,
        passwordHash: record.fields.passwordHash,
        firstName: record.fields.firstName,
        lastName: record.fields.lastName,
        phone: record.fields.phone,
        createdAt: record.fields.createdAt,
        updatedAt: record.fields.updatedAt
      };
    } catch (error) {
      console.error('Error fetching user by email:', error);
      throw error;
    }
  },

  // Récupérer un utilisateur par ID
  async getUserById(userId) {
    try {
      const record = await base(process.env.AIRTABLE_USER_TABLE_ID).find(userId);
      
      return {
        id: record.id,
        airtableId: record.fields.id,
        email: record.fields.email,
        firstName: record.fields.firstName,
        lastName: record.fields.lastName,
        phone: record.fields.phone,
        createdAt: record.fields.createdAt,
        updatedAt: record.fields.updatedAt
      };
    } catch (error) {
      console.error('Error fetching user by ID:', error);
      throw error;
    }
  },

  // Mettre à jour un utilisateur
  async updateUser(userId, userData) {
    try {
      // Préparer les champs (sans updatedAt qui est calculé)
      const fields = { ...userData };
      
      // Convertir le téléphone en nombre si fourni
      if (fields.phone && typeof fields.phone === 'string' && fields.phone.trim() !== '') {
        const cleanPhone = fields.phone.replace(/[\s\-\(\)]/g, '');
        const phoneNumber = parseFloat(cleanPhone);
        if (!isNaN(phoneNumber)) {
          fields.phone = phoneNumber;
        }
      }
      
      const records = await base(process.env.AIRTABLE_USER_TABLE_ID).update([
        {
          id: userId,
          fields
        }
      ]);
      
      const record = records[0];
      return {
        id: record.id,
        email: record.fields.email,
        firstName: record.fields.firstName,
        lastName: record.fields.lastName,
        phone: record.fields.phone,
        updatedAt: record.fields.updatedAt
      };
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  // Supprimer un utilisateur
  async deleteUser(userId) {
    try {
      await base(process.env.AIRTABLE_USER_TABLE_ID).destroy([userId]);
      return { success: true };
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },

  
  // Ajouter un like
  async addLike(userId, projectAirtableId) {
    try {
      // Vérifier si le like existe déjà
      const existingLikes = await base(process.env.AIRTABLE_LIKE_TABLE_ID).select({
        filterByFormula: `AND({user} = "${userId}", {project} = "${projectAirtableId}")`
      }).all();
      
      if (existingLikes.length > 0) {
        throw new Error('Like already exists');
      }
      
      const records = await base(process.env.AIRTABLE_LIKE_TABLE_ID).create([
        {
          fields: {
            user: [userId],
            project: projectAirtableId, // Utiliser directement l'airtableId (texte simple)
            createdAt: new Date().toISOString().split('T')[0]
          }
        }
      ]);
      
      return { success: true, likeId: records[0].id };
    } catch (error) {
      console.error('Error adding like:', error);
      throw error;
    }
  },

  // Supprimer un like
  async removeLike(userId, projectAirtableId) {
    try {
      const records = await base(process.env.AIRTABLE_LIKE_TABLE_ID).select({
        filterByFormula: `AND({user} = "${userId}", {project} = "${projectAirtableId}")`
      }).all();
      
      if (records.length === 0) {
        throw new Error('Like not found');
      }
      
      await base(process.env.AIRTABLE_LIKE_TABLE_ID).destroy([records[0].id]);
      return { success: true };
    } catch (error) {
      console.error('Error removing like:', error);
      throw error;
    }
  },

  // Vérifier si un utilisateur a liké un projet
  async hasUserLikedProject(userId, projectAirtableId) {
    try {
      const records = await base(process.env.AIRTABLE_LIKE_TABLE_ID).select({
        filterByFormula: `AND({user} = "${userId}", {project} = "${projectAirtableId}")`
      }).all();
      
      return records.length > 0;
    } catch (error) {
      console.error('Error checking like status:', error);
      throw error;
    }
  }
};

module.exports = airtableService;
