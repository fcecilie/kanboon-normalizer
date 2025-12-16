const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

module.exports = {
    roots: ['<rootDir>/tests'],
    testMatch: [
        '**/?(*.)+(spec|test).+(ts|js)'
    ],
    testEnvironment: "node",
    transform: {
        ...tsJestTransformCfg,
    },
    collectCoverageFrom: ['/src/'],
    coverageDirectory: 'coverage',
    coveragePathIgnorePatterns: ['/node_modules/', '/dist/']
};
