var expect = require('chai').expect,
    assert = require('chai').assert,
    sinon  = require('sinon'),
    rewire = require('rewire'),
    sonumiConnector = rewire("../index");


describe("Connect to DDP server", function() {
    var loggerMock, ddpclientMock, clientMock, loginMock, configMock, connectionMock, connectionConfig, connector;

    beforeEach(function() {
        loggerMock = sinon.stub();
        loggerMock.log = sinon.stub();
        clientMock = sinon.stub();
        clientMock.connect = sinon.stub().callsArg(0);
        clientMock.on = sinon.stub();
        clientMock.subscribe = sinon.spy();
        loginMock = sinon.spy();
        connectionMock = sinon.stub();
        connectionMock.connect = sinon.stub();
        ddpclientMock = sinon.stub();
        ddpclientMock.returns(clientMock);

        clientMock.returns(connectionMock);

        configMock = {
            "server": {
                "host": "testhost",
                "port": "3000",
                "user": "test@example.com",
                "pass": "password"
            }
        };

        sonumiConnector.__set__({
            config: configMock,
            ddpclient: ddpclientMock,
            login: loginMock,
            logger: loggerMock
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

describe("Configuration", function() {
    var loggerMock,
        ddpclientMock,
        clientMock,
        loginMock,
        configMock,
        connectionMock,
        connector,
        config;

    beforeEach(function () {
        config = { host: 'localhost', port: '1234' };

        loggerMock = sinon.stub();
        loggerMock.log = sinon.stub();
        clientMock = sinon.stub();
        clientMock.connect = sinon.stub().callsArg(0);
        clientMock.on = sinon.stub();
        clientMock.subscribe = sinon.spy();
        loginMock = sinon.spy();
        connectionMock = sinon.stub();
        connectionMock.connect = sinon.stub();
        ddpclientMock = sinon.stub();
        ddpclientMock.withArgs(config).returns(clientMock);

        clientMock.returns(connectionMock);

        configMock = {
            "server": {
                "host": "localhost",
                "port": "1234",
                "user": "test@example.com",
                "pass": "password"
            }
        };

        sonumiConnector.__set__({
            config: configMock,
            ddpclient: ddpclientMock,
            login: loginMock,
            logger: loggerMock
        });

        connector = new sonumiConnector();
    });

    it('should create a client using the server host and port config params', function () {
        connector.connect();

        assert(ddpclientMock.calledWith(config));
    });
});
