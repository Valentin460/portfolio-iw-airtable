const { base, airtableCall } = require('../config/airtable');

// Petit cache en mémoire pour les likes
const LIKES_CACHE_TTL_MS = 30 * 1000; // 30s
const likesCache = new Map(); // key: userId -> { data: Set, timestamp }

const likesService = {
  async getLikedProjectsForUser(userId) {
    const cacheKey = String(userId);
    const cached = likesCache.get(cacheKey);

    if (
      cached &&
      Date.now() - cached.timestamp < LIKES_CACHE_TTL_MS
    ) {
      return cached.data;
    }

    const records = await airtableCall(
      () =>
        base(process.env.AIRTABLE_LIKE_TABLE_ID)
          .select({
            filterByFormula: `{user} = "${userId}"`
          })
          .all(),
      `GET /Likes?user=${userId}`
    );

    const likedProjects = new Set(records.map(r => r.fields.project)); // set des airtableId de projet

    likesCache.set(cacheKey, {
      data: likedProjects,
      timestamp: Date.now()
    });

    return likedProjects;
  },

  // Ajouter un like
  async addLike(userId, projectAirtableId) {
    try {
      // Vérifier si le like existe déjà
      const existingLikes = await airtableCall(
        () =>
          base(process.env.AIRTABLE_LIKE_TABLE_ID)
            .select({
              filterByFormula: `AND({user} = "${userId}", {project} = "${projectAirtableId}")`
            })
            .all(),
        'GET /Likes (check existing)'
      );

      if (existingLikes.length > 0) {
        throw new Error('Like already exists');
      }

      const records = await airtableCall(
        () =>
          base(process.env.AIRTABLE_LIKE_TABLE_ID).create([
            {
              fields: {
                user: [userId],
                project: projectAirtableId, // Utiliser directement l'airtableId (texte simple)
                createdAt: new Date().toISOString().split('T')[0]
              }
            }
          ]),
        'POST /Likes'
      );

      // Invalider le cache des likes pour cet utilisateur
      likesCache.delete(String(userId));

      return { success: true, likeId: records[0].id };
    } catch (error) {
      console.error('Error adding like:', error);
      throw error;
    }
  },

  // Supprimer un like
  async removeLike(userId, projectAirtableId) {
    try {
      const records = await airtableCall(
        () =>
          base(process.env.AIRTABLE_LIKE_TABLE_ID)
            .select({
              filterByFormula: `AND({user} = "${userId}", {project} = "${projectAirtableId}")`
            })
            .all(),
        'GET /Likes (find for delete)'
      );

      if (records.length === 0) {
        throw new Error('Like not found');
      }

      await airtableCall(
        () => base(process.env.AIRTABLE_LIKE_TABLE_ID).destroy([records[0].id]),
        'DELETE /Likes/:id'
      );

      // Invalider le cache des likes pour cet utilisateur
      likesCache.delete(String(userId));

      return { success: true };
    } catch (error) {
      console.error('Error removing like:', error);
      throw error;
    }
  },

  // Vérifier si un utilisateur a liké un projet
  async hasUserLikedProject(userId, projectAirtableId) {
    try {
      const records = await airtableCall(
        () =>
          base(process.env.AIRTABLE_LIKE_TABLE_ID)
            .select({
              filterByFormula: `AND({user} = "${userId}", {project} = "${projectAirtableId}")`
            })
            .all(),
        'GET /Likes (check user/project)'
      );

      return records.length > 0;
    } catch (error) {
      console.error('Error checking like status:', error);
      throw error;
    }
  }
};

module.exports = likesService;

