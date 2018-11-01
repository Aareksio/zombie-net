import { Field, InputType } from 'type-graphql';
import { Zombie } from '../../entities/Zombie';

@InputType()
export class ZombieInput implements Partial<Zombie> {
  @Field()
  name: string;
}
