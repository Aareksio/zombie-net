import { Field, Float, ObjectType } from 'type-graphql';

@ObjectType()
export class TotalPrice {
  @Field(type => Float)
  pln: number;

  @Field(type => Float)
  usd: number;

  @Field(type => Float)
  eur: number;
}
