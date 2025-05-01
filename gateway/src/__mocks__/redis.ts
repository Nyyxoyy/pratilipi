export const redis = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  lpush: jest.fn(),
  lrange: jest.fn(),
  lset: jest.fn(),
  ltrim: jest.fn(),
  on: jest.fn(),
  connect: jest.fn(),
  disconnect: jest.fn(),
};

export default redis; 