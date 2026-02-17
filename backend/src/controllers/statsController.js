const statsService = require('../services/statsService');
const catchAsync = require('../utils/catchAsync');

exports.getSemesterStats = catchAsync(async (req, res, next) => {
    const stats = await statsService.getSemesterStats(req.params.semesterId);
    res.status(200).json(stats);
});

exports.getSubjectTrend = catchAsync(async (req, res, next) => {
    const trend = await statsService.getSubjectTrend(req.params.subjectId);
    res.status(200).json(trend);
});
