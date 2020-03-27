import resolve from '@rollup/plugin-node-resolve'

export default [
  {
    input: 'src/server.js',
    output: {
      file: 'build/server.js',
      format: 'cjs',
    },
    plugins: [resolve()],
  },
  {
    input: 'src/client.js',
    output: {
      file: 'build/client.js',
      format: 'es',
      name: 'client',
    },
    plugins: [resolve()],
  },
]
