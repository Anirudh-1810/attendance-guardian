const generateOTP = require('../../src/utils/generateOTP');
const hashOTP = require('../../src/utils/hashOTP');

describe('OTP Utilities', () => {
    describe('generateOTP', () => {
        it('should generate a 6-digit string', () => {
            const otp = generateOTP();
            expect(typeof otp).toBe('string');
            expect(otp.length).toBe(6);
            expect(/^[0-9]{6}$/.test(otp)).toBe(true);
        });

        it('should generate somewhat random numbers', () => {
            const otp1 = generateOTP();
            const otp2 = generateOTP();
            // Extremely low chance these match securely generated pseudo-random numbers
            expect(otp1 !== otp2).toBe(true);
        });
    });

    describe('hashOTP', () => {
        it('should return a 64-character hex string for SHA256', () => {
            const hash = hashOTP('123456');
            expect(typeof hash).toBe('string');
            expect(hash.length).toBe(64);
            expect(/^[a-f0-9]{64}$/i.test(hash)).toBe(true);
        });

        it('should produce consistent hashes for the same input', () => {
            const hash1 = hashOTP('123456');
            const hash2 = hashOTP('123456');
            expect(hash1).toBe(hash2);
        });

        it('should produce different hashes for different inputs', () => {
            const hash1 = hashOTP('123456');
            const hash2 = hashOTP('123457');
            expect(hash1 !== hash2).toBe(true);
        });
    });
});
