/**
 * Matrix utility functions for LAPACK operations
 */

import { Matrix, MatrixLayout, MatrixCreateOptions, LapackError } from '../types';

/**
 * Creates a matrix wrapper around a typed array
 */
export function createMatrix<T extends Float32Array | Float64Array>(
  data: T,
  rows: number,
  cols: number,
  options: MatrixCreateOptions = {}
): Matrix<T> {
  const layout = options.layout ?? 'column-major';
  
  if (data.length < rows * cols) {
    throw new LapackError(
      `Data array too small: ${data.length} < ${rows * cols}`,
      -1,
      'createMatrix'
    );
  }

  return {
    data,
    rows,
    cols,
    layout,
    leadingDimension: layout === 'column-major' ? rows : cols,
  };
}

/**
 * Creates a new Float64 matrix filled with zeros or specified value
 */
export function createFloat64Matrix(
  rows: number,
  cols: number,
  options: MatrixCreateOptions = {}
): Matrix<Float64Array> {
  const initialValue = options.initialValue ?? 0;
  const data = new Float64Array(rows * cols);
  
  if (initialValue !== 0) {
    data.fill(initialValue);
  }
  
  return createMatrix(data, rows, cols, options);
}

/**
 * Creates a new Float32 matrix filled with zeros or specified value
 */
export function createFloat32Matrix(
  rows: number,
  cols: number,
  options: MatrixCreateOptions = {}
): Matrix<Float32Array> {
  const initialValue = options.initialValue ?? 0;
  const data = new Float32Array(rows * cols);
  
  if (initialValue !== 0) {
    data.fill(initialValue);
  }
  
  return createMatrix(data, rows, cols, options);
}

/**
 * Gets matrix element at (i, j) - 0-indexed
 */
export function getElement<T extends Float32Array | Float64Array>(
  matrix: Matrix<T>,
  i: number,
  j: number
): number {
  validateIndices(matrix, i, j);
  
  const index = matrix.layout === 'column-major' 
    ? j * matrix.leadingDimension + i
    : i * matrix.leadingDimension + j;
    
  return matrix.data[index]!;
}

/**
 * Sets matrix element at (i, j) - 0-indexed
 */
export function setElement<T extends Float32Array | Float64Array>(
  matrix: Matrix<T>,
  i: number,
  j: number,
  value: number
): void {
  validateIndices(matrix, i, j);
  
  const index = matrix.layout === 'column-major'
    ? j * matrix.leadingDimension + i
    : i * matrix.leadingDimension + j;
    
  matrix.data[index] = value;
}

/**
 * Validates matrix indices
 */
function validateIndices<T extends Float32Array | Float64Array>(
  matrix: Matrix<T>,
  i: number,
  j: number
): void {
  if (i < 0 || i >= matrix.rows) {
    throw new LapackError(
      `Row index out of bounds: ${i} not in [0, ${matrix.rows})`,
      -1,
      'validateIndices'
    );
  }
  if (j < 0 || j >= matrix.cols) {
    throw new LapackError(
      `Column index out of bounds: ${j} not in [0, ${matrix.cols})`,
      -1,
      'validateIndices'
    );
  }
}

/**
 * Validates LAPACK function parameters
 */
export function validateParameters(params: {
  n?: number;
  nrhs?: number;
  lda?: number;
  ldb?: number;
  functionName?: string;
}): void {
  const { n, nrhs, lda, ldb, functionName = 'unknown' } = params;
  
  if (n !== undefined && n < 0) {
    throw new LapackError(`N must be >= 0, got ${n}`, -1, functionName);
  }
  
  if (nrhs !== undefined && nrhs < 0) {
    throw new LapackError(`NRHS must be >= 0, got ${nrhs}`, -2, functionName);
  }
  
  if (lda !== undefined && n !== undefined && lda < Math.max(1, n)) {
    throw new LapackError(`LDA must be >= max(1, N), got LDA=${lda}, N=${n}`, -4, functionName);
  }
  
  if (ldb !== undefined && n !== undefined && ldb < Math.max(1, n)) {
    throw new LapackError(`LDB must be >= max(1, N), got LDB=${ldb}, N=${n}`, -7, functionName);
  }
}

/**
 * Copies one matrix to another
 */
export function copyMatrix<T extends Float32Array | Float64Array>(
  source: Matrix<T>,
  target: Matrix<T>
): void {
  if (source.rows !== target.rows || source.cols !== target.cols) {
    throw new LapackError(
      'Matrix dimensions must match for copy',
      -1,
      'copyMatrix'
    );
  }
  
  // If layouts match and leading dimensions are the same, direct copy
  if (source.layout === target.layout && 
      source.leadingDimension === target.leadingDimension &&
      source.leadingDimension === source.rows) {
    target.data.set(source.data.subarray(0, source.rows * source.cols));
    return;
  }
  
  // Element-wise copy for different layouts
  for (let i = 0; i < source.rows; i++) {
    for (let j = 0; j < source.cols; j++) {
      setElement(target, i, j, getElement(source, i, j));
    }
  }
}
