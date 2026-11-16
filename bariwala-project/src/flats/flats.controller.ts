import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { FlatsService } from './flats.service.js';
import { CreateFlatDTO } from './dtos/create-flat.dto.js';

@Controller('flats')
export class FlatsController {
  constructor(private readonly flatsService: FlatsService) {}
  @Get()
  getAllFlats(){
    return this.flatsService.showAllFlats()
  }
  @Get("/owner/id/:id")
  getFlatByOwner(@Param("id") ownerID:number){
    return this.flatsService.showFlatByOwnerID(ownerID)
  }
  @Post("/create")
  createFlat(@Body() newFlat:CreateFlatDTO){
    return this.flatsService.createFlat(newFlat)
  }
}
