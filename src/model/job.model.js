/**
 * A Job role.
 * @class
 * @constructor
 */
class Job {
  constructor({
    id,
    title,
    description,
    descriptionHtml,
    city,
    url,
    date,
    jobSource,
  } = {}) {
    /**
     * The unique identifier of the job on its source.
     * @type {string}
     */
    this.id = id;
    this.title = title;
    this.description = description;
    this.descriptionHtml = descriptionHtml;
    this.city = city;
    this.url = url;
    this.date = date;
    this.jobSource = jobSource;
  }
}

module.exports = Job;
