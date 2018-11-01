import 'mocha';
import { use, expect } from 'chai';
import { fake } from 'sinon';
import * as chaiAsPromised from 'chai-as-promised';

import { ZombieItemResolver } from './zombieItem.resolver';

use(chaiAsPromised);

function createFakeZombieRepository() {
  const query = {} as any;

  query.relation = () => query;
  query.of = () => query;
  query.add = () => query;
  query.remove = () => query;

  let currentId = 0;

  const zombies = [
    {
      id: ++currentId,
      name: 'Test zombie 1',
      items: []
    },
    {
      id: ++currentId,
      name: 'Test zombie 2',
      items: [
        { id: 1, price: 12, name: 'Excalibur' },
        { id: 2, price: 60, name: 'Trident' },
        { id: 3, price: 36 },
        { id: 4, price: 24 },
        { id: 5, price: 72 }
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
    createQueryBuilder: () => query
  };
}

function createFakeItemRepository() {
  const items = [
    { id: 1, name: 'Excalibur' },
    { id: 2, name: 'Trident' },
    { id: 6, name: 'Custom item' }
  ];

  return {
    findOne: id => items.find(item => item.id === id),
    find: () => items
  };
}

function createFakeEntityManager() {
  const zombieRepository = createFakeZombieRepository();

  const manager = {
    getRepository: entity => {
      if (entity.name === 'Zombie') return zombieRepository;
      throw new Error('Unknown entity');
    }
  };

  return {
    transaction: async (isolationLevel, runInTransaction) => {
      return runInTransaction(manager);
    }
  };
}

describe('ZombieItemResolver', () => {
  let zombieItemResolver;

  beforeEach(() => {
    const zombieRepository = createFakeZombieRepository();
    const itemRepository = createFakeItemRepository();
    const entityManager = createFakeEntityManager();

    zombieItemResolver = new ZombieItemResolver(zombieRepository as any, itemRepository as any, entityManager as any);
  });

  describe('mutation:addZombieItem', () => {
    it('adds selected item to zombie', async () => {
      const zombie = await zombieItemResolver.addZombieItem(1, 1);
      expect(zombie.items).to.deep.include({ id: 1, name: 'Excalibur' });
    });

    it('throws on invalid item id', async () => {
      await expect(zombieItemResolver.addZombieItem(1, 42)).to.eventually.be.rejectedWith('Invalid item ID');
    });

    it('throws on invalid zombie id', async () => {
      await expect(zombieItemResolver.addZombieItem(42, 1)).to.eventually.be.rejectedWith('Invalid zombie ID');
    });

    it('throws when zombie inventory full', async () => {
      await expect(zombieItemResolver.addZombieItem(2, 6)).to.eventually.be.rejectedWith('Zombie can have up to 5 items');
    });

    it('throws when zombie is already equiped with given item', async () => {
      const item = { id: 1, name: 'Excalibur' };
      await expect(zombieItemResolver.addZombieItem(3, 1)).to.eventually.be.rejectedWith(`Zombie is already equipped with ${item.name} (id: ${item.id})`);
    });
  });

  describe('mutation:removeZombieItem', () => {
    it('removes selected item from zombie', async () => {
      const zombie = await zombieItemResolver.removeZombieItem(2, 1);
      expect(zombie.items).to.not.deep.include({ id: 1, name: 'Excalibur' });
      expect(zombie.items).to.be.an('array').of.length(4);
    });

    it('throws on invalid zombie id', async () => {
      await expect(zombieItemResolver.removeZombieItem(42, 1)).to.eventually.be.rejectedWith('Invalid zombie ID');
    });

    it('throws when zombie is not equipped with selected item', async () => {
      await expect(zombieItemResolver.removeZombieItem(1, 1)).to.eventually.be.rejectedWith('Zombie is not equipped with item id 1');
    });
  });
});


