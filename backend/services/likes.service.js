const { base, airtableCall } = require('../config/airtable');
const projectsService = require('./projects.service');

// Petit cache en mémoire pour les likes
const LIKES_CACHE_TTL_MS = 30 * 1000; // 30s
const likesCache = new Map(); // key: userId -> { data: Set, timestamp }

function recordBelongsToUser(record, userId) {
  const target = String(userId);
  const userField = record.fields.user;

  if (!userField) {
    return false;
  }

  if (Array.isArray(userField)) {
    return userField.some((value) => String(value) === target);
  }

  if (typeof userField === 'string' || typeof userField === 'number') {
    return String(userField) === target;
  }

  return false;
}

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

    // On récupère toutes les entrées puis on filtre côté Node
    const records = await airtableCall(
      () =>
        base(process.env.AIRTABLE_LIKE_TABLE_ID)
          .select()
          .all(),
      `GET /Likes (for user ${userId})`
    );

    const userRecords = records.filter((r) => recordBelongsToUser(r, userId));

    const likedProjects = new Set(
      userRecords
        .map((r) => r.fields.project)
        .filter((p) => p != null)
        .map((p) => String(p))
    ); // set des airtableId de projet

    likesCache.set(cacheKey, {
      data: likedProjects,
      timestamp: Date.now()
    });

    return likedProjects;
  },

  // Ajouter un like
  async addLike(userId, projectAirtableId) {
    try {
      // Vérifier si le like existe déjà via le Set calculé
      const likedProjects = await this.getLikedProjectsForUser(userId);
      if (likedProjects.has(String(projectAirtableId))) {
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

      // Invalider le cache des projets pour refléter le nouveau nombre de likes
      projectsService.invalidateCache();

      return { success: true, likeId: records[0].id };
    } catch (error) {
      console.error('Error adding like:', error);
      throw error;
    }
  },

  // Supprimer un like
  async removeLike(userId, projectAirtableId) {
    try {
      // Récupérer tous les likes puis filtrer côté Node
      const records = await airtableCall(
        () =>
          base(process.env.AIRTABLE_LIKE_TABLE_ID)
            .select()
            .all(),
        'GET /Likes (find for delete)'
      );

      const userRecords = records.filter((r) => recordBelongsToUser(r, userId));

      const target = String(projectAirtableId);

      const likeRecord = userRecords.find((r) => {
        const projectField = r.fields.project;

        if (projectField == null) {
          return false;
        }

        // Champ texte / nombre simple
        if (typeof projectField === 'string' || typeof projectField === 'number') {
          return String(projectField) === target;
        }

        // Champ tableau (par ex. lien vers un projet)
        if (Array.isArray(projectField)) {
          return projectField.some((value) => {
            if (typeof value === 'string' || typeof value === 'number') {
              return String(value) === target;
            }
            if (value && typeof value === 'object' && 'id' in value) {
              return String(value.id) === target;
            }
            return false;
          });
        }

        // Objet simple avec un id
        if (typeof projectField === 'object' && 'id' in projectField) {
          return String(projectField.id) === target;
        }

        return false;
      });

      if (!likeRecord) {
        throw new Error('Like not found');
      }
      
      await airtableCall(
        () => base(process.env.AIRTABLE_LIKE_TABLE_ID).destroy([likeRecord.id]),
        'DELETE /Likes/:id'
      );

      // Invalider le cache des likes pour cet utilisateur
      likesCache.delete(String(userId));

      // Invalider le cache des projets pour refléter le nouveau nombre de likes
      projectsService.invalidateCache();

      return { success: true };
    } catch (error) {
      console.error('Error removing like:', error);
      throw error;
    }
  },

  // Vérifier si un utilisateur a liké un projet
  async hasUserLikedProject(userId, projectAirtableId) {
    try {
      const likedProjects = await this.getLikedProjectsForUser(userId);
      return likedProjects.has(String(projectAirtableId));
    } catch (error) {
      console.error('Error checking like status:', error);
      throw error;
    }
  }
};

module.exports = likesService;
