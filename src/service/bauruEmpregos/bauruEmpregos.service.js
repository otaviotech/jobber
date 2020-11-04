const formatISO = require('date-fns/formatISO');
const Source = require('../../model/source.model');
const Job = require('../../model/job.model');
const JobSource = require('../../constants/jobSource');

module.exports = class BauruEmpregosService  {
    constructor({ 
        crawler, 
        sourceRepository, 
        subscriptionService, 
        notifyService,
    } = {}) {
        this.crawler = crawler;
        this.sourceRepository = sourceRepository;
        this.subscriptionService = subscriptionService;
        this.notifyService = notifyService;
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

    async getJobDetails(jobSummary, source) {
        const url = source.baseUrl + jobSummary.url;
        const page = await this.crawler.getPage(url);
        const $ = page.$;
        const title = $('.descricao-vaga h1 b').text().trim();
        const date = $('.descricao-vaga p').first().text().trim().replace('Cadastrado em: ', '');
        const description = $('.descricao-vaga pre').text().trim();
        const descriptionHtml = $('.descricao-vaga pre').html();
        const id = jobSummary.id;
        const city = $('.descricao-vaga p').eq(2).text().replace('Vaga em ', '');
        const job = new Job({ id, title, description, descriptionHtml, city, url, date, jobSource: JobSource.BAURU_EMPREGOS });
        return job;
    }

    parseJobsFromPage(page) {
        const jobs = page.$('.vaga').map(function (index, element) {
            const $ = page.$(this);
            
            const title = $.find('.descricao-vaga').text().trim();
            const description = $.find('.descricao-vaga a').text().trim();
            const url = $.find('.descricao-vaga a').attr('href');
            const id = url.replace('/home/detalhes/', '');
            const city = $.find('.cidade-vaga').text();

            const job = new Job({ id, title, description, city, url, jobSource: JobSource.BAURU_EMPREGOS });
            
            return job;
        }).get();

        return jobs;
    }

    async hasNewJobs(lastFoundJobIdentifier) {
        const source = await this.sourceRepository.getSource(JobSource.BAURU_EMPREGOS);
        return lastFoundJobIdentifier !== source.lastJobIdentifier;
    }

    getNewJobs(jobs, lastJobIdentifier) {
        const newJobs = [];

        jobs.some((job) => {
            const isLastJob = job.id === lastJobIdentifier;

            // We already handled this job.
            if (isLastJob) {
                return true;
            }

            newJobs.push(job);

            return false;
        });

        return newJobs;
    }

    async expandJobSumaries(jobSummaries, source) {
        return await Promise.all(jobSummaries.map(js => this.getJobDetails(js, source)));
    }

    async run() {
        console.log(`[BauruEmpregosService] Started crawling.`);
        console.log(`[BauruEmpregosService] Fetching source ${JobSource.BAURU_EMPREGOS}.`);
        const source = await this.sourceRepository.getSource(JobSource.BAURU_EMPREGOS);

        console.log(`[BauruEmpregosService] Fetching jobs page.`);
        const fullJobsPage = await this.crawler.getPage(source.jobsUrl);

        const jobSummaries = this.parseJobsFromPage(fullJobsPage);
        const lastFoundJobIdentifier = jobSummaries[0].id;

        const shouldUpdate = await this.hasNewJobs(lastFoundJobIdentifier);

        if (!shouldUpdate) {
            console.log(`[BauruEmpregosService] No new jobs since job with id ${source.lastJobIdentifier}.`);
            return true;
        }

        // TODO: fetch jobSummaries until last recorded.
        const newJobsSummaries = this.getNewJobs(jobSummaries, source.lastJobIdentifier);

        console.log(`[BauruEmpregosService] Expanding ${newJobsSummaries.length} new jobs.`);
        const newJobs = await this.expandJobSumaries(newJobsSummaries, source);

        const notifications = await this.subscriptionService.getNotificationsBySubscription(JobSource.BAURU_EMPREGOS, newJobs);
        
        const hasNotificationsToSend = notifications.length > 0;

        if (hasNotificationsToSend) {
            await this.notifyService.notifyByEmail(notifications);
        }

        const lastCheck = formatISO(new Date());
        const lastJobIdentifier = newJobs[0].id;

        // This is needed so we don't notify users about the same job more than once.
        await this.updateSource(lastCheck, lastJobIdentifier);
        console.log(`[BauruEmpregosService] Updating lastJobIdentifier to ${lastJobIdentifier} and lastCheck to ${lastCheck}.`);

        return true;
    }
}