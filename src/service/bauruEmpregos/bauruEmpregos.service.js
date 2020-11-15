/* eslint-disable class-methods-use-this */
const cheerio = require('cheerio');
const formatISO = require('date-fns/formatISO');
const Source = require('../../model/source.model');
const Job = require('../../model/job.model');
const JobSource = require('../../constants/jobSource');

// Utils
const { getItemsUntilMatch, isEmpty } = require('../../utils/collection.utils');
const LastJobsPage = require('./model/LastJobsPage.model');
const StringUtils = require('../../utils/string.utils');
const JobPage = require('./model/JobPage.model');

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

  async getSource() {
    return this.sourceRepository.getSource(JobSource.BAURU_EMPREGOS);
  }

  /**
   * Gets the html of the page that contains the last published jobs.
   * @return {Promise<LastJobsPage>}
   */
  async fetchLastJobsPage() {
    const source = await this.getSource();
    const lastJobsPageRequest = await this.crawler.getPage(source.jobsUrl);
    return new LastJobsPage({ html: lastJobsPageRequest.body });
  }

  async fetchJobPage({ id, url, baseUrl } = {}) {
    const hasBaseUrl = !StringUtils.isEmpty(baseUrl);
    const hasUrl = !StringUtils.isEmpty(url);
    const hasId = !StringUtils.isEmpty(id);

    let source;

    if (!hasUrl && !hasId) {
      throw new Error('404 - Job not found at source.');
    }

    if (!hasBaseUrl) {
      source = await this.getSource();
    }

    const sourceBaseUrl = baseUrl || source.baseUrl;

    const jobUrl = hasUrl
      ? sourceBaseUrl + url
      : `${sourceBaseUrl}/home/detalhes/${id}`;

    const jobPageRequest = await this.crawler.getPage(jobUrl);

    const jobPage = new JobPage({ html: jobPageRequest.body, url, id });

    return jobPage;
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
   * @param {Job[]} jobSummaries The job summaries.
   * @param {JobSource} source The job source.
   * @return {Promise<Job[]>}
   */
  async expandJobSumaries(jobSummaries, source) {
    return Promise.all(jobSummaries.map(async (jobSummary) => {
      const { url, id } = jobSummary;
      const { baseUrl } = source;
      const jobPage = await this.fetchJobPage({ url, id, baseUrl });
      return jobPage.job;
    }));
  }

  async run() {
    this.logger.info('[BauruEmpregosService] Started crawling.');

    this.logger.info(`[BauruEmpregosService] Fetching source ${JobSource.BAURU_EMPREGOS}.`);
    const source = await this.sourceRepository.getSource(JobSource.BAURU_EMPREGOS);

    this.logger.info('[BauruEmpregosService] Fetching last jobs page.');
    const lastJobsPage = await this.fetchLastJobsPage();

    this.logger.info('[BauruEmpregosService] Parsing jobs from last jobs page.');
    const jobSummaries = lastJobsPage.jobs;

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

    const hasNotificationsToSend = !isEmpty(notifications);

    if (hasNotificationsToSend) {
      // await this.notifyService.notifyByEmail(notifications);
    }

    const lastCheck = formatISO(new Date());
    const lastJobIdentifier = newJobs[0].id;

    // This is needed so we don't notify users about the same job more than once.
    await this.updateSource(lastCheck, lastJobIdentifier);
    this.logger.info(`[BauruEmpregosService] Updating lastJobIdentifier to ${lastJobIdentifier} and lastCheck to ${lastCheck}.`);

    return true;
  }
};
