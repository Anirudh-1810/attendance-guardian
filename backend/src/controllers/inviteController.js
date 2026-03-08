const inviteService = require('../services/inviteService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

exports.generate = catchAsync(async (req, res, next) => {
    const { expiresAt } = req.body;
    const { code, invite } = await inviteService.generateInvite(req.user.userId, expiresAt);

    res.status(201).json({
        status: 'success',
        message: 'Invite code generated successfully',
        data: { code, invite },
    });
});

exports.generateBulk = catchAsync(async (req, res, next) => {
    const { count, expiresAt } = req.body;

    if (!count) {
        return next(new AppError('Count is required', 400));
    }

    const { codes, invites } = await inviteService.generateBulkInvites(
        req.user.userId,
        parseInt(count, 10),
        expiresAt
    );

    res.status(201).json({
        status: 'success',
        message: `${codes.length} invite codes generated successfully`,
        data: { codes, invites },
    });
});

exports.list = catchAsync(async (req, res, next) => {
    const invites = await inviteService.listInvites(req.user.userId);

    res.status(200).json({
        status: 'success',
        results: invites.length,
        data: { invites },
    });
});

exports.revoke = catchAsync(async (req, res, next) => {
    const invite = await inviteService.revokeInvite(req.user.userId, req.params.id);

    res.status(200).json({
        status: 'success',
        message: 'Invite code revoked successfully',
        data: { invite },
    });
});

exports.remove = catchAsync(async (req, res, next) => {
    await inviteService.deleteInvite(req.user.userId, req.params.id);

    res.status(200).json({
        status: 'success',
        message: 'Invite code deleted successfully',
    });
});

exports.stats = catchAsync(async (req, res, next) => {
    const stats = await inviteService.getStats(req.user.userId);

    res.status(200).json({
        status: 'success',
        data: { stats },
    });
});
