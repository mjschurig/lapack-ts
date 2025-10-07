/**
 * Core types for LAPACK TypeScript implementation
 */

// Matrix layouts
export type MatrixLayout = 'row-major' | 'column-major';

// LAPACK precision types
export type Float32Matrix = Float32Array;
export type Float64Matrix = Float64Array;
export type ComplexFloat32 = { real: number; imag: number };
export type ComplexFloat64 = { real: number; imag: number };

// Matrix types
export interface Matrix<T extends Float32Array | Float64Array> {
  readonly data: T;
  readonly rows: number;
  readonly cols: number;
  readonly layout: MatrixLayout;
  readonly leadingDimension: number;
}

// LAPACK return codes
export interface LapackResult {
  readonly info: number; // 0 = success, < 0 = illegal argument, > 0 = algorithm-specific error
}

export interface LapackResultWithData<T> extends LapackResult {
  readonly result: T;
}

// Function signatures for common LAPACK operations
export interface LapackFunction<TInput, TOutput> {
  (input: TInput): LapackResultWithData<TOutput>;
}

// Common parameter validation
export interface LapackParameters {
  readonly n?: number;
  readonly nrhs?: number;
  readonly lda?: number;
  readonly ldb?: number;
  readonly ipiv?: Int32Array;
}

// Error types
export class LapackError extends Error {
  constructor(
    message: string,
    public readonly info: number,
    public readonly functionName: string
  ) {
    super(`LAPACK ${functionName}: ${message} (INFO=${info})`);
    this.name = 'LapackError';
  }
}

// Utility types for creating matrices
export interface MatrixCreateOptions {
  readonly layout?: MatrixLayout;
  readonly initialValue?: number;
}
