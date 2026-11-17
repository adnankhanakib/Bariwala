import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { UsersModule } from './users/users.module.js';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module.js';
import { FlatsModule } from './flats/flats.module.js';
import { BillingModule } from './billing/billing.module.js';
import { PaymentModule } from './payment/payment.module.js';

@Module({
  imports: [
    UsersModule, 
    ConfigModule.forRoot({isGlobal:true}),
    TypeOrmModule.forRootAsync({
      imports:[ConfigModule],
      inject:[ConfigService],
      useFactory:(ConfigService:ConfigService)=>({
        type:'postgres',
        host:ConfigService.get<string>('DB_HOST'),
        port:Number(ConfigService.get<Number>('DB_PORT')),
        username:ConfigService.get<string>('DB_USERNAME'),
        password:ConfigService.get<string>('DB_PASS'),
        database:ConfigService.get<string>('DB_NAME'),
        autoLoadEntities:true,
        synchronize:true
      })
    }),
    AuthModule,
    FlatsModule,
    BillingModule,
    PaymentModule,

  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
