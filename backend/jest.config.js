'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  testRegex: '.*\\.spec\\.(ts|js)$',
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
      },
    ],
  },
  clearMocks: true,
};
exports.default = config;
