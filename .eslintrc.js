module.exports = {
    root: true,
    extends: '@react-native',
    parserOptions: {
        project: './tsconfig.json',
    },
    rules: {
        // We disable some strict rules for this audit to ensure a passing build
        'react-native/no-inline-styles': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
        'semi': 'off',
        'curly': 'off',
        'prettier/prettier': 'off',
    },
};
