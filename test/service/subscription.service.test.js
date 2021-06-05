const JobSource = require('../../src/constants/jobSource');
const Job = require('../../src/model/job.model');
const SubscriptionService = require('../../src/service/subscription.service');

describe('SubscriptionService', () => {
  const makeSubscriptions = () => [
    {
      email: 'john@doe.com',
      excludeTags: ['est[áa]gio', 'estagi[áa]rio'],
      id: '1',
      metadata: {
        body: "Look the jobs I've found for you:",
        footer: "Please do not reply, we won't see it! :)",
        subject: 'Jobber - New jobs found!',
      },
      name: 'John Doe',
      sources: ['BAURU_EMPREGOS'],
      tags: ['contadora', 'contador', 'contabilidade', 'totvs', 'contas', 'cont[áa]beis', null, 'cont[áa]bil'],
      cities: ['Bauru'],
    },

    {
      email: 'john2@doe.com',
      excludeTags: ['est[áa]gio', 'estagi[áa]rio'],
      id: '2',
      metadata: {
        body: "Look the jobs I've found for you:",
        footer: "Please do not reply, we won't see it! :)",
        subject: 'Jobber - New jobs found!',
      },
      name: 'John Doe 2',
      sources: ['BAURU_EMPREGOS'],
      tags: ['contadora', 'contador', 'contabilidade', 'totvs', 'contas', 'cont[áa]beis', null, 'cont[áa]bil'],
      cities: ['Bauru', 'Pederneiras'],
    },
  ];

  const makeJobsList = () => ([
    new Job({
      id: '1-id',
      title: '1-title',
      description: '1-description-totvs',
      descriptionHtml: '1-descriptionHtml',
      city: '1-Bauru',
      url: '1-url',
      date: '1-date',
      jobSource: JobSource.BAURU_EMPREGOS,
    }),
    new Job({
      id: '2-id',
      title: '2-title',
      description: '2-description-totvs',
      descriptionHtml: '2-descriptionHtml',
      city: '2-Pederneiras',
      url: '2-url',
      date: '2-date',
      jobSource: JobSource.BAURU_EMPREGOS,
    }),
  ]);

  const makeSut = () => {
    const subscriptionRepositoryStub = {
      getSubscriptionsBySource: jest.fn(),
    };

    const sut = new SubscriptionService({
      subscriptionRepository: subscriptionRepositoryStub,
    });

    return {
      sut,
      subscriptionRepositoryStub,
    };
  };

  describe('.getNotificationsBySubscription(source, jobs)', () => {
    describe('empty job list', () => {
      it('should return an empty list if empty jobs list is provided', async () => {
        // Given
        const { sut, subscriptionRepositoryStub } = makeSut();
        const subscriptions = makeSubscriptions();

        subscriptionRepositoryStub.getSubscriptionsBySource
          .mockResolvedValueOnce(subscriptions);

        // When
        const result = await sut.getNotificationsBySubscription(JobSource.BAURU_EMPREGOS, []);

        // Then
        expect(subscriptionRepositoryStub.getSubscriptionsBySource)
          .toHaveBeenCalledWith(JobSource.BAURU_EMPREGOS);

        expect(result).toHaveLength(0);
      });
    });

    describe('Filters', () => {
      describe('City', () => {
        it('should include jobs that match the subscriptions cities', async () => {
        // Given
          const { sut, subscriptionRepositoryStub } = makeSut();
          const subscriptions = makeSubscriptions();

          subscriptionRepositoryStub.getSubscriptionsBySource
            .mockResolvedValueOnce(subscriptions);

          // When
          const result = await sut.getNotificationsBySubscription(
            JobSource.BAURU_EMPREGOS,
            makeJobsList(),
          );

          // Then
          expect(subscriptionRepositoryStub.getSubscriptionsBySource)
            .toHaveBeenCalledWith(JobSource.BAURU_EMPREGOS);

          expect(result).toHaveLength(2);
          expect(result[0].subscription.email).toBe(subscriptions[0].email);
          expect(result[0].jobs).toHaveLength(1);
          expect(result[0].jobs[0].id).toBe('1-id');
        });

        it('should NOT include jobs that does not match the subscriptions cities', async () => {
        // Given
          const { sut, subscriptionRepositoryStub } = makeSut();
          const subscriptions = makeSubscriptions();

          subscriptionRepositoryStub.getSubscriptionsBySource
            .mockResolvedValueOnce(subscriptions);

          // When
          const result = await sut.getNotificationsBySubscription(
            JobSource.BAURU_EMPREGOS,
            makeJobsList(),
          );

          // Then
          expect(subscriptionRepositoryStub.getSubscriptionsBySource)
            .toHaveBeenCalledWith(JobSource.BAURU_EMPREGOS);

          expect(result).toHaveLength(2);
          expect(result[1].subscription.email).toBe(subscriptions[1].email);
          expect(result[1].jobs).toHaveLength(2);
          expect(result[1].jobs[0].id).toBe('1-id');
          expect(result[1].jobs[1].id).toBe('2-id');
        });
      });
    });
  });
});
