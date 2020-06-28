import { Module, NestModule, MiddlewareConsumer, Logger } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import * as morgan from 'morgan';
import { AuthModule } from './modules/auth/auth.module';
import { ProductsModule } from './modules/products/products.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { PublishersModule } from './modules/publishers/publishers.module';
import { AuthorsModule } from './modules/authors/authors.module';
import { UsersModule } from './modules/users/users.module';
import { CartsModule } from './modules/carts/carts.module';
import { OrdersModule } from './modules/orders/orders.module';
import { DiscountsModule } from './modules/discounts/discounts.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { ShipmentsModule } from './modules/shipments/shipments.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.SQL_HOST,
      port: 5432,
      username: process.env.SQL_USER,
      password: process.env.SQL_PASSWORD,
      database: process.env.SQL_NAME,
      entities: [join(__dirname, '**/**.entity{.ts,.js}')],
      synchronize: true
    }),
    AuthModule,
    ProductsModule,
    CategoriesModule,
    PublishersModule,
    AuthorsModule,
    UsersModule,
    CartsModule,
    OrdersModule,
    DiscountsModule,
    PaymentsModule,
    ShipmentsModule
  ],
  controllers: [],
  providers: [Logger]
})
export class AppModule implements NestModule {
  constructor(private logger: Logger) {}

  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(
        morgan('dev', { stream: { write: (message) => this.logger.log(message.substring(0, message.lastIndexOf('\n')), 'HTTP Request') } })
      )
      .forRoutes('*');
  }
}
