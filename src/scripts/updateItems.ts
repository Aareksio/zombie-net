import * as got from 'got';
import { getRepository } from 'typeorm';
import { Item } from '../entities/Item';

export async function updateItems() {
  const apiResponse = await got(process.env.MARKETPLACE_URL, { json: true });
  const { items } = apiResponse.body;

  const itemRepository = getRepository(Item);
  const existingItems = await itemRepository.find();
  const existingItemsIds = existingItems.map(item => item.id);

  // This could be optimized by combining to one query, either CASE ladder or INSERT IGNORE .. ON DUPLICATE UPDATE
  for (const item of items) {
    if (existingItemsIds.includes(item.id)) await itemRepository.update(item.id, { price: item.price });
    else await itemRepository.save(item);
  }
}
