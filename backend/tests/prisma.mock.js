const { mockDeep, mockReset } = require('jest-mock-extended');
const prisma = require('../src/prisma');
const { PrismaClient } = require('@prisma/client');

jest.mock('../src/prisma', () => ({
    __esModule: true,
    default: mockDeep(),
}));

beforeEach(() => {
    mockReset(prisma);
});

module.exports = prisma;
