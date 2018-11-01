import 'mocha';
import { expect } from 'chai';

import { ZombieResolver } from './zombie.resolver';

function createFakeZombieRepository() {
  let currentId = 0;

  let zombies = [
    {
      id: ++currentId,
      name: 'Test zombie 1',
      items: []
    },
    {
      id: ++currentId,
      name: 'Test zombie 2',
      items: [
        { id: 1, price: 12 },
        { id: 2, price: 60 }
      ]
    },
    {
      id: ++currentId,
      name: 'Test zombie 3',
      items: [
        { id: 1, price: 12 }
      ]
    }
  ];

  return {
    findOne: id => zombies.find(zombie => zombie.id === id),
    find: () => zombies,
    create: ({ name }) => ({ name, items: [] }),
    save: zombie => !zombie.id ? zombies.push({ id: ++currentId, ...zombie }) : zombie,
    remove: ({ id }) => zombies = zombies.filter(zombie => zombie.id !== id)
  };
}

function createExchangeRateRepository() {
  const exchangeRates = [
    { currency: 'USD', rate: 3 },
    { currency: 'EUR', rate: 4 }
  ];

  return {
    find: () => exchangeRates
  };
}

describe('ZombieResolver', () => {
  let zombieResolver;

  beforeEach(() => {
    const zombieRepository = createFakeZombieRepository();
    const exchangeRateRepository = createExchangeRateRepository();

    zombieResolver = new ZombieResolver(zombieRepository as any, exchangeRateRepository as any);
  });

  describe('query:zombie', () => {
    it('returns zombie when zombie id available', async () => {
      const zombie = await zombieResolver.zombie(1);
      expect(zombie).to.include({ id: 1 });
    });

    it('returns undefined when zombie id not available', async () => {
      const zombie = await zombieResolver.zombie(42);
      expect(zombie).to.be.undefined;
    });
  });

  describe('query:zombies', () => {
    it('returns a list of available zombies', async () => {
      const zombies = await zombieResolver.zombies();
      expect(zombies).to.be.an('array').that.have.lengthOf(3);
    });
  });

  describe('mutation:createZombie', () => {
    it('creates a new zombie', async () => {
      await zombieResolver.createZombie({ name: 'New zombie' });
      const zombies = await zombieResolver.zombies();
      const zombie = zombies.find(zombie => zombie.name === 'New zombie');
      expect(zombie).to.not.be.undefined;
    });

    it('returns newly created zombie', async () => {
      const zombie = await zombieResolver.createZombie({ name: 'New zombie' });
      expect(zombie).to.not.be.undefined;
    });
  });

  describe('mutation:updateZombie', () => {
    it('updates zombie', async () => {
      await zombieResolver.updateZombie(1, { name: 'Updated zombie' });
      const zombie = await zombieResolver.zombie(1);
      expect(zombie.name).to.be.equal('Updated zombie');
    });

    it('returns updated zombie', async () => {
      const zombie = await zombieResolver.updateZombie(1, { name: 'Updated zombie' });
      expect(zombie).to.not.be.undefined;
    });
  });

  describe('mutation:deleteZombie', () => {
    it('deletes zombie', async  () => {
      await zombieResolver.deleteZombie(1);
      const zombie = await zombieResolver.zombie(1);
      expect(zombie).to.be.undefined;
    });

    it('returns deleted zombie', async () => {
      const zombie = await zombieResolver.deleteZombie(1);
      expect(zombie).to.be.not.undefined;
    });
  });

  describe('fieldResolver:totalPrice', () => {
    it('calculates total price when zombie has no items', async () => {
      const zombie = await zombieResolver.zombie(1);
      const totalPrice = await zombieResolver.totalPrice(zombie);
      expect(totalPrice).to.be.deep.equal({ pln: 0, usd: 0, eur: 0 });
    });

    it('calculates total price when zombie has one item', async () => {
      const zombie = await zombieResolver.zombie(3);
      const totalPrice = await zombieResolver.totalPrice(zombie);
      expect(totalPrice).to.be.deep.equal({ pln: 12, usd: 4, eur: 3 });
    });

    it('calculates total price when zombie has multiple items', async () => {
      const zombie = await zombieResolver.zombie(2);
      const totalPrice = await zombieResolver.totalPrice(zombie);
      expect(totalPrice).to.be.deep.equal({ pln: 72, usd: 24, eur: 18 });
    });
  });
});
