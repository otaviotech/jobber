module.exports = function JobRepository (db) {
    async function containsLastJobId(jobs) {
        const lastJob = await db.get('jobs').last().value();
        return !!jobs.find(job => job.id === lastJob.id);
    }
    
    async function jobExists(job) {
        const dbJob = await db.get('jobs').find({ id: job.id }).value();
        return !!dbJob;
    }
    
    async function addJob(job){
        return db.get('jobs').push(job).write();
    }

    return {
        containsLastJobId,
        jobExists,
        addJob,
    };
}