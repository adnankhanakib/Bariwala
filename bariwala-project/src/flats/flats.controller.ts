import { Body, Controller, Delete, Req,Get,Patch, Param, Post, UseGuards, ParseIntPipe } from '@nestjs/common';
import { FlatsService } from './flats.service.js';
import { CreateFlatDTO } from './dtos/create-flat.dto.js';
import { UpdateFlatDTO } from './dtos/update-flat.dto.js';
import { JwtGuard } from '../auth/jwtGuard.guard.js';
import { RolesGuard } from '../auth/roles/roles.guard.js';
import { Roles } from '../auth/roles/roles.decorator.js';
import { ApiBearerAuth } from '@nestjs/swagger';
@ApiBearerAuth()
@UseGuards(JwtGuard,RolesGuard)
@Controller('flats')
export class FlatsController {
  constructor(private readonly flatsService: FlatsService) {}
  @Get()
  @Roles('admin','owner')
  getAllFlats(@Req() request:any){
    return this.flatsService.showAllFlats(
      request.user.id,
      request.user.role
    )
  }
  @Get("/owner/id/:id")
  @Roles('admin')
  getFlatByOwner(@Param("id",ParseIntPipe) ownerID:number){
    return this.flatsService.showFlatByOwnerID(ownerID)
  }
  @Get("/tenants")
  @Roles('admin','owner')
  showFlatTenants(@Req() request:any){
    return this.flatsService.getAllTenants(request.user.id,request.user.role)
  }
  @Get(":id")
  @Roles('admin')
  getFlatInformation(@Param("id",ParseIntPipe) flatID:number){
    return this.flatsService.flatInformation(flatID)
  }
  @Post("/create")
  @Roles('admin')
  createFlat(@Body() newFlat:CreateFlatDTO){
    return this.flatsService.createFlat(newFlat)
  }
  @Delete("/:id")
  @Roles('admin')
  deleteFlat(@Param("id",ParseIntPipe) id:number){
    return this.flatsService.deleteFlat(id)
  }
  @Patch("/:id")
  @Roles('admin')
  updateFlat(@Param("id",ParseIntPipe) id:number, @Body() dto:UpdateFlatDTO){
    return this.flatsService.updateFlat(id,dto)
  }
  @Patch("/tenants/assign/:id")
  @Roles('admin','owner')
  assignFlat(@Param('id',ParseIntPipe) flatID:number, @Body('ownerID') ownerID:number, @Req() request:any){

  }
}
