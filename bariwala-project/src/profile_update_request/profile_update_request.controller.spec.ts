import { Test, TestingModule } from '@nestjs/testing';
import { ProfileUpdateRequestController } from './profile_update_request.controller.js';
import { ProfileUpdateRequestService } from './profile_update_request.service.js';

describe('ProfileUpdateRequestController', () => {
  let controller: ProfileUpdateRequestController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfileUpdateRequestController],
      providers: [ProfileUpdateRequestService],
    }).compile();

    controller = module.get<ProfileUpdateRequestController>(ProfileUpdateRequestController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
