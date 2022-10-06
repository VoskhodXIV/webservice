// https://eslint.org/docs/latest/user-guide/configuring/configuration-files
// https://sydrawat.gitbook.io/react/extension/project-setup
module.exports = {
  extends: [
    'airbnb-base',
    'plugin:import/errors',
    'plugin:import/warnings',
    'prettier',
    'plugin:prettier/recommended',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
  },
  rules: {
    'no-unused-vars': 'off',
    'no-console': 'off',
    'import/prefer-default-export': 'off',
    'consistent-return': 'off',
    'comma-dangle': 'off',
    'import/no-unresolved': 'off',
    'import/extensions': 'off',
  },
}
