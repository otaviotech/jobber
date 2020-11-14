const nock = require('nock');
const path = require('path');
const fs = require('fs');
const JobSource = require('../../constants/jobSource');
const Crawler = require('../../infra/crawler');
const BauruEmpregosService = require('./bauruEmpregos.service');
const Job = require('../../model/job.model');

describe('BauruEmpregosService', () => {
  const getBauruEmpregosJobSource = () => ({
    jobSource: 'BAURU_EMPREGOS',
    lastJobIdentifier: '57965',
    lastCheck: '2020-11-04T23:07:31Z',
    baseUrl: 'https://bauruempregos.com.br',
    jobsUrl: 'https://bauruempregos.com.br/home/vagas',
  });

  let crawler;
  let scope;
  let sourceRepository;
  let bauruEmpregosService;

  beforeAll(() => {
    crawler = new Crawler();
    scope = nock('https://bauruempregos.com.br');
    sourceRepository = {
      getSource: jest.fn().mockResolvedValueOnce(getBauruEmpregosJobSource()),
    };

    bauruEmpregosService = new BauruEmpregosService({ crawler, sourceRepository });
  });

  afterEach(() => {
    sourceRepository.getSource.mockClear();
  });

  const mockLastJobsPage = () => {
    const responsePath = path.join(__dirname, '../../../test/resources/crawler/bauruEmpregos__vagas.html');
    const response = fs.readFileSync(responsePath, 'utf-8');

    scope
      .get('/home/vagas')
      .replyWithFile(200, responsePath, { 'Content-Type': 'text/html;charset=UTF-8' });

    return response;
  };

  const getJobsFromLastJobsPage = () => ([
    new Job({
      id: '58260',
      title: 'Atendente / Vendedor (Drive) - Restaurante',
      description: 'Atendente / Vendedor (Drive) - Restaurante',
      city: 'Marília',
      jobSource: JobSource.BAURU_EMPREGOS,
      url: '/home/detalhes/58260',
    }),
    new Job({
      id: '58259',
      title: 'Auxiliar Administrativo',
      description: 'Auxiliar Administrativo',
      city: 'Avaí',
      jobSource: JobSource.BAURU_EMPREGOS,
      url: '/home/detalhes/58259',
    }),
    new Job({
      id: '58258',
      title: 'Auxiliar Administrativo',
      description: 'Auxiliar Administrativo',
      city: 'Avaí',
      jobSource: JobSource.BAURU_EMPREGOS,
      url: '/home/detalhes/58258',
    }),
    new Job({
      id: '58257',
      title: 'Estágio ADM/DP',
      description: 'Estágio ADM/DP',
      city: 'Avaí',
      jobSource: JobSource.BAURU_EMPREGOS,
      url: '/home/detalhes/58257',
    }),
  ]);

  describe('fetchLastJobsPage()', () => {
    test('Should fetch the html of the jobs page', async (done) => {
      const response = mockLastJobsPage();

      const lastJobsPage = await bauruEmpregosService.fetchLastJobsPage();

      expect(sourceRepository.getSource).toHaveBeenCalledWith(JobSource.BAURU_EMPREGOS);
      expect(lastJobsPage).toBe(response);
      expect(scope.isDone()).toBeTruthy();

      done();
    });

    test('Should parse the jobs found in the page.', () => {
      const lastJobsPage = mockLastJobsPage();

      const jobs = bauruEmpregosService.parseJobsFromLastJobsPage(lastJobsPage);

      const expectedJobs = getJobsFromLastJobsPage();

      expect(jobs).toHaveLength(4);
      expect(jobs).toStrictEqual(expectedJobs);
    });
  });
});
