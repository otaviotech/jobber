const cheerio = require('cheerio');
const JobSource = require('../../../constants/jobSource');
const Job = require('../../../model/job.model');
const { isEmpty } = require('../../../utils/string.utils');

class LastJobsPage {
  constructor({
    html,
    jobs,
  } = {}) {
    this.html = html;
    this.jobs = jobs || this.parseJobs();
  }

  /**
   * Extract the jobs from the page that contains the last published jobs.
   * @return {Job[]}
   */
  parseJobs() {
    if (isEmpty(this.html)) {
      return [];
    }

    const $ = cheerio.load(this.html);

    const jobs = $('.vaga').map((i, cheerioEl) => {
      const jobElement = $(cheerioEl);

      const title = jobElement.find('.descricao-vaga').text().trim();
      const description = jobElement.find('.descricao-vaga a').text().trim();
      const url = jobElement.find('.descricao-vaga a').attr('href');
      const id = url.replace('/home/detalhes/', '');
      const city = jobElement.find('.cidade-vaga').text();

      const job = new Job({
        id,
        title,
        description,
        city,
        url,
        jobSource: JobSource.BAURU_EMPREGOS,
      });

      return job;
    }).get();

    this.jobs = jobs;

    return jobs;
  }
}

module.exports = LastJobsPage;
