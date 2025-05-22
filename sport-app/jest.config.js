module.exports = {
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/services/(.*)$': '<rootDir>/src/services/$1',
    '^@/lib/(.*)$': '<rootDir>/src/lib/$1',
    // If you have other aliases in tsconfig.json, add them here
    // For example, if you use '@/styles/(.*)$': '<rootDir>/src/styles/$1'
  },
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: 'tsconfig.json' }],
  },
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
  // Automatically clear mock calls and instances between every test
  clearMocks: true,
};
