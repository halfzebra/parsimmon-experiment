module.exports = {
  'moduleFileExtensions': [
    'ts',
    'js'
  ],
  'transform': {
    '^.+\\.ts$': '<rootDir>/tools/test-preprocessor.js'
  },
  'testMatch': [
    '**/*.spec.(ts|js)'
  ]
};

