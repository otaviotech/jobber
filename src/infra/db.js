const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const Memory = require('lowdb/adapters/Memory');

const JobSources = require('../constants/jobSource');

const adapter = process.env.NODE_ENV === 'test'
    ? new Memory()
    : new FileSync('db.json');

const db = low(adapter);

// Set some defaults (required if your JSON file is empty)
db
    .defaults({
        subscriptions: [
            {
                id: "HD5hgYkEmgkqe1PLjD5Lz", // nanoid
                email: 'otaviotech@gmail.com',
                tags: [
                    'contadora',
                    'contador',
                    'contabilidade',
                    'totvs',
                    'contas',
                    'cont[áa]beis',
                    'financeiro',
                    'cont[áa]bil',
                ],
                excludeTags: [
                    'est[áa]gio',
                    'estagi[áa]rio',
                ],
                name: 'Otávio',
                metadata: {
                    subject: 'Jobber - New jobs found!',
                    body: `Look the jobs I've found for you:`,
                    footer: `Please do not reply, we won't see it! :)`,
                },
                sources: [
                    JobSources.BAURU_EMPREGOS,
                ],
            },
        ],
        sources: [
            {
                jobSource: 'BAURU_EMPREGOS',
                lastJobIdentifier: '57803',
                lastCheck: '2020-10-28T19:33:29Z',
                baseUrl: 'https://bauruempregos.com.br',
                jobsUrl: 'https://bauruempregos.com.br/home/vagas',
            },
        ],
    })
    .write();

module.exports = db;