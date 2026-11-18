
import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Vendor } from './entities/vendor.entity.js';
import { CreateVendorDto } from './dto/create-vendor.dto.js';
import { UpdateVendorDto } from './dto/update-vendor.dto.js';

@Injectable()
export class VendorsService {
  constructor(
    @InjectRepository(Vendor)
    private vendorRepository: Repository<Vendor>,
  ) {}

  async create(createVendorDto: CreateVendorDto) {
    const vendor = this.vendorRepository.create(createVendorDto);
    return this.vendorRepository.save(vendor);
  }

  async findAll() {
    return this.vendorRepository.find();
  }

  async findOne(id: number) {
    const vendor = await this.vendorRepository.findOneBy({ id });

    if (!vendor) {
      throw new NotFoundException('Vendor not found');
    }

    return vendor;
  }

  async update(id: number, updateVendorDto: UpdateVendorDto) {
    const vendor = await this.findOne(id);

    Object.assign(vendor, updateVendorDto);

    return this.vendorRepository.save(vendor);
  }

  async remove(id: number) {
    const vendor = await this.findOne(id);

    vendor.isActive = false;

    return this.vendorRepository.save(vendor);
  }
}
