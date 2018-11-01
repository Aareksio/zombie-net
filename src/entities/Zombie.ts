import { Column, CreateDateColumn, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Field, Int, ObjectType } from 'type-graphql';
import { Item } from './Item';

@ObjectType()
@Entity()
export class Zombie {
  @Field(type => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  name: string;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field(type => [Item])
  @ManyToMany(type => Item)
  @JoinTable()
  items: Item[];
}
