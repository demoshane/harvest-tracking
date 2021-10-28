require('dotenv').config({ path: '.env' });
const Harvest = require('harvest');

const client = new Harvest({
  subdomain: 'wunder', // Add your own subdomain here if you want to. Replace Wunder.
  useOAuth: false,
  email: process.env.HARVEST_EMAIL,
  password: process.env.HARVEST_PASSWORD,
  user_agent: 'Harvest API',
  debug: false,
  concurrency: '1',
});

module.exports = {
  getUsers: async () => {
    return new Promise((resolve, reject) => {
      client.people.list({}, (err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(
            res
              // Users contain a nested object.
              .map(u => u.user)

              // Filter out archived users and contractors.
              .filter(u => u.is_active && !u.is_contractor)
          );
        }
      });
    });
  },
  getTasks: async () => {
    return new Promise((resolve, reject) => {
      client.tasks.list({}, (err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(
            res
              // Users contain a nested object.
              .map(u => u.task)
          );
        }
      });
    });
  },
  getProjects: async () => {
    return new Promise((resolve, reject) => {
      client.projects.list({}, (err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(
            res
              // Projects contain a nested object.
              .map(p => p.project)
          );
        }
      });
    });
  },
  getClients: async () => {
    return new Promise((resolve, reject) => {
      client.clients.list({}, (err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(
            res
              // Clients contain a nested object.
              .map(c => c.client)
          );
        }
      });
    });
  },
  getUserEntries: async (harvest_user_id, from, to) => {
    return new Promise((resolve, reject) => {
      client.reports.timeEntriesByUser(
        harvest_user_id,
        {
          from: from,
          to: to
        },
        async (err, res) => {
          if (err) {
            reject(err);
          } else {
            resolve(res.body.map(entry => entry.day_entry));
          }
        }
      );
    });
  },
  getProjectEntries: async (project_id, from, to) => {
    return new Promise((resolve, reject) => {
      client.reports.timeEntriesByProject(
        {
          project_id: project_id,
          from: from,
          to: to
        },
        async (err, res) => {
          if (err) {
            reject(err);
          } else {
            resolve(res);
          }
        }
      );
    });
  }
};
