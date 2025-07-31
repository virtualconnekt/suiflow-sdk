
import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import replace from '@rollup/plugin-replace';

const external = [
  'react',
  'react-dom',
  'react/jsx-runtime',
  '@mysten/dapp-kit',
  '@mysten/sui',
  '@tanstack/react-query'
];

export default [
  // UMD build for browsers
  {
    input: 'index.ts',
    external,
    output: {
      file: 'dist/suiflow.js',
      format: 'umd',
      name: 'Suiflow',
      sourcemap: true,
      globals: {
        'react': 'React',
        'react-dom': 'ReactDOM',
        'react/jsx-runtime': 'jsxRuntime',
        '@mysten/dapp-kit': 'MyStenDappKit',
        '@mysten/sui': 'MyStenSui',
        '@tanstack/react-query': 'ReactQuery'
      }
    },
    plugins: [
      replace({
        preventAssignment: true,
        'process.env.NODE_ENV': JSON.stringify('production'),
        'process.env': '{}'
      }),
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
    input: 'index.ts',
    external,
    output: {
      file: 'dist/suiflow.esm.js',
      format: 'es',
      sourcemap: true
    },
    plugins: [
      replace({
        preventAssignment: true,
        'process.env.NODE_ENV': JSON.stringify('production'),
        'process.env': '{}'
      }),
      resolve(),
      typescript({
        declaration: true,
        declarationDir: 'dist',
        target: 'es2015',
        exclude: ['node_modules/**']
      })
    ]
  },
  // CommonJS build
  {
    input: 'index.ts',
    external,
    output: {
      file: 'dist/suiflow.cjs.js',
      format: 'cjs',
      sourcemap: true
    },
    plugins: [
      replace({
        preventAssignment: true,
        'process.env.NODE_ENV': JSON.stringify('production'),
        'process.env': '{}'
      }),
      resolve(),
      typescript({
        declaration: false,
        target: 'es2015'
      })
    ]
  }
];