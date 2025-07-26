import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';

export default [
  // UMD build for browsers
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/suiflow.js',
      format: 'umd',
      name: 'Suiflow',
      sourcemap: true
    },
    plugins: [
      resolve(),
      typescript({
        declaration: false,
        target: 'es5'
      }),
      terser()
    ]
  },
  // ES module build
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/suiflow.esm.js',
      format: 'es',
      sourcemap: true
    },
    plugins: [
      resolve(),
      typescript({
        declaration: true,
        declarationDir: 'dist',
        target: 'es2015'
      })
    ]
  },
  // CommonJS build
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/suiflow.cjs.js',
      format: 'cjs',
      sourcemap: true
    },
    plugins: [
      resolve(),
      typescript({
        declaration: false,
        target: 'es2015'
      })
    ]
  }
];
