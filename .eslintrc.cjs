/* Depthbound — ESLint config for syntax sanity */
module.exports = {
  root: true,
  env: { browser: true, es2021: true },
  extends: ['eslint:recommended', 'prettier'],
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  ignorePatterns: ['**/node_modules/**', '**/dist/**', '**/build/**'],
  rules: {
    'no-unused-vars': 'warn',
    'no-undef': 'error'
  }
};
