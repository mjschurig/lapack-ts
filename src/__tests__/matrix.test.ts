/**
 * Tests for matrix utilities
 */

import {
  createFloat64Matrix,
  createFloat32Matrix,
  getElement,
  setElement,
  copyMatrix,
  validateParameters
} from '../utils/matrix';
import { LapackError } from '../types';

describe('Matrix Utilities', () => {
  describe('Matrix creation', () => {
    test('creates Float64Matrix with correct dimensions', () => {
      const matrix = createFloat64Matrix(3, 4);
      
      expect(matrix.rows).toBe(3);
      expect(matrix.cols).toBe(4);
      expect(matrix.data).toBeInstanceOf(Float64Array);
      expect(matrix.data.length).toBe(12);
      expect(matrix.layout).toBe('column-major');
    });
    
    test('creates Float32Matrix with correct dimensions', () => {
      const matrix = createFloat32Matrix(2, 3);
      
      expect(matrix.rows).toBe(2);
      expect(matrix.cols).toBe(3);
      expect(matrix.data).toBeInstanceOf(Float32Array);
      expect(matrix.data.length).toBe(6);
    });
    
    test('initializes with specified value', () => {
      const matrix = createFloat64Matrix(2, 2, { initialValue: 5.5 });
      
      expect(getElement(matrix, 0, 0)).toBe(5.5);
      expect(getElement(matrix, 0, 1)).toBe(5.5);
      expect(getElement(matrix, 1, 0)).toBe(5.5);
      expect(getElement(matrix, 1, 1)).toBe(5.5);
    });
    
    test('supports row-major layout', () => {
      const matrix = createFloat64Matrix(2, 3, { layout: 'row-major' });
      
      expect(matrix.layout).toBe('row-major');
      expect(matrix.leadingDimension).toBe(3);
    });
  });
  
  describe('Element access', () => {
    test('gets and sets elements correctly in column-major', () => {
      const matrix = createFloat64Matrix(3, 2);
      
      setElement(matrix, 1, 0, 42.5);
      expect(getElement(matrix, 1, 0)).toBe(42.5);
      
      setElement(matrix, 2, 1, -17.3);
      expect(getElement(matrix, 2, 1)).toBe(-17.3);
    });
    
    test('gets and sets elements correctly in row-major', () => {
      const matrix = createFloat64Matrix(3, 2, { layout: 'row-major' });
      
      setElement(matrix, 1, 0, 42.5);
      expect(getElement(matrix, 1, 0)).toBe(42.5);
      
      setElement(matrix, 2, 1, -17.3);
      expect(getElement(matrix, 2, 1)).toBe(-17.3);
    });
    
    test('validates indices', () => {
      const matrix = createFloat64Matrix(2, 3);
      
      expect(() => getElement(matrix, -1, 0)).toThrow(LapackError);
      expect(() => getElement(matrix, 2, 0)).toThrow(LapackError);
      expect(() => getElement(matrix, 0, 3)).toThrow(LapackError);
      expect(() => setElement(matrix, 0, -1, 1)).toThrow(LapackError);
    });
  });
  
  describe('Matrix copying', () => {
    test('copies matrix with same layout', () => {
      const source = createFloat64Matrix(2, 2);
      setElement(source, 0, 0, 1);
      setElement(source, 0, 1, 2);
      setElement(source, 1, 0, 3);
      setElement(source, 1, 1, 4);
      
      const target = createFloat64Matrix(2, 2);
      copyMatrix(source, target);
      
      expect(getElement(target, 0, 0)).toBe(1);
      expect(getElement(target, 0, 1)).toBe(2);
      expect(getElement(target, 1, 0)).toBe(3);
      expect(getElement(target, 1, 1)).toBe(4);
    });
    
    test('copies matrix with different layouts', () => {
      const source = createFloat64Matrix(2, 2, { layout: 'column-major' });
      setElement(source, 0, 0, 1);
      setElement(source, 0, 1, 2);
      setElement(source, 1, 0, 3);
      setElement(source, 1, 1, 4);
      
      const target = createFloat64Matrix(2, 2, { layout: 'row-major' });
      copyMatrix(source, target);
      
      expect(getElement(target, 0, 0)).toBe(1);
      expect(getElement(target, 0, 1)).toBe(2);
      expect(getElement(target, 1, 0)).toBe(3);
      expect(getElement(target, 1, 1)).toBe(4);
    });
    
    test('validates dimension compatibility', () => {
      const source = createFloat64Matrix(2, 3);
      const target = createFloat64Matrix(3, 2);
      
      expect(() => copyMatrix(source, target)).toThrow(LapackError);
    });
  });
  
  describe('Parameter validation', () => {
    test('validates positive parameters', () => {
      expect(() => validateParameters({ n: -1, functionName: 'TEST' })).toThrow(LapackError);
      expect(() => validateParameters({ nrhs: -1, functionName: 'TEST' })).toThrow(LapackError);
    });
    
    test('validates leading dimensions', () => {
      expect(() => validateParameters({ 
        n: 5, 
        lda: 3, 
        functionName: 'TEST' 
      })).toThrow(LapackError);
      
      expect(() => validateParameters({ 
        n: 5, 
        ldb: 4, 
        functionName: 'TEST' 
      })).toThrow(LapackError);
    });
    
    test('passes valid parameters', () => {
      expect(() => validateParameters({ 
        n: 5, 
        nrhs: 2, 
        lda: 5, 
        ldb: 5,
        functionName: 'TEST' 
      })).not.toThrow();
    });
  });
});
