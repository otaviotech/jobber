const formatISO = require('date-fns/formatISO');
const Source = require('../model/source.model');
const Job = require('../model/job.model');
const JobSource = require('../constants/jobSource');

module.exports = function BauruEmpregosService ({ 
    crawler, 
    sourceRepository, 
    subscriptionService, 
    notifyService,
 } = {}) {
    async function updateSource(lastCheck, lastJobIdentifier) {
        const historyEntry = new Source({
            jobSource: JobSource.BAURU_EMPREGOS,
            lastJobIdentifier,
            lastCheck,
        });

        const updatedSource = await sourceRepository.update(historyEntry);
        
        return updatedSource;
    }

    async function getJobDetails(jobSummary, source) {
        const url = source.baseUrl + jobSummary.url;
        const page = await crawler.getPage(url);
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

    function parseJobsFromPage(page) {
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

    async function hasNewJobs(lastFoundJobIdentifier) {
        const source = await sourceRepository.getSource(JobSource.BAURU_EMPREGOS);
        return lastFoundJobIdentifier !== source.lastJobIdentifier;
    }

    function getNewJobs(jobs, lastJobIdentifier) {
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

    async function expandJobSumaries(jobSummaries, source) {
        return await Promise.all(jobSummaries.map(js => getJobDetails(js, source)));
    }

    async function run() {
        const source = await sourceRepository.getSource(JobSource.BAURU_EMPREGOS);
        const fullJobsPage = await crawler.getPage(source.jobsUrl);
        const jobSummaries = parseJobsFromPage(fullJobsPage);
        const lastFoundJobIdentifier = jobSummaries[0].id;
        
        const shouldUpdate = await hasNewJobs(lastFoundJobIdentifier);

        if (!shouldUpdate) {
            console.log(`[BauruEmpregosService] No new jobs since job with id ${source.lastJobIdentifier}.`);
            return true;
        }

        // TODO: fetch jobSummaries until last recorded.
        const newJobsSummaries = getNewJobs(jobSummaries, source.lastJobIdentifier);
        const newJobs = await expandJobSumaries(newJobsSummaries, source);
        const notifications = await subscriptionService.getNotificationsBySubscription(JobSource.BAURU_EMPREGOS, newJobs);
        
        const hasNotificationsToSend = notifications.length > 0;

        if (hasNotificationsToSend) {
            await notifyService.notifyByEmail(notifications);
        }

        const lastCheck = formatISO(new Date());
        const lastJobIdentifier = newJobs[0].id;

        // This is needed so we don't notify users about the same job more than once.
        await updateSource(lastCheck, lastJobIdentifier);
        console.log(`[BauruEmpregosService] Updating lastJobIdentifier to ${lastJobIdentifier} and lastCheck to ${lastCheck}.`);

        return true;
    }

    return {
        getJobDetails,
        parseJobsFromPage,
        run,
    }
}