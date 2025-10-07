# LAPACK-TS

A pure TypeScript implementation of LAPACK (Linear Algebra Package) for JavaScript and Node.js environments.

## Overview

LAPACK-TS provides high-performance linear algebra operations using TypeScript with `Float32Array` and `Float64Array` for optimal performance. This library is designed to be compatible with the standard LAPACK API while leveraging TypeScript's type safety.

## Features

- ✅ Pure TypeScript implementation
- ✅ Support for `Float32Array` and `Float64Array`
- ✅ Column-major and row-major matrix layouts
- ✅ Comprehensive test suite
- ✅ Type-safe API with excellent IDE support
- ✅ Compatible with Node.js and browsers
- ✅ Uses BLAS-TS for basic linear algebra operations

## Installation

```bash
npm install lapack-ts
```

## Quick Start

```typescript
import { dgesv, createFloat64Matrix, setElement, getElement } from 'lapack-ts';

// Create a 2x2 system: A * x = b
// [2, 1] [x1]   [3]
// [1, 3] [x2] = [4]

const A = createFloat64Matrix(2, 2);
setElement(A, 0, 0, 2); setElement(A, 0, 1, 1);
setElement(A, 1, 0, 1); setElement(A, 1, 1, 3);

const B = createFloat64Matrix(2, 1);
setElement(B, 0, 0, 3);
setElement(B, 1, 0, 4);

const result = dgesv({ A, B });

if (result.info === 0) {
  console.log('Solution:');
  console.log('x1 =', getElement(result.result.solution, 0, 0)); // 1
  console.log('x2 =', getElement(result.result.solution, 1, 0)); // 1
} else {
  console.error('Failed to solve system, INFO =', result.info);
}
```

## Available Functions

Currently implemented:

- **`dgesv`** - Solves a system of linear equations using LU decomposition with partial pivoting

More LAPACK functions will be added in future releases.

## Matrix Operations

### Creating Matrices

```typescript
import { createFloat64Matrix, createFloat32Matrix } from 'lapack-ts';

// Create a 3x4 matrix filled with zeros
const matrix = createFloat64Matrix(3, 4);

// Create a matrix with initial value
const ones = createFloat64Matrix(2, 2, { initialValue: 1.0 });

// Create with row-major layout (default is column-major)
const rowMajor = createFloat64Matrix(3, 3, { layout: 'row-major' });
```

### Matrix Element Access

```typescript
import { getElement, setElement } from 'lapack-ts';

// Set element at row 1, column 2 (0-indexed)
setElement(matrix, 1, 2, 42.5);

// Get element at row 1, column 2
const value = getElement(matrix, 1, 2);
```

## Development

### Prerequisites

- Node.js 16+ 
- npm or yarn

### Setup

```bash
git clone https://github.com/yourusername/lapack-ts.git
cd lapack-ts
npm install
```

### Running Tests

```bash
npm test                # Run tests once
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Run tests with coverage
```

### Building

```bash
npm run build           # Build the library
npm run build:watch     # Build in watch mode
```

### Development Container

This project includes a dev container configuration for consistent development environments:

```bash
# Using VS Code with Remote-Containers extension
code .
# Then: "Remote-Containers: Reopen in Container"
```

## API Reference

### Types

- `Matrix<T>` - Matrix wrapper for typed arrays
- `LapackResult` - Standard LAPACK return information
- `LapackResultWithData<T>` - Result with computed data

### Error Handling

All functions return a `LapackResult` with an `info` field:
- `info = 0`: Success
- `info < 0`: Invalid argument at position `-info`
- `info > 0`: Algorithm-specific error (e.g., singular matrix)

## Performance

LAPACK-TS is designed for performance:

- Uses typed arrays (`Float32Array`, `Float64Array`) for optimal memory usage
- Supports both column-major (LAPACK standard) and row-major layouts
- Leverages BLAS-TS for basic operations
- Minimal memory allocations during computations

## Roadmap

- [ ] More linear equation solvers (DGESVX, DPOSV, etc.)
- [ ] Eigenvalue and eigenvector computations (DGEEV, DSYEV, etc.)
- [ ] Singular Value Decomposition (DGESVD)
- [ ] QR and LU factorizations
- [ ] Matrix norms and condition number estimation
- [ ] Complex number support
- [ ] Parallel processing support

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT License - see [LICENSE](LICENSE) file for details.

## References

- [LAPACK Official Documentation](http://www.netlib.org/lapack/)
- [LAPACK Users' Guide](http://www.netlib.org/lapack/lug/)
- [BLAS-TS](https://www.npmjs.com/package/blas-ts)