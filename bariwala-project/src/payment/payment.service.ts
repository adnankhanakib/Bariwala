import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomInt } from 'crypto';
import { Payment } from './entities/payment.entity.js';
import { CreatePaymentDto } from './dto/create-payment.dto.js';
import { UpdatePaymentDto } from './dto/update-payment.dto.js';
import { BillingService } from '../billing/billing.service.js';
import { Bill } from '../billing/entities/bill.entity.js';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private readonly payRepo: Repository<Payment>,
    @InjectRepository(Bill)
    private readonly billRepo: Repository<Bill>,
    private readonly billService: BillingService,
  ) {}

  private toView(p: Payment) {
    return {
      payment_id: p.payment_id,
      bill_id: p.bill_id?.id,
      receipt_no: p.receipt_no,
      amount: p.amount,
      is_paid: p.is_paid,
      created_at: p.created_at,
      updated_at: p.updated_at,
    };
  }

  private scoped(userID: number, role: string) {
    const query = this.payRepo
      .createQueryBuilder('payment')
      .innerJoinAndSelect('payment.bill_id', 'bill')
      .innerJoin('bill.flat', 'flat')
      .innerJoin('flat.owner', 'owner')
      .orderBy('payment.payment_id', 'DESC');
    if (role !== 'admin') {
      query.where('owner.id = :userID', { userID });
    }
    return query;
  }

  private async findForUser(paymentID: number, userID: number, role: string) {
    const payment = await this.scoped(userID, role)
      .andWhere('payment.payment_id = :paymentID', { paymentID })
      .getOne();
    if (!payment) {
      throw new NotFoundException(`Payment ${paymentID} not found`);
    }
    return payment;
  }

  private async ensureBillHasNoPayment(billID: number, exceptPaymentID?: number) {
    const existing = await this.payRepo.findOne({ where: { bill_id: { id: billID } } });
    if (existing && existing.payment_id !== exceptPaymentID) {
      throw new ConflictException(`Bill ${billID} already has payment ${existing.payment_id}`);
    }
  }

  private checkAmount(amount: number, bill: Bill) {
    if (amount > bill.total) {
      throw new BadRequestException(`Amount ${amount} is more than the bill total ${bill.total}`);
    }
  }

  async viewPayments(userID: number, role: string) {
    const payments = await this.scoped(userID, role).getMany();
    return payments.map((p) => this.toView(p));
  }

  async getPaymentByID(paymentID: number, userID: number, role: string) {
    return this.toView(await this.findForUser(paymentID, userID, role));
  }

  async createPayment(dto: CreatePaymentDto, userID: number, role: string) {
    const bill = await this.billService.getBillByID(dto.bill_id, userID, role);
    await this.ensureBillHasNoPayment(bill.id);
    this.checkAmount(dto.amount, bill);

    const payment = this.payRepo.create({
      bill_id: bill,
      amount: dto.amount,
      is_paid: dto.is_paid ?? false,
      receipt_no: randomInt(100000, 1000000),
    });
    const saved = await this.payRepo.save(payment);
    return {
      message: `Payment created successfully for bill ID ${bill.id}`,
      payment: this.toView(saved),
    };
  }

  async editPayment(paymentID: number, dto: UpdatePaymentDto, userID: number, role: string) {
    const payment = await this.findForUser(paymentID, userID, role);

    if (dto.bill_id !== undefined && dto.bill_id !== payment.bill_id.id) {
      payment.bill_id = await this.billService.getBillByID(dto.bill_id, userID, role);
      await this.ensureBillHasNoPayment(dto.bill_id, payment.payment_id);
    }
    if (dto.amount !== undefined) payment.amount = dto.amount;
    if (dto.is_paid !== undefined) payment.is_paid = dto.is_paid;
    this.checkAmount(payment.amount, payment.bill_id);

    const saved = await this.payRepo.save(payment);
    return {
      message: `Payment ${paymentID} updated`,
      payment: this.toView(saved),
    };
  }

  async payBill(billID: number, userID: number, role: string) {
    const bill = await this.billRepo.findOne({
      where: { id: billID },
      relations: { flat: { owner: true, tenant: true } },
    });
    const allowed =
      !!bill &&
      (role === 'admin' ||
        (role === 'owner' && bill.flat.owner.id === userID) ||
        (role === 'tenant' && bill.flat.tenant?.id === userID));
    if (!bill || !allowed) {
      throw new NotFoundException(`Bill ${billID} not found`);
    }
    const alreadyPaid = () => new ConflictException(`Bill ${billID} is already paid`);

    const existing = await this.payRepo.findOne({ where: { bill_id: { id: billID } } });
    let paymentID: number;
    if (existing) {
      if (existing.is_paid) throw alreadyPaid();
      const result = await this.payRepo.update(
        { payment_id: existing.payment_id, is_paid: false },
        { is_paid: true, amount: bill.total },
      );
      if (!result.affected) throw alreadyPaid();
      paymentID = existing.payment_id;
    } else {
      try {
        const saved = await this.payRepo.save(
          this.payRepo.create({
            bill_id: bill,
            amount: bill.total,
            is_paid: true,
            receipt_no: randomInt(100000, 1000000),
          }),
        );
        paymentID = saved.payment_id;
      } catch (err: any) {
        if (err?.code === '23505') throw alreadyPaid();
        throw err;
      }
    }

    const payment = await this.payRepo.findOneOrFail({
      where: { payment_id: paymentID },
      relations: { bill_id: true },
    });
    return {
      message: `Bill ${billID} paid successfully`,
      bill: {
        id: bill.id,
        flatId: bill.flat.id,
        month: bill.month,
        total: bill.total,
        due_date: bill.due_date,
      },
      payment: this.toView(payment),
    };
  }

  async deletePayment(paymentID: number, userID: number, role: string) {
    const payment = await this.findForUser(paymentID, userID, role);
    await this.payRepo.delete(payment.payment_id);
    return {
      message: `Payment ${paymentID} deleted successfully`,
      payment: this.toView(payment),
    };
  }
}
