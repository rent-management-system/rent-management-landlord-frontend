const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = { // Changed from export default
  testEnvironment: "jsdom",
  transform: {
    ...tsJestTransformCfg,
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};