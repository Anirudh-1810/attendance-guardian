const courseService = require('../services/courseService');
const catchAsync = require('../utils/catchAsync');

exports.createCourse = catchAsync(async (req, res, next) => {
    const course = await courseService.createCourse(req.user.userId, req.body);
    res.status(201).json(course);
});

exports.getCoursesBySemester = catchAsync(async (req, res, next) => {
    const courses = await courseService.getCoursesBySemester(req.user.userId, req.params.semesterId);
    res.status(200).json(courses);
});
