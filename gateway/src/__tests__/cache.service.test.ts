import { CacheService } from '../services/cache.service';
import { redis } from '../__mocks__/redis';

jest.mock('../redis', () => ({
  redis,
}));

describe('CacheService', () => {
  let cacheService: CacheService;

  beforeEach(() => {
    cacheService = new CacheService();
    jest.clearAllMocks();
  });

  describe('get', () => {
    it('should return cached value if exists', async () => {
      const key = 'test-key';
      const value = 'test-value';

      redis.get.mockResolvedValue(value);

      const result = await cacheService.get(key);

      expect(result).toEqual(value);
      expect(redis.get).toHaveBeenCalledWith(key);
    });

    it('should return null if key does not exist', async () => {
      const key = 'non-existent-key';

      redis.get.mockResolvedValue(null);

      const result = await cacheService.get(key);

      expect(result).toBeNull();
    });
  });

  describe('set', () => {
    it('should set value in cache with TTL', async () => {
      const key = 'test-key';
      const value = 'test-value';
      const ttl = 3600;

      redis.set.mockResolvedValue('OK');

      await cacheService.set(key, value, ttl);

      expect(redis.set).toHaveBeenCalledWith(
        key,
        value,
        'EX',
        ttl
      );
    });
  });

  describe('del', () => {
    it('should delete value from cache', async () => {
      const key = 'test-key';

      redis.del.mockResolvedValue(1);

      await cacheService.del(key);

      expect(redis.del).toHaveBeenCalledWith(key);
    });
  });
}); 