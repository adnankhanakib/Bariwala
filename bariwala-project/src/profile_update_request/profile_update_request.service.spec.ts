import { Test, TestingModule } from '@nestjs/testing';
import { ProfileUpdateRequestService } from './profile_update_request.service.js';

describe('ProfileUpdateRequestService', () => {
  let service: ProfileUpdateRequestService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProfileUpdateRequestService],
    }).compile();

    service = module.get<ProfileUpdateRequestService>(ProfileUpdateRequestService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
