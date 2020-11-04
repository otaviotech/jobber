module.exports = class JobRepository {
    constructor({ db } = {}) {
        this.db = db;
    }

    async containsLastJobId(jobs) {
        const lastJob = await this.db.get('jobs').last().value();
        return !!jobs.find(job => job.id === lastJob.id);
    }
    
    async jobExists(job) {
        const dbJob = await this.db.get('jobs').find({ id: job.id }).value();
        return !!dbJob;
    }
    
    async addJob(job){
        return this.db.get('jobs').push(job).write();
    }
}