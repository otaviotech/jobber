const Source = require('../../../model/source.model');

const SOURCES = '/sources.json';

module.exports = class SourceRepository {
  constructor({ firebaseClient } = {}) {
    this.firebaseClient = firebaseClient;
  }

  async getSources() {
    const res = await this.firebaseClient.get(SOURCES);
    return res.data;
  }

  async getSource(jobSource) {
    const sources = await this.getSources();

    const dbSource = sources.find((h) => h.jobSource === jobSource);

    const foundRecord = !!dbSource;

    if (!foundRecord) {
      throw new Error(`[SourceRepository] 404 - Source not found for job source ${jobSource}.`);
    }

    const source = new Source({
      jobSource: dbSource.jobSource,
      lastJobIdentifier: dbSource.lastJobIdentifier,
      lastCheck: dbSource.lastCheck,
      baseUrl: dbSource.baseUrl,
      jobsUrl: dbSource.jobsUrl,
    });

    return source;
  }

  async update(source) {
    const findBySource = (h) => h.jobSource === source.jobSource;

    const sources = await this.getSources();

    const exists = !!sources.find(findBySource);

    if (!exists) {
      throw new Error(`[SourceRepository] 404 - History not found for source ${source.jobSource}.`);
    }

    const updatedSources = sources.map((s) => {
      if (s.jobSource === source.jobSource) {
        return Object.assign(s, {
          jobSource: source.jobSource,
          lastJobIdentifier: source.lastJobIdentifier,
          lastCheck: source.lastCheck,
        });
      }

      return s;
    });

    const updatedSource = updatedSources.find(findBySource);

    await this.firebaseClient.put(SOURCES, updatedSources);

    return updatedSource;
  }
};
