import { Column, Entity, PrimaryColumn } from 'typeorm';
import { Field, Int, ObjectType } from 'type-graphql';

@ObjectType({ description: 'Item from the marketplace' })
@Entity()
export class Item {
  @Field(type => Int)
  @PrimaryColumn()
  id: number;

  @Field()
  @Column()
  name: string;

  @Field()
  @Column('int')
  price: number;
}
