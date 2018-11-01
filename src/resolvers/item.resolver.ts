import { Arg, Int, Query, Resolver } from 'type-graphql';
import { Repository } from 'typeorm';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { Item } from '../entities/Item';

@Resolver()
export class ItemResolver {
  constructor(
    @InjectRepository(Item) private readonly itemRepository: Repository<Item>
  ) {}

  @Query(returns => Item, { nullable: true })
  async item(@Arg('id', type => Int) id: number): Promise<Item> {
    return this.itemRepository.findOne(id);
  }

  @Query(returns => [Item])
  async items(): Promise<Item[]> {
    return this.itemRepository.find();
  }
}
