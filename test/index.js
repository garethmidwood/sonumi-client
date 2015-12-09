var expect = require('chai').expect,
    assert = require('chai').assert,
    sinon  = require('sinon'),
    sonumiConnector = require("../index");

describe("Connect to DDP server", function() {
    var loggerMock, clientMock, loginMock, configMock, connectionMock, connector;

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

        clientMock.returns(connectionMock);

        configMock = {
            "server": {
                "host": "testhost",
                "port": "3000",
                "user": "test@example.com",
                "pass": "password"
            }
        };

        connector = new sonumiConnector({
            'logger': loggerMock,
            'client': clientMock,
            'login': loginMock,
            'config': configMock
        });
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

        connector.subscribe(subscriptionName);

        expect(clientMock.subscribe.calledWith(subscriptionName)).to.be.true;
    });
});
