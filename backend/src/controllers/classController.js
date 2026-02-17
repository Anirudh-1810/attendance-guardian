const classService = require('../services/classService');
const catchAsync = require('../utils/catchAsync');

exports.getClasses = catchAsync(async (req, res, next) => {
    const classes = await classService.getClasses(req.query);
    res.status(200).json(classes);
});

exports.getClassesByDate = catchAsync(async (req, res, next) => {
    const classes = await classService.getClassesByDate(req.params.date, req.query.semesterId);
    res.status(200).json(classes);
});

exports.createClass = catchAsync(async (req, res, next) => {
    const classEntry = await classService.createClass(req.body);
    res.status(201).json(classEntry);
});

exports.createClassesBulk = catchAsync(async (req, res, next) => {
    const created = await classService.createClassesBulk(req.body.classes);
    res.status(201).json(created);
});

exports.updateClass = catchAsync(async (req, res, next) => {
    const updatedClass = await classService.updateClass(req.params.id, req.body);
    res.status(200).json(updatedClass);
});

exports.markAttendance = catchAsync(async (req, res, next) => {
    const updatedClass = await classService.markAttendance(req.params.id, req.body);
    res.status(200).json(updatedClass);
});

exports.markAttendanceBulk = catchAsync(async (req, res, next) => {
    const results = await classService.markAttendanceBulk(req.body.updates);
    res.status(200).json(results);
});

exports.deleteClass = catchAsync(async (req, res, next) => {
    const result = await classService.deleteClass(req.params.id);
    res.status(200).json(result);
});
