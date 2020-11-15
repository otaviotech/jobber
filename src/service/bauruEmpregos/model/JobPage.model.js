const cheerio = require('cheerio');
const JobSource = require('../../../constants/jobSource');
const Job = require('../../../model/job.model');
const { isEmpty } = require('../../../utils/string.utils');

class JobPage {
  constructor({
    html,
    job,
    url,
    id,
  } = {}) {
    this.html = html;
    this.job = job || this.parseJob(url, id);
  }

  parseJob(url, id) {
    if (isEmpty(this.html)) {
      return;
    }

    const $ = cheerio.load(this.html);

    const title = $('.descricao-vaga h1 b').text().trim();
    const date = $('.descricao-vaga p').first().text().trim()
      .replace('Cadastrado em: ', '');
    const description = $('.descricao-vaga pre').text().trim();
    const descriptionHtml = $('.descricao-vaga pre').html();
    const city = $('.descricao-vaga p').eq(2).text().replace('Vaga em ', '');

    const job = new Job({
      id, title, description, descriptionHtml, city, url, date, jobSource: JobSource.BAURU_EMPREGOS,
    });

    this.job = job;

    return job; // eslint-disable-line consistent-return
  }
}

module.exports = JobPage;
