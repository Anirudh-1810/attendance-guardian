const holidayService = require('../services/holidayService');
const catchAsync = require('../utils/catchAsync');

exports.getHolidays = catchAsync(async (req, res, next) => {
    const holidays = await holidayService.getHolidays(req.query.semesterId);
    res.status(200).json(holidays);
});

exports.createHoliday = catchAsync(async (req, res, next) => {
    const holiday = await holidayService.createHoliday(req.body);
    res.status(201).json(holiday);
});

exports.createHolidaysBulk = catchAsync(async (req, res, next) => {
    const created = await holidayService.createHolidaysBulk(req.body.holidays);
    res.status(201).json(created);
});

exports.deleteHoliday = catchAsync(async (req, res, next) => {
    const result = await holidayService.deleteHoliday(req.params.id);
    res.status(200).json(result);
});
