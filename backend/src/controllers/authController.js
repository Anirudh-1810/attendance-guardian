const authService = require('../services/authService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

exports.signup = catchAsync(async (req, res, next) => {
    console.log('DEBUG SIGNUP BODY:', req.body);
    const { name, email, password } = req.body;

    if (!email || !password || !name) {
        return next(new AppError('Missing required fields: name, email, password', 400));
    }

    const result = await authService.signup({ name, email, password });

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
