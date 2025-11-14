const { base, airtableCall } = require('../config/airtable');

const usersService = {
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

      const records = await airtableCall(
        () =>
          base(process.env.AIRTABLE_USER_TABLE_ID).create([
            { fields }
          ]),
        'POST /Users'
      );

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
      const records = await airtableCall(
        () =>
          base(process.env.AIRTABLE_USER_TABLE_ID)
            .select({
              filterByFormula: `{email} = "${email}"`
            })
            .all(),
        `GET /Users?email=${email}`
      );

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
      const record = await airtableCall(
        () => base(process.env.AIRTABLE_USER_TABLE_ID).find(userId),
        'GET /Users/:id'
      );

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

      const records = await airtableCall(
        () =>
          base(process.env.AIRTABLE_USER_TABLE_ID).update([
            {
              id: userId,
              fields
            }
          ]),
        'PATCH /Users/:id'
      );

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
      await airtableCall(
        () => base(process.env.AIRTABLE_USER_TABLE_ID).destroy([userId]),
        'DELETE /Users/:id'
      );
      return { success: true };
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }
};

module.exports = usersService;

