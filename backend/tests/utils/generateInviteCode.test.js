const { generateInviteCode, hashInviteCode } = require('../../src/utils/generateInviteCode');

describe('generateInviteCode utility', () => {
    it('should generate an 8-character code', () => {
        const code = generateInviteCode();
        expect(code).toHaveLength(8);
    });

    it('should only contain uppercase letters (no O/I) and digits (no 0/1)', () => {
        for (let i = 0; i < 50; i++) {
            const code = generateInviteCode();
            expect(code).toMatch(/^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{8}$/);
        }
    });

    it('should generate unique codes', () => {
        const codes = new Set();
        for (let i = 0; i < 100; i++) {
            codes.add(generateInviteCode());
        }
        // With 8 chars from 30-char alphabet, collisions in 100 are astronomically unlikely
        expect(codes.size).toBe(100);
    });
});

describe('hashInviteCode utility', () => {
    it('should return a 64-character hex hash (SHA-256)', () => {
        const hash = hashInviteCode('A92FD3K1');
        expect(hash).toHaveLength(64);
        expect(hash).toMatch(/^[0-9a-f]{64}$/);
    });

    it('should produce the same hash for the same input', () => {
        const hash1 = hashInviteCode('TESTCODE');
        const hash2 = hashInviteCode('TESTCODE');
        expect(hash1).toBe(hash2);
    });

    it('should produce different hashes for different inputs', () => {
        const hash1 = hashInviteCode('AAAAAAAA');
        const hash2 = hashInviteCode('BBBBBBBB');
        expect(hash1).not.toBe(hash2);
    });
});
