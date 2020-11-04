module.exports = class Source {
  constructor({
    jobSource, lastJobIdentifier, lastCheck, baseUrl, jobsUrl,
  } = {}) {
    // This is the source from where to collect data.
    // The constant JobSource.
    // E.g.: JobSource.BAURU_EMPREGOS
    this.jobSource = jobSource;

    // This is the last job identifier.
    // This can change from source to source.
    // Usually it is the id of the job on the source.
    // E.g.: '12345'
    this.lastJobIdentifier = lastJobIdentifier;

    // This represents when the last check was performed on the job source.
    // This is a timestamp.
    this.lastCheck = lastCheck;

    this.baseUrl = baseUrl;

    this.jobsUrl = jobsUrl;
  }
};
