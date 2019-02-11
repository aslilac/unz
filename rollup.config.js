export default {
  input: 'src/unzzz.js',
  external: [ 'fs', 'gardens', 'path', 'zlib' ],
  output: {
    format: 'cjs',
    file: 'dist/unzzz.js',
    sourcemap: true,
    globals: {
      'gardens': 'gardens'
    }
  }
}