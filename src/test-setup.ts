// Jest test setup file
// Add any global test configuration here

// Custom matchers for floating point comparisons
expect.extend({
  toBeCloseTo(received: number, expected: number, precision = 2): jest.CustomMatcherResult {
    const pass = Math.abs(received - expected) < Math.pow(10, -precision);
    return {
      message: () =>
        `expected ${received} to be close to ${expected} with precision ${precision}`,
      pass,
    };
  },
  
  toBeCloseToArray(received: number[], expected: number[], precision = 2): jest.CustomMatcherResult {
    if (received.length !== expected.length) {
      return {
        message: () => `expected arrays to have same length: ${received.length} !== ${expected.length}`,
        pass: false,
      };
    }
    
    for (let i = 0; i < received.length; i++) {
      if (Math.abs(received[i]! - expected[i]!) >= Math.pow(10, -precision)) {
        return {
          message: () => 
            `expected arrays to be close at index ${i}: ${received[i]} !== ${expected[i]} (precision: ${precision})`,
          pass: false,
        };
      }
    }
    
    return {
      message: () => `expected arrays not to be close`,
      pass: true,
    };
  },
});

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeCloseTo(expected: number, precision?: number): R;
      toBeCloseToArray(expected: number[], precision?: number): R;
    }
  }
}
