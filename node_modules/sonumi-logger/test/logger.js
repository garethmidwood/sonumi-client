var expect = require('chai').expect,
    assert = require('chai').assert,
    sinon  = require('sinon'),
    rewire = require('rewire'),
    logDir = '/tmp/logger-test/';


describe("Write logs", function() {
    var sonumiLogger = rewire("../lib/logger");

    var fsAdapterMock, logAdapterMock;

    beforeEach(function() {
        logAdapterMock = sinon.stub();
        logAdapterMock.addLogFile = sinon.stub();

        fsAdapterMock = sinon.stub();
        fsAdapterMock.mkdir = sinon.stub();
    });


    it('should create the log directory', function () {
        new sonumiLogger(logDir, {
            'fs': fsAdapterMock,
            'logger': logAdapterMock
        });

        assert(fsAdapterMock.mkdir.calledOnce);
    });

    it('should throw an error if the log directory cannot be created', function () {
        fsAdapterMock.mkdir.throws(new Error);

        expect(function() {
            (new sonumiLogger(logDir, {
                'fs': fsAdapterMock,
                'logger': logAdapterMock
            }))
        }).to.throw(Error);
    });

    it('shouldn\'t throw an error if the log directory already exists', function () {
        var error = new Error();
        error.code = 'EEXIST';
        fsAdapterMock.mkdir.throws(error);

        expect(function() {
            (new sonumiLogger(logDir, {
                'fs': fsAdapterMock,
                'logger': logAdapterMock
            }))
        }).to.not.throw(Error);
    });

});
