import { Body, Controller, Delete, Req,Get,Patch, Param, Post, UseGuards } from '@nestjs/common';
import { FlatsService } from './flats.service.js';
import { CreateFlatDTO } from './dtos/create-flat.dto.js';
import { UpdateFlatDTO } from './dtos/update-flat.dto.js';
import { JwtGuard } from '../auth/jwtGuard.guard.js';
import { RolesGuard } from '../auth/roles/roles.guard.js';
import { Roles } from '../auth/roles/roles.decorator.js';
@Controller('flats')
export class FlatsController {
  constructor(private readonly flatsService: FlatsService) {}
  @Get()
  @UseGuards(JwtGuard,RolesGuard)
  @Roles('admin')
  getAllFlats(@Req() request:any){
    return this.flatsService.showAllFlats(
      request.user.id,
      request.user.role
    )
  }
  @Get("/owner/id/:id")
  @Roles('admin')
  getFlatByOwner(@Param("id") ownerID:number){
    return this.flatsService.showFlatByOwnerID(ownerID)
  }
  @Get(":id")
  @Roles('admin')
  getFlatInformation(@Param("id") flatID:number){
    return this.flatsService.flatInformation(flatID)
  }
  @Post("/create")
  @Roles('admin')
  createFlat(@Body() newFlat:CreateFlatDTO){
    return this.flatsService.createFlat(newFlat)
  }
  @Delete("/:id")
  @Roles('admin')
  deleteFlat(@Param("id") id:number){
    return this.flatsService.deleteFlat(id)
  }
  @Patch("/:id")
  @Roles('admin')
  updateFlat(@Param("id") id:number, @Body() dto:UpdateFlatDTO){
    return this.flatsService.updateFlat(id,dto)
  }
}
