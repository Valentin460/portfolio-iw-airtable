const { base, airtableCall } = require('../config/airtable');

// Petit cache en mémoire pour limiter les appels Airtable
const PROJECTS_CACHE_TTL_MS = 30 * 1000; // 30s
let projectsCache = { data: null, timestamp: 0 };

// Récupérer toutes les entrées de Likes et construire une map projet -> nombre de likes
async function getLikesCountByProject() {
  const likeRecords = await airtableCall(
    () =>
      base(process.env.AIRTABLE_LIKE_TABLE_ID)
        .select()
        .all(),
    'GET /Likes (for project counts)'
  );

  const likeCounts = new Map();

  for (const record of likeRecords) {
    const projectField = record.fields.project;
    if (projectField == null) continue;

    const key = String(projectField);
    const current = likeCounts.get(key) || 0;
    likeCounts.set(key, current + 1);
  }

  return likeCounts;
}

const projectsService = {
  invalidateCache() {
    projectsCache = { data: null, timestamp: 0 };
  },

  // Récupérer tous les projets
  async getAllProjects() {
    try {
      if (
        projectsCache.data &&
        Date.now() - projectsCache.timestamp < PROJECTS_CACHE_TTL_MS
      ) {
        return projectsCache.data;
      }

      const records = await airtableCall(
        () => base(process.env.AIRTABLE_PROJECT_TABLE_ID).select().all(),
        'GET /Projects'
      );

      const likeCounts = await getLikesCountByProject();

      const projects = records.map(record => ({
        id: record.id,
        airtableId: record.fields.id,
        title: record.fields.title,
        description: record.fields.description,
        createdAt: record.fields.createdAt,
        likes: likeCounts.get(String(record.fields.id)) || 0,
        picture: record.fields.picture && record.fields.picture.length > 0
          ? record.fields.picture[0].url
          : null
      }));

      projectsCache = {
        data: projects,
        timestamp: Date.now()
      };

      return projects;
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  },

  // Récupérer un projet par ID
  async getProjectById(projectId) {
    try {
      const record = await airtableCall(
        () => base(process.env.AIRTABLE_PROJECT_TABLE_ID).find(projectId),
        'GET /Projects/:id'
      );

      // Compter les likes pour ce projet à partir de la table Likes
      const likesRecords = await airtableCall(
        () =>
          base(process.env.AIRTABLE_LIKE_TABLE_ID)
            .select({
              filterByFormula: `{project} = "${record.fields.id}"`
            })
            .all(),
        `GET /Likes?project=${record.fields.id}`
      );

      return {
        id: record.id,
        airtableId: record.fields.id,
        title: record.fields.title,
        description: record.fields.description,
        createdAt: record.fields.createdAt,
        likes: likesRecords.length,
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
      const records = await airtableCall(
        () =>
          base(process.env.AIRTABLE_PROJECT_TABLE_ID)
            .select({
              filterByFormula: `OR(SEARCH("${keywords}", {title}), SEARCH("${keywords}", {description}))`
            })
            .all(),
        `GET /Projects?search=${keywords}`
      );

      const likeCounts = await getLikesCountByProject();

      return records.map(record => ({
        id: record.id,
        airtableId: record.fields.id,
        title: record.fields.title,
        description: record.fields.description,
        createdAt: record.fields.createdAt,
        likes: likeCounts.get(String(record.fields.id)) || 0,
        picture: record.fields.picture && record.fields.picture.length > 0
          ? record.fields.picture[0].url
          : null
      }));
    } catch (error) {
      console.error('Error searching projects:', error);
      throw error;
    }
  }
};

module.exports = projectsService;
