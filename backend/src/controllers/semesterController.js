const semesterService = require('../services/semesterService');
const catchAsync = require('../utils/catchAsync');

exports.getAllSemesters = catchAsync(async (req, res, next) => {
    const semesters = await semesterService.getAllSemesters(req.user.userId);
    res.status(200).json(semesters);
});

exports.getCurrentSemester = catchAsync(async (req, res, next) => {
    const semester = await semesterService.getCurrentSemester(req.user.userId);
    res.status(200).json(semester);
});

exports.createSemester = catchAsync(async (req, res, next) => {
    const semester = await semesterService.createSemester(req.user.userId, req.body);
    res.status(201).json(semester);
});

exports.updateSemester = catchAsync(async (req, res, next) => {
    const semester = await semesterService.updateSemester(req.user.userId, req.params.id, req.body);
    res.status(200).json(semester);
});

exports.deleteSemester = catchAsync(async (req, res, next) => {
    const result = await semesterService.deleteSemester(req.user.userId, req.params.id);
    res.status(200).json(result);
});
