const Source = require('../../model/source.model');

module.exports = class SourceRepository {
  constructor({ db } = {}) {
    this.db = db;
  }

  async getSource(jobSource) {
    const dbSource = await this.db
      .get('sources')
      .find((h) => h.jobSource === jobSource)
      .value();

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

    const exists = !!await this.db.get('sources').find(findBySource).value();

    if (!exists) {
      throw new Error(`[SourceRepository] 404 - History not found for source ${source.jobSource}.`);
    }

    const updatedSource = await this.db
      .get('sources')
      .find(findBySource)
      .assign({
        jobSource: source.jobSource,
        lastJobIdentifier: source.lastJobIdentifier,
        lastCheck: source.lastCheck,
      })
      .write();

    return updatedSource;
  }
};
