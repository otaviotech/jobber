module.exports = class Job {
    constructor({ id, title, description, descriptionHtml, city, url, date, jobSource } = {}) {
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