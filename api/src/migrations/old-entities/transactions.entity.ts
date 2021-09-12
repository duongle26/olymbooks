import { Column, Entity, ManyToOne } from 'typeorm';

import { BaseEntity } from './base.entity';
import { TransactionMethod } from './transaction-methods.entity';

export enum TransactionState {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  CANCELLED = 'CANCELLED'
}

@Entity()
export class Transaction extends BaseEntity {
  @Column()
  transactionMethodId: number;

  @Column({ enum: TransactionState, default: TransactionState.PENDING })
  state: TransactionState;

  @Column()
  value: number;

  @ManyToOne(() => TransactionMethod, (transactionMethod) => transactionMethod.transactions)
  transactionMethod: TransactionMethod;
}
