/**
 * Tests for DGESV - Linear equation solver
 */

import { dgesv } from '../linear-equations/dgesv';
import { createFloat64Matrix, setElement, getElement } from '../utils/matrix';

describe('DGESV - Linear Equation Solver', () => {
  describe('Basic functionality', () => {
    test('solves a simple 2x2 system', () => {
      // Create a 2x2 system: A * x = b
      // [2, 1] [x1]   [3]
      // [1, 3] [x2] = [4]
      // Solution should be x1 = 1, x2 = 1
      
      const A = createFloat64Matrix(2, 2);
      setElement(A, 0, 0, 2); // A[0,0] = 2
      setElement(A, 0, 1, 1); // A[0,1] = 1
      setElement(A, 1, 0, 1); // A[1,0] = 1
      setElement(A, 1, 1, 3); // A[1,1] = 3
      
      const B = createFloat64Matrix(2, 1);
      setElement(B, 0, 0, 3); // B[0,0] = 3
      setElement(B, 1, 0, 4); // B[1,0] = 4
      
      const result = dgesv({ A, B });
      
      expect(result.info).toBe(0);
      expect(getElement(result.result.solution, 0, 0)).toBeCloseTo(1, 10);
      expect(getElement(result.result.solution, 1, 0)).toBeCloseTo(1, 10);
    });
    
    test('solves a 3x3 system with multiple right-hand sides', () => {
      // Create a 3x3 system with 2 RHS
      const A = createFloat64Matrix(3, 3);
      setElement(A, 0, 0, 1); setElement(A, 0, 1, 2); setElement(A, 0, 2, 3);
      setElement(A, 1, 0, 4); setElement(A, 1, 1, 5); setElement(A, 1, 2, 6);
      setElement(A, 2, 0, 7); setElement(A, 2, 1, 8); setElement(A, 2, 2, 10);
      
      const B = createFloat64Matrix(3, 2);
      // First RHS: [14, 32, 53]
      setElement(B, 0, 0, 14); setElement(B, 1, 0, 32); setElement(B, 2, 0, 53);
      // Second RHS: [20, 47, 74]
      setElement(B, 0, 1, 20); setElement(B, 1, 1, 47); setElement(B, 2, 1, 74);
      
      const result = dgesv({ A, B });
      
      expect(result.info).toBe(0);
      
      // Check first solution (should be [1, 2, 3])
      expect(getElement(result.result.solution, 0, 0)).toBeCloseTo(1, 8);
      expect(getElement(result.result.solution, 1, 0)).toBeCloseTo(2, 8);
      expect(getElement(result.result.solution, 2, 0)).toBeCloseTo(3, 8);
      
      // Check second solution (should be [2, 3, 4])
      expect(getElement(result.result.solution, 0, 1)).toBeCloseTo(2, 8);
      expect(getElement(result.result.solution, 1, 1)).toBeCloseTo(3, 8);
      expect(getElement(result.result.solution, 2, 1)).toBeCloseTo(4, 8);
    });
  });
  
  describe('Error handling', () => {
    test('detects singular matrix', () => {
      // Create a singular matrix (second row is 2 * first row)
      const A = createFloat64Matrix(2, 2);
      setElement(A, 0, 0, 1); setElement(A, 0, 1, 2);
      setElement(A, 1, 0, 2); setElement(A, 1, 1, 4);
      
      const B = createFloat64Matrix(2, 1);
      setElement(B, 0, 0, 1);
      setElement(B, 1, 0, 2);
      
      const result = dgesv({ A, B });
      
      expect(result.info).toBeGreaterThan(0); // Should indicate singular matrix
    });
    
    test('validates input dimensions', () => {
      // Non-square matrix A
      const A = createFloat64Matrix(2, 3);
      const B = createFloat64Matrix(2, 1);
      
      const result = dgesv({ A, B });
      
      expect(result.info).toBe(-1);
    });
    
    test('validates dimension compatibility', () => {
      // A and B have incompatible dimensions
      const A = createFloat64Matrix(3, 3);
      const B = createFloat64Matrix(2, 1);
      
      const result = dgesv({ A, B });
      
      expect(result.info).toBe(-1);
    });
  });
  
  describe('Matrix preservation', () => {
    test('preserves input matrices when overwriteInput is false', () => {
      const A = createFloat64Matrix(2, 2);
      setElement(A, 0, 0, 2); setElement(A, 0, 1, 1);
      setElement(A, 1, 0, 1); setElement(A, 1, 1, 3);
      
      const B = createFloat64Matrix(2, 1);
      setElement(B, 0, 0, 3);
      setElement(B, 1, 0, 4);
      
      // Store original values
      const originalA = [
        [getElement(A, 0, 0), getElement(A, 0, 1)],
        [getElement(A, 1, 0), getElement(A, 1, 1)]
      ];
      const originalB = [getElement(B, 0, 0), getElement(B, 1, 0)];
      
      const result = dgesv({ A, B, overwriteInput: false });
      
      expect(result.info).toBe(0);
      
      // Check that original matrices are unchanged
      expect(getElement(A, 0, 0)).toBe(originalA[0]![0]);
      expect(getElement(A, 0, 1)).toBe(originalA[0]![1]);
      expect(getElement(A, 1, 0)).toBe(originalA[1]![0]);
      expect(getElement(A, 1, 1)).toBe(originalA[1]![1]);
      
      expect(getElement(B, 0, 0)).toBe(originalB[0]);
      expect(getElement(B, 1, 0)).toBe(originalB[1]);
    });
  });
  
  describe('Numerical accuracy', () => {
    test('handles well-conditioned problems accurately', () => {
      // Identity matrix system
      const A = createFloat64Matrix(3, 3);
      setElement(A, 0, 0, 1); setElement(A, 1, 1, 1); setElement(A, 2, 2, 1);
      
      const B = createFloat64Matrix(3, 1);
      setElement(B, 0, 0, 5);
      setElement(B, 1, 0, 7);
      setElement(B, 2, 0, 9);
      
      const result = dgesv({ A, B });
      
      expect(result.info).toBe(0);
      expect(getElement(result.result.solution, 0, 0)).toBeCloseTo(5, 14);
      expect(getElement(result.result.solution, 1, 0)).toBeCloseTo(7, 14);
      expect(getElement(result.result.solution, 2, 0)).toBeCloseTo(9, 14);
    });
  });
});
