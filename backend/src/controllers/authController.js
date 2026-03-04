const authService = require('../services/authService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const generateOTP = require('../utils/generateOTP');
const hashOTP = require('../utils/hashOTP');
const { sendOTPEmail } = require('../services/emailService');
const prisma = require('../prisma');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

exports.signup = catchAsync(async (req, res, next) => {
    const { name, email, password, inviteCode } = req.body;

    if (!email || !password || !name) {
        return next(new AppError('Missing required fields: name, email, password', 400));
    }

    if (!inviteCode) {
        return next(new AppError('Invite code is required', 400));
    }

    const result = await authService.signup({ name, email, password, inviteCode });

    res.status(201).json(result);
});

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new AppError('Missing required fields: email, password', 400));
    }

    const result = await authService.login({ email, password });

    res.status(200).json(result);
});

exports.requestOtp = catchAsync(async (req, res, next) => {
    const { email } = req.body;

    // 1. Validate email format
    if (!email || !EMAIL_REGEX.test(email)) {
        return next(new AppError('Please provide a valid email address.', 400));
    }

    // 2. Generate OTP
    const otp = generateOTP();

    // 3. Hash OTP
    const otpHash = hashOTP(otp);

    // 4. Store hashed OTP in database with 5-minute expiration
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

    // Upsert so if an email already has an OTP requested, we overwrite it to prevent spamming the DB
    await prisma.oTP.upsert({
        where: { email },
        update: { otpHash, expiresAt, createdAt: new Date() },
        create: { email, otpHash, expiresAt },
    });

    // 5. Send email containing OTP
    await sendOTPEmail(email, otp);

    // 6. Return success response
    res.status(200).json({
        message: 'OTP sent successfully',
    });
});

exports.verifyOtp = catchAsync(async (req, res, next) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return next(new AppError('Please provide both email and OTP.', 400));
    }

    // 1. Hash the provided OTP
    const providedHash = hashOTP(otp);

    // 2. Find OTP record for the email
    const otpRecord = await prisma.oTP.findUnique({ where: { email } });

    if (!otpRecord) {
        return next(new AppError('No OTP found for this email. Please request a new one.', 400));
    }

    // 3. Verify hash matches
    if (otpRecord.otpHash !== providedHash) {
        return next(new AppError('Invalid OTP.', 400));
    }

    // 4. Verify OTP not expired
    if (new Date() > new Date(otpRecord.expiresAt)) {
        // Delete expired OTP
        await prisma.oTP.delete({ where: { email } });
        return next(new AppError('OTP has expired. Please request a new one.', 400));
    }

    // 5. Delete or invalidate OTP after successful verification
    await prisma.oTP.delete({ where: { email } });

    // 6. Check if user exists
    let user = await prisma.user.findUnique({ where: { email } });

    // 7. If user does not exist, create user
    if (!user) {
        user = await prisma.user.create({
            data: {
                email,
                name: email.split('@')[0], // Give a default name
                role: 'student',
            },
        });
    }

    // 8. Generate JWT token
    const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '7d' }
    );

    // 9. Return authenticated session
    res.status(200).json({
        token,
        user: {
            id: user.id,
            email: user.email,
            role: user.role,
        },
    });
});
