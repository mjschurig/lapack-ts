/**
 * DGESV - Solves a system of linear equations A * X = B
 * 
 * This is a TypeScript implementation of the LAPACK DGESV routine.
 * It computes the solution to a real system of linear equations A * X = B,
 * where A is an N-by-N matrix and X and B are N-by-NRHS matrices.
 * 
 * The LU decomposition with partial pivoting and row interchanges is
 * used to factor A as A = P * L * U, where P is a permutation matrix,
 * L is unit lower triangular, and U is upper triangular.
 */

import { Matrix, LapackResult, LapackResultWithData, LapackError } from '../types';
import { validateParameters, copyMatrix, createFloat64Matrix } from '../utils/matrix';

export interface DgesvInput {
  readonly A: Matrix<Float64Array>;    // N-by-N coefficient matrix
  readonly B: Matrix<Float64Array>;    // N-by-NRHS right-hand side matrix
  readonly overwriteInput?: boolean;   // Whether to overwrite input matrices
}

export interface DgesvOutput {
  readonly solution: Matrix<Float64Array>;  // Solution matrix X
  readonly LU: Matrix<Float64Array>;        // LU factorization of A
  readonly pivots: Int32Array;              // Pivot indices
}

/**
 * Solves the linear system A * X = B using LU decomposition with partial pivoting
 */
export function dgesv(input: DgesvInput): LapackResultWithData<DgesvOutput> {
  const { A, B, overwriteInput = false } = input;
  
  // Validate dimensions
  if (A.rows !== A.cols) {
    return {
      info: -1,
      result: {} as DgesvOutput
    };
  }
  
  if (A.rows !== B.rows) {
    return {
      info: -1,
      result: {} as DgesvOutput
    };
  }
  
  const n = A.rows;
  const nrhs = B.cols;
  
  // Validate parameters
  try {
    validateParameters({
      n,
      nrhs,
      lda: A.leadingDimension,
      ldb: B.leadingDimension,
      functionName: 'DGESV'
    });
  } catch (error) {
    if (error instanceof LapackError) {
      return {
        info: error.info,
        result: {} as DgesvOutput
      };
    }
    throw error;
  }
  
  // Create working copies if not overwriting input
  const workA = overwriteInput ? A : createFloat64Matrix(n, n, { layout: A.layout });
  const workB = overwriteInput ? B : createFloat64Matrix(n, nrhs, { layout: B.layout });
  
  if (!overwriteInput) {
    copyMatrix(A, workA);
    copyMatrix(B, workB);
  }
  
  // Perform LU factorization
  const pivots = new Int32Array(n);
  const luResult = dgetrf(workA, pivots);
  
  if (luResult.info !== 0) {
    return {
      info: luResult.info,
      result: {} as DgesvOutput
    };
  }
  
  // Solve using the LU factorization
  const solveResult = dgetrs('N', workA, pivots, workB);
  
  if (solveResult.info !== 0) {
    return {
      info: solveResult.info,
      result: {} as DgesvOutput
    };
  }
  
  return {
    info: 0,
    result: {
      solution: workB,
      LU: workA,
      pivots
    }
  };
}

/**
 * DGETRF - Computes LU factorization of a general matrix
 * Simplified implementation for this demo
 */
function dgetrf(A: Matrix<Float64Array>, ipiv: Int32Array): LapackResult {
  const n = A.rows;
  
  // Simple LU decomposition with partial pivoting
  for (let k = 0; k < n; k++) {
    // Find pivot
    let maxRow = k;
    let maxVal = Math.abs(getElement(A, k, k));
    
    for (let i = k + 1; i < n; i++) {
      const val = Math.abs(getElement(A, i, k));
      if (val > maxVal) {
        maxVal = val;
        maxRow = i;
      }
    }
    
    ipiv[k] = maxRow + 1; // 1-based indexing for LAPACK convention
    
    // Check for singular matrix
    if (maxVal === 0) {
      return { info: k + 1 };
    }
    
    // Swap rows if needed
    if (maxRow !== k) {
      for (let j = 0; j < n; j++) {
        const temp = getElement(A, k, j);
        setElement(A, k, j, getElement(A, maxRow, j));
        setElement(A, maxRow, j, temp);
      }
    }
    
    // Eliminate column
    const pivot = getElement(A, k, k);
    for (let i = k + 1; i < n; i++) {
      const factor = getElement(A, i, k) / pivot;
      setElement(A, i, k, factor);
      
      for (let j = k + 1; j < n; j++) {
        const newVal = getElement(A, i, j) - factor * getElement(A, k, j);
        setElement(A, i, j, newVal);
      }
    }
  }
  
  return { info: 0 };
}

/**
 * DGETRS - Solves a system using LU factorization
 * Simplified implementation for this demo
 */
function dgetrs(
  trans: 'N' | 'T' | 'C',
  A: Matrix<Float64Array>,
  ipiv: Int32Array,
  B: Matrix<Float64Array>
): LapackResult {
  if (trans !== 'N') {
    throw new LapackError('Only non-transposed solve supported in this demo', -1, 'DGETRS');
  }
  
  const n = A.rows;
  const nrhs = B.cols;
  
  // Apply row interchanges to B
  for (let k = 0; k < n; k++) {
    const pivotRow = ipiv[k]! - 1; // Convert to 0-based
    if (pivotRow !== k) {
      for (let j = 0; j < nrhs; j++) {
        const temp = getElement(B, k, j);
        setElement(B, k, j, getElement(B, pivotRow, j));
        setElement(B, pivotRow, j, temp);
      }
    }
  }
  
  // Forward substitution (solve L * Y = B)
  for (let k = 0; k < n - 1; k++) {
    for (let i = k + 1; i < n; i++) {
      const factor = getElement(A, i, k);
      for (let j = 0; j < nrhs; j++) {
        const newVal = getElement(B, i, j) - factor * getElement(B, k, j);
        setElement(B, i, j, newVal);
      }
    }
  }
  
  // Back substitution (solve U * X = Y)
  for (let k = n - 1; k >= 0; k--) {
    const pivot = getElement(A, k, k);
    for (let j = 0; j < nrhs; j++) {
      setElement(B, k, j, getElement(B, k, j) / pivot);
    }
    
    for (let i = 0; i < k; i++) {
      const factor = getElement(A, i, k);
      for (let j = 0; j < nrhs; j++) {
        const newVal = getElement(B, i, j) - factor * getElement(B, k, j);
        setElement(B, i, j, newVal);
      }
    }
  }
  
  return { info: 0 };
}

// Helper functions (imported from matrix utilities)
function getElement<T extends Float32Array | Float64Array>(
  matrix: Matrix<T>,
  i: number,
  j: number
): number {
  const index = matrix.layout === 'column-major' 
    ? j * matrix.leadingDimension + i
    : i * matrix.leadingDimension + j;
  return matrix.data[index]!;
}

function setElement<T extends Float32Array | Float64Array>(
  matrix: Matrix<T>,
  i: number,
  j: number,
  value: number
): void {
  const index = matrix.layout === 'column-major'
    ? j * matrix.leadingDimension + i
    : i * matrix.leadingDimension + j;
  matrix.data[index] = value;
}
