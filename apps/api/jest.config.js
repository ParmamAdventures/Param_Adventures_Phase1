/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/tests/**/*.test.ts"],
  globalTeardown: "<rootDir>/tests/globalTeardown.ts",
  setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"],
  verbose: true,
  maxWorkers: 1,
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
};
