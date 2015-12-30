var expect = require('chai').expect,
    assert = require('chai').assert,
    sinon  = require('sinon'),
    rewire = require('rewire'),
    sonumiConnector = rewire("../index");


describe("Connect to DDP server", function() {
    var loggerMock,
        sonumiLoggerMock,
        ddpclientMock,
        clientMock,
        loginMock,
        configMock,
        connectionMock,
        connector;

    beforeEach(function() {
        loggerMock = sinon.stub();
        loggerMock.log = sinon.stub();
        loggerMock.addLogFile = sinon.stub();
        sonumiLoggerMock = sinon.stub();
        sonumiLoggerMock.init = sinon.stub().returns(loggerMock);
        clientMock = sinon.stub();
        clientMock.connect = sinon.stub().callsArg(0);
        clientMock.on = sinon.stub();
        clientMock.subscribe = sinon.spy();
        loginMock = sinon.spy();
        connectionMock = sinon.stub();
        connectionMock.connect = sinon.stub();
        ddpclientMock = function() { return clientMock; };


        clientMock.returns(connectionMock);

        configMock = {
            "server": {
                "host": "testhost",
                "port": "3000",
                "user": "test@example.com",
                "pass": "password"
            },
            "logging": {
                "logDir": "/tmp/"
            }
        };

        sonumiConnector.__set__({
            config: configMock,
            ddpclient: ddpclientMock,
            login: loginMock,
            logger: loggerMock,
            sonumiLogger: sonumiLoggerMock
        });

        connector = new sonumiConnector();
    });

    it('should connect to the client', function () {
        connector.connect();

        assert(clientMock.connect.calledOnce);
    });

    it('should login to the client after establishing a connection', function () {
        connector.connect();

        expect(loginMock.callCount).to.equal(1);
    });

    it('should subscribe to the supplied publication from the client', function () {
        var subscriptionName = 'people';

        connector.connect();

        connector.subscribe(subscriptionName);

        expect(clientMock.subscribe.calledWith(subscriptionName)).to.be.true;
    });
});
