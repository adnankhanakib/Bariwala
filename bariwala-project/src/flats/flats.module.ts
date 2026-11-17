import { Module } from '@nestjs/common';
import { FlatsService } from './flats.service.js';
import { FlatsController } from './flats.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Flat } from './entities/flat.entity.js';
import { Users } from '../users/entities/users.entity.js';
import { UsersModule } from '../users/users.module.js';

@Module({
  imports:[TypeOrmModule.forFeature([Flat]),UsersModule],
  controllers: [FlatsController],
  providers: [FlatsService],
})
export class FlatsModule {}
