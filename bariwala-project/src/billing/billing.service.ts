import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateBillDto } from './dtos/create-bill.dto.js';
import { UpdateBillDto } from './dtos/update-bill.dto.js';
import { Bill } from './entities/bill.entity.js';
import { Flat } from '../flats/entities/flat.entity.js';
import { Payment } from '../payment/entities/payment.entity.js';

@Injectable()
export class BillingService {
    constructor(
        @InjectRepository(Bill)
        private readonly billRepo: Repository<Bill>,
        @InjectRepository(Flat)
        private readonly flatRepo: Repository<Flat>,
        @InjectRepository(Payment)
        private readonly payRepo: Repository<Payment>,
    ) {}

    private async getFlatForUser(flatID: number, userID: number, role: string) {
        const flat = await this.flatRepo.findOne({
            where: { id: flatID },
            relations: { owner: true },
        });
        if (!flat) {
            throw new NotFoundException(`No flat found with ID ${flatID}`);
        }
        if (role !== 'admin' && flat.owner.id !== userID) {
            throw new ForbiddenException('You can only manage bills for your own flats');
        }
        return flat;
    }

    private async ensureNoDuplicate(flatID: number, month: string, exceptBillID?: number) {
        const existing = await this.billRepo.findOne({
            where: { flat: { id: flatID }, month },
        });
        if (existing && existing.id !== exceptBillID) {
            throw new ConflictException(`Flat ${flatID} already has a bill for ${month}`);
        }
    }

    private total(bill: { rent: number; gas: number; water: number; electricity: number }) {
        return bill.rent + bill.gas + bill.water + bill.electricity;
    }

    async create(dto: CreateBillDto, userID: number, role: string) {
        const flat = await this.getFlatForUser(dto.flat_id, userID, role);
        await this.ensureNoDuplicate(flat.id, dto.month);

        const { flat_id, ...billFields } = dto;
        const newBill = this.billRepo.create({
            ...billFields,
            total: this.total(dto),
            flat,
        });
        const result = await this.billRepo.save(newBill);
        const { flat: savedFlat, ...billInformation } = result;
        return {
            message: 'Bill generated successfully',
            billInformation: { ...billInformation, flatId: savedFlat.id },
        };
    }

    async showBill(userID: number, role: string) {
        const query = this.billRepo
            .createQueryBuilder('bill')
            .leftJoinAndSelect('bill.flat', 'flat')
            .orderBy('bill.id', 'DESC');
        if (role !== 'admin') {
            query.innerJoin('flat.owner', 'owner').where('owner.id = :userID', { userID });
        }
        return query.getMany();
    }

    async getBillByID(id: number, userID: number, role: string) {
        const bill = await this.billRepo.findOne({
            where: { id },
            relations: { flat: { owner: true } },
        });
        if (!bill || (role !== 'admin' && bill.flat?.owner?.id !== userID)) {
            throw new NotFoundException(`Bill ${id} not found`);
        }
        return bill;
    }

    async updateBill(id: number, dto: UpdateBillDto, userID: number, role: string) {
        const bill = await this.getBillByID(id, userID, role);
        const { flat_id, ...billFields } = dto;

        if (flat_id !== undefined) {
            bill.flat = await this.getFlatForUser(flat_id, userID, role);
        }
        Object.assign(bill, billFields);
        if (flat_id !== undefined || dto.month !== undefined) {
            await this.ensureNoDuplicate(bill.flat.id, bill.month, bill.id);
        }
        bill.total = this.total(bill);

        const saved = await this.billRepo.save(bill);
        return {
            message: `Bill ID ${id} has been updated`,
            billInfo: {
                id: saved.id,
                flatId: saved.flat.id,
                month: saved.month,
                rent: saved.rent,
                gas: saved.gas,
                water: saved.water,
                electricity: saved.electricity,
                total: saved.total,
                due_date: saved.due_date,
            },
        };
    }

    async deleteBill(id: number, userID: number, role: string) {
        const bill = await this.getBillByID(id, userID, role);
        const payment = await this.payRepo.findOne({ where: { bill_id: { id } } });
        if (payment) {
            throw new ConflictException(
                `Bill ${id} has payment ${payment.payment_id}; delete the payment first`,
            );
        }
        await this.billRepo.delete(id);
        return {
            message: `Bill ID ${id} has been deleted`,
            billInfo: { id: bill.id, flatId: bill.flat.id, month: bill.month, total: bill.total },
        };
    }
}
