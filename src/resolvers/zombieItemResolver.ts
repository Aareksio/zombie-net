import { Zombie } from '../entities/Zombie';
import { Arg, Int, Mutation, Resolver } from 'type-graphql';
import { Repository } from 'typeorm';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { Item } from '../entities/Item';

@Resolver()
export class ZombieItemResolver {
  constructor(
    @InjectRepository(Zombie) private readonly zombieRepository: Repository<Zombie>,
    @InjectRepository(Item) private readonly itemRepository: Repository<Item>
  ) {}

  @Mutation(returns => Zombie, { description: 'Adds selected item to zombie\'s inventory. The item must be unique for given zombie, the inventory can have up to 5 items total.' })
  async addZombieItem(@Arg('zombieId', type => Int) zombieId: number, @Arg('itemId', type => Int) itemId: number): Promise<Zombie> {
    const zombie = await this.zombieRepository.findOne(zombieId, { relations: ['items'] });
    if (!zombie) throw new Error('Invalid zombie ID');

    const item = await this.itemRepository.findOne(itemId);
    if (!item) throw new Error('Invalid item ID');

    if (zombie.items.length >= 5) throw new Error(`Zombie can have up to ${5} items`);
    if (zombie.items.find(zombieItem => zombieItem.id === item.id)) throw new Error(`Zombie is already equipped with ${item.name} (id: ${item.id})`);

    await this.zombieRepository
      .createQueryBuilder()
      .relation(Zombie, 'items')
      .of(zombie)
      .add(item);

    return {
      ...zombie,
      items: [...zombie.items, item]
    };
  }

  @Mutation(returns => Zombie, { description: 'Removes selected item from zombie\'s inventory.' })
  async removeZombieItem(@Arg('zombieId', type => Int) zombieId: number, @Arg('itemId', type => Int) itemId: number): Promise<Zombie> {
    const zombie = await this.zombieRepository.findOne(zombieId, { relations: ['items'] });
    if (!zombie) throw new Error('Invalid zombie ID');

    const item = zombie.items.find(zombieItem => zombieItem.id === itemId);
    if (!item) throw new Error(`Zombie is not equipped with item id ${itemId}`);

    await this.zombieRepository
      .createQueryBuilder()
      .relation(Zombie, 'items')
      .of(zombie)
      .remove(item);

    return {
      ...zombie,
      items: zombie.items.filter(zombieItem => zombieItem.id !== item.id)
    };
  }
}
