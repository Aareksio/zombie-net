import { Zombie } from '../entities/Zombie';
import { Arg, FieldResolver, Int, Mutation, Query, Resolver, Root } from 'type-graphql';
import { In, Repository } from 'typeorm';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { ZombieInput } from './types/zombieInput';
import { ExchangeRate } from '../entities/ExchangeRate';
import { TotalPrice } from './types/totalPrice';

@Resolver(of => Zombie)
export class ZombieResolver {
  constructor(
    @InjectRepository(Zombie) private readonly zombieRepository: Repository<Zombie>,
    @InjectRepository(ExchangeRate) private readonly exchangeRateRepository: Repository<ExchangeRate>
  ) {}

  @Query(returns => Zombie, { nullable: true })
  zombie(@Arg('id', type => Int) id: number) {
    return this.zombieRepository.findOne(id, { relations: ['items'] });
  }

  @Query(returns => [Zombie])
  zombies() {
    return this.zombieRepository.find({ relations: ['items'] });
  }

  @Mutation(returns => Zombie)
  createZombie(@Arg('zombie', type => ZombieInput) { name }: ZombieInput) {
    const zombie = this.zombieRepository.create({ name });
    return this.zombieRepository.save(zombie);
  }

  @Mutation(returns => Zombie)
  async updateZombie(@Arg('id', type => Int) id, @Arg('zombie') { name }: ZombieInput) {
    const zombie = await this.zombieRepository.findOne(id);
    if (!zombie) throw new Error('Invalid zombie ID');

    zombie.name = name;

    return this.zombieRepository.save(zombie);
  }

  @Mutation(returns => Zombie)
  async deleteZombie(@Arg('id', type => Int) id: number): Promise<Zombie> {
    const zombie = await this.zombieRepository.findOne(id);
    if (!zombie) throw new Error('Invalid zombie ID');

    await this.zombieRepository.remove(zombie);

    return zombie;
  }

  @FieldResolver(returns => TotalPrice, { description: 'Total value of zombie\'s inventory in PLN, USD and EUR' })
  async totalPrice(@Root() zombie: Zombie): Promise<TotalPrice> {
    const exchangeRates = await this.exchangeRateRepository
      .find({ where: { currency: In(['USD', 'EUR']) } });

    const rates = exchangeRates
      .reduce((rates, exchangeRate) => (rates[exchangeRate.currency] = exchangeRate.rate, rates), {}) as { USD: number, EUR: number };

    const plnCost = zombie.items.reduce((sum, item) => sum + item.price, 0);
    const usdCost = plnCost / rates.USD;
    const eurCost = plnCost / rates.EUR;

    return {
      pln: plnCost,
      usd: usdCost,
      eur: eurCost
    };
  }
}
