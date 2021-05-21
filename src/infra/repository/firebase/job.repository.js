const JOBS = '/jobs.json';

module.exports = class JobRepository {
  constructor({ firebaseClient } = {}) {
    this.firebaseClient = firebaseClient;
  }

  async getJobs() {
    const res = await this.firebaseClient.get(JOBS);
    return res.data;
  }

  async containsLastJobId(jobs) {
    const dbJobs = this.getJobs();

    if (!dbJobs || !dbJobs.length) {
      return false;
    }

    const lastJob = dbJobs[dbJobs.length - 1];

    return !!jobs.find((job) => job.id === lastJob.id);
  }

  async jobExists(job) {
    const dbJobs = await this.getJobs();

    if (!dbJobs || !dbJobs.length) {
      return false;
    }

    const dbJob = dbJobs.find({ id: job.id });

    return !!dbJob;
  }

  async addJob(job) {
    let dbJobs = await this.getJobs();

    if (!dbJobs) {
      dbJobs = [];
    }

    dbJobs.push(job);

    await this.firebaseClient.put(JOBS, dbJobs);

    return dbJobs;
  }
};
