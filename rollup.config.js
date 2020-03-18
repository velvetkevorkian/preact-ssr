import resolve from '@rollup/plugin-node-resolve'

export default [
  {
    input: 'src/server.js',
    output: {
      file: 'build/server.js',
      format: 'cjs',
    },
    plugins: [resolve()],
  }
]
