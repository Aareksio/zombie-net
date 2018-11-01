import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class ExchangeRate {
  @PrimaryColumn()
  currency: string;

  @Column('decimal', { precision: 5, scale: 4 })
  rate: number;
}
