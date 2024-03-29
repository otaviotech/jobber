module.exports = class Notification {
  constructor({ subscription, jobs }) {
    this.subscription = subscription;
    this.jobs = jobs;
    this.emailHtml = this.getEmailHtml(jobs);
    this.emailText = this.getEmailHtml(jobs);
  }

  getEmailHtml() {
    // Utils.
    const p = (content) => `<p>${content}</p>`;
    const h5 = (content) => `<h5>${content}</h5>`;
    const a = (href, content) => `<a href="${href}">${content}</a>`;

    const usePlural = this.jobs.length > 1;

    const greet = p(`Hi, ${this.subscription.name}.`);
    const jobsFound = p(`We found ${this.jobs.length} new job opportunit${usePlural ? 'ies' : 'y'} that match${usePlural ? '' : 'es'} your interests!`);
    const doNotReply = p('This email was generated by a robot. Please do not reply it. :)');
    const madeWith = p(`Made with ❤️ by ${a('https://github.com/otaviotech', 'otaviotech')} .`);

    const jobsHtml = this.jobs.map((job, index) => {
      const { title, url } = job;

      const jobHtmlTitle = h5(`Job ${index + 1}: ${a(url, title)}`);

      const jobHtmlLines = [
        jobHtmlTitle,
      ];

      return jobHtmlLines.join('');
    }).join('');

    const htmlLines = [
      greet,
      jobsFound,
      jobsHtml,
      doNotReply,
      madeWith,
    ];

    return htmlLines.join('');
  }
};
