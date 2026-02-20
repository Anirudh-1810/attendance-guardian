const classController = require('../../src/controllers/classController');
const classService = require('../../src/services/classService');

jest.mock('../../src/services/classService', () => ({
    getClasses: jest.fn(),
    getClassesByDate: jest.fn(),
    createClass: jest.fn(),
    createClassesBulk: jest.fn(),
    updateClass: jest.fn(),
    markAttendance: jest.fn(),
    markAttendanceBulk: jest.fn(),
    deleteClass: jest.fn(),
    markSubjectAttendanceDate: jest.fn(),
}));

describe('ClassController', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            query: {},
            params: {},
            body: {}
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        next = jest.fn();
        jest.clearAllMocks();
    });

    it('should get classes', async () => {
        req.query = { subjectId: '1' };
        const mockClasses = [{ id: '1' }];
        classService.getClasses.mockResolvedValue(mockClasses);

        await classController.getClasses(req, res, next);

        expect(classService.getClasses).toHaveBeenCalledWith(req.query);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(mockClasses);
    });

    it('should create classes bulk', async () => {
        req.body = { classes: [{ subjectId: '1', date: '2023-01-01' }] };
        const mockCreated = { count: 1 };
        classService.createClassesBulk.mockResolvedValue(mockCreated);

        await classController.createClassesBulk(req, res, next);

        expect(classService.createClassesBulk).toHaveBeenCalledWith(req.body.classes);
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(mockCreated);
    });

    it('should mark attendance bulk', async () => {
        req.body = { updates: [{ id: '1', status: 'PRESENT' }] };
        const mockResults = [{ count: 1 }];
        classService.markAttendanceBulk.mockResolvedValue(mockResults);

        await classController.markAttendanceBulk(req, res, next);

        expect(classService.markAttendanceBulk).toHaveBeenCalledWith(req.body.updates);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(mockResults);
    });

    it('should mark subject attendance strictly for a date', async () => {
        req.body = { subjectId: '1', date: '2023-01-01', status: 'PRESENT' };
        const mockRes = { id: 'class1', status: 'PRESENT' };
        classService.markSubjectAttendanceDate.mockResolvedValue(mockRes);

        await classController.markSubjectAttendanceDate(req, res, next);

        expect(classService.markSubjectAttendanceDate).toHaveBeenCalledWith('1', '2023-01-01', 'PRESENT');
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(mockRes);
    });
});
