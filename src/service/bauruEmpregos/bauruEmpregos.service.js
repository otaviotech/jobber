/* eslint-disable class-methods-use-this */
const cheerio = require('cheerio');
const formatISO = require('date-fns/formatISO');
const Source = require('../../model/source.model');
const Job = require('../../model/job.model');
const JobSource = require('../../constants/jobSource');

// Utils
const { getItemsUntilMatch, isEmpty } = require('../../utils/collection.utils');

module.exports = class BauruEmpregosService {
  constructor({
    crawler,
    sourceRepository,
    subscriptionService,
    notifyService,
    logger,
  } = {}) {
    this.crawler = crawler;
    this.sourceRepository = sourceRepository;
    this.subscriptionService = subscriptionService;
    this.notifyService = notifyService;
    this.logger = logger;
  }

  /**
   * @return {Promise<String>}
   */
  async fetchLastJobsPage() {
    const source = await this.sourceRepository.getSource(JobSource.BAURU_EMPREGOS);
    const lastJobsPage = await this.crawler.getPage(source.jobsUrl);
    return lastJobsPage.body;
  }

  /**
   * @return {Job[]}
   */
  parseJobsFromLastJobsPage(lastJobsPage) {
    const $ = cheerio.load(lastJobsPage);

    return $('.vaga').map((i, cheerioEl) => {
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
  }

  async updateSource(lastCheck, lastJobIdentifier) {
    const historyEntry = new Source({
      jobSource: JobSource.BAURU_EMPREGOS,
      lastJobIdentifier,
      lastCheck,
    });

    const updatedSource = await this.sourceRepository.update(historyEntry);

    return updatedSource;
  }

  /**
   * @return {Job}
   */
  async getJobDetails(jobSummary, source) {
    const url = source.baseUrl + jobSummary.url;
    const page = await this.crawler.getPage(url);
    const { $ } = page;
    const title = $('.descricao-vaga h1 b').text().trim();
    const date = $('.descricao-vaga p').first().text().trim()
      .replace('Cadastrado em: ', '');
    const description = $('.descricao-vaga pre').text().trim();
    const descriptionHtml = $('.descricao-vaga pre').html();
    const { id } = jobSummary;
    const city = $('.descricao-vaga p').eq(2).text().replace('Vaga em ', '');
    const job = new Job({
      id, title, description, descriptionHtml, city, url, date, jobSource: JobSource.BAURU_EMPREGOS,
    });
    return job;
  }

  /**
   * @return {Job[]}
   */
  parseJobsFromPage(page) {
    const jobs = page.$('.vaga').map(function extractJobs() {
      const $ = page.$(this);

      const title = $.find('.descricao-vaga').text().trim();
      const description = $.find('.descricao-vaga a').text().trim();
      const url = $.find('.descricao-vaga a').attr('href');
      const id = url.replace('/home/detalhes/', '');
      const city = $.find('.cidade-vaga').text();

      const job = new Job({
        id, title, description, city, url, jobSource: JobSource.BAURU_EMPREGOS,
      });

      return job;
    }).get();

    return jobs;
  }

  /**
   * @param {String} lastFoundJobIdentifier The last found job identifier.
   * @return {Boolean}
   */
  async jobHasBeenComputed(lastFoundJobIdentifier) {
    const source = await this.sourceRepository.getSource(JobSource.BAURU_EMPREGOS);
    return lastFoundJobIdentifier !== source.lastJobIdentifier;
  }

  /**
   * @param {String} lastFoundJobIdentifier The last found job identifier.
   * @param {Job[]} jobs The job list.
   * @return {Job[]}
   */
  getOnlyNewJobs(jobs, lastJobIdentifier) {
    return getItemsUntilMatch(jobs, ({ id }) => id === lastJobIdentifier);
  }

  /**
   *
   * @param {Job[]} jobSummaries The job summaries.
   * @param {JobSource} source The job source.
   * @return {Promise<Job[]>}
   */
  async expandJobSumaries(jobSummaries, source) {
    return Promise.all(jobSummaries.map((js) => this.getJobDetails(js, source)));
  }

  async run() {
    this.logger.info('[BauruEmpregosService] Started crawling.');

    this.logger.info(`[BauruEmpregosService] Fetching source ${JobSource.BAURU_EMPREGOS}.`);
    const source = await this.sourceRepository.getSource(JobSource.BAURU_EMPREGOS);

    this.logger.info('[BauruEmpregosService] Fetching last jobs page.');
    const lastJobsPage = await this.fetchLastJobsPage();

    this.logger.info('[BauruEmpregosService] Parsing jobs from last jobs page.');
    const jobSummaries = this.parseJobsFromLastJobsPage(lastJobsPage);

    if (isEmpty(jobSummaries)) {
      throw new Error('Could not fetch jobs.');
    }

    const lastFoundJobIdentifier = jobSummaries[0].id;

    const shouldUpdate = await this.jobHasBeenComputed(lastFoundJobIdentifier);

    if (!shouldUpdate) {
      this.logger.info(`[BauruEmpregosService] No new jobs since job with id ${source.lastJobIdentifier}.`);
      return true;
    }

    // TODO: fetch jobSummaries until last recorded.
    const newJobsSummaries = this.getOnlyNewJobs(jobSummaries, source.lastJobIdentifier);

    this.logger.info(`[BauruEmpregosService] Expanding ${newJobsSummaries.length} new jobs.`);
    const newJobs = await this.expandJobSumaries(newJobsSummaries, source);

    const notifications = await this
      .subscriptionService
      .getNotificationsBySubscription(JobSource.BAURU_EMPREGOS, newJobs);

    const hasNotificationsToSend = notifications.length > 0;

    if (hasNotificationsToSend) {
      await this.notifyService.notifyByEmail(notifications);
    }

    const lastCheck = formatISO(new Date());
    const lastJobIdentifier = newJobs[0].id;

    // This is needed so we don't notify users about the same job more than once.
    await this.updateSource(lastCheck, lastJobIdentifier);
    this.logger.info(`[BauruEmpregosService] Updating lastJobIdentifier to ${lastJobIdentifier} and lastCheck to ${lastCheck}.`);

    return true;
  }
};
