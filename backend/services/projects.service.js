const { base, airtableCall } = require('../config/airtable');

// Petit cache en mémoire pour limiter les appels Airtable
const PROJECTS_CACHE_TTL_MS = 30 * 1000; // 30s
let projectsCache = { data: null, timestamp: 0 };

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

      const projects = records.map(record => ({
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
      const records = await airtableCall(
        () =>
          base(process.env.AIRTABLE_PROJECT_TABLE_ID)
            .select({
              filterByFormula: `OR(SEARCH("${keywords}", {title}), SEARCH("${keywords}", {description}))`
            })
            .all(),
        `GET /Projects?search=${keywords}`
      );

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
  }
};

module.exports = projectsService;
