// https://docs.expo.dev/guides/using-eslint/
module.exports = {
  extends: ['expo'],
  ignorePatterns: ['dist/**', 'node_modules/**', '*.config.js', 'server/**'],
  rules: {
    // Disable problematic rules that might cause build issues
    '@typescript-eslint/no-unused-vars': 'warn',
    'no-unused-vars': 'warn'
  }
};
