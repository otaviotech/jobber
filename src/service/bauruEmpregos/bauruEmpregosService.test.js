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
      getSource: jest.fn().mockResolvedValue(getBauruEmpregosJobSource()),
    };

    bauruEmpregosService = new BauruEmpregosService({ crawler, sourceRepository });
  });

  afterEach(() => {
    sourceRepository.getSource.mockClear();
  });

  const mockLastJobsPage = () => {
    const responsePath = path.join(__dirname, '../../../test/resources/crawler/bauruEmpregos__vagas.html');
    const response = fs.readFileSync(responsePath, 'utf-8');

    nock.cleanAll();

    scope
      .get('/home/vagas')
      .replyWithFile(200, responsePath, { 'Content-Type': 'text/html;charset=UTF-8' });

    return response;
  };

  const mockJobPage = () => {
    const responsePath = path.join(__dirname, '../../../test/resources/crawler/bauruEmpregos__vaga.html');
    const response = fs.readFileSync(responsePath, 'utf-8');

    nock.cleanAll();

    scope
      .get('/home/detalhes/58260')
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

  const getJobFromJobPage = () => new Job({
    title: 'Atendente / Vendedor (Drive) - Restaurante - Marília',
    date: '14/11/2020',
    description: 'Responsável pelo atendimento em restaurante na fila do canal Drive.\nÉ obrigatório ter experiência em vendas e gostar de vender\nTer boa comunicação é imprescindível\nResidir em Marília\n\nJornada de 6 horas diárias\nHorário de trabalho das 18h à 0h\nSalário $1.150,00\nVale transporte\nAdicional noturno\nPremiação por vendas\n\nCurrículo para recruta.vagasvarejo@gmail.com\nColocar no assunto: DRIVE MARILIA',
    descriptionHtml: 'Respons&#xE1;vel pelo atendimento em restaurante na fila do canal Drive.\n&#xC9; obrigat&#xF3;rio ter experi&#xEA;ncia em vendas e gostar de vender\nTer boa comunica&#xE7;&#xE3;o &#xE9; imprescind&#xED;vel\nResidir em Mar&#xED;lia\n\nJornada de 6 horas di&#xE1;rias\nHor&#xE1;rio de trabalho das 18h &#xE0; 0h\nSal&#xE1;rio $1.150,00\nVale transporte\nAdicional noturno\nPremia&#xE7;&#xE3;o por vendas\n\nCurr&#xED;culo para recruta.vagasvarejo@gmail.com\nColocar no assunto: DRIVE MARILIA',
    city: 'Marília',
    jobSource: JobSource.BAURU_EMPREGOS,
    id: '58260',
  });

  describe('fetchLastJobsPage()', () => {
    test('Should fetch the html of the jobs page', async (done) => {
      const response = mockLastJobsPage();

      const lastJobsPage = await bauruEmpregosService.fetchLastJobsPage();

      expect(sourceRepository.getSource).toHaveBeenCalledWith(JobSource.BAURU_EMPREGOS);
      expect(lastJobsPage.html).toBe(response);
      expect(scope.isDone()).toBeTruthy();

      done();
    });

    test('Should parse the jobs found in the page.', async (done) => {
      mockLastJobsPage();

      const lastJobsPage = await bauruEmpregosService.fetchLastJobsPage();

      const expectedJobs = getJobsFromLastJobsPage();

      expect(lastJobsPage.jobs).toHaveLength(4);
      expect(lastJobsPage.jobs).toStrictEqual(expectedJobs);

      done();
    });
  });

  describe('fetchJobPage()', () => {
    test('Should fetch the html of the job page', async (done) => {
      const response = mockJobPage();

      const jobPage = await bauruEmpregosService.fetchJobPage({ id: '58260' });

      expect(sourceRepository.getSource).toHaveBeenCalledWith(JobSource.BAURU_EMPREGOS);
      expect(jobPage.html).toBe(response);
      expect(scope.isDone()).toBeTruthy();

      done();
    });

    test('Should parse the job found in the job page.', async (done) => {
      mockJobPage();

      const jobPage = await bauruEmpregosService.fetchJobPage({ id: '58260' });
      const { job } = jobPage;

      const expectedJob = getJobFromJobPage();

      expect(job).toBeInstanceOf(Job);
      expect(job).toStrictEqual(expectedJob);

      done();
    });
  });
});
