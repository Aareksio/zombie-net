import 'mocha';
import { expect } from 'chai';

import { ItemResolver } from './item.resolver';

function createFakeItemRepository() {
  const items = [{ id: 1 }, { id: 2 }];

  return {
    findOne: id => items.find(item => item.id === id),
    find: () => items
  }
}

describe('ItemResolver', () => {
  const itemRepository = createFakeItemRepository();
  const itemResolver = new ItemResolver(itemRepository as any);

  describe('query:item', async () => {
    it('returns item when item id available', async () => {
      const item = await itemResolver.item(1);
      expect(item).to.be.deep.equal({ id: 1 });
    });

    it('returns undefined when item id not available', async () => {
      const item = await itemResolver.item(42);
      expect(item).to.be.undefined;
    });
  });

  describe('query:items', async () => {
    it('resolves with all available items', async () => {
      const items = await itemResolver.items();
      expect(items).to.be.deep.equal([{ id: 1 }, { id: 2 }]);
    });
  });
});
