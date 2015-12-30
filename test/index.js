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
        loginMock = sinon.stub();
        loginMock.loginWithEmail = sinon.stub().callsArgWith(3, null, { token: '1234' });
        ddpclientMock = function() { return clientMock; };

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
            ddplogin: loginMock,
            logger: loggerMock,
            sonumiLogger: sonumiLoggerMock
        });

        connector = new sonumiConnector();
    });

    it('should connect to the client', function (done) {
        var connectorPromise = connector.connect();

        connectorPromise.then(function() { done(); });

        assert(clientMock.connect.calledOnce);
    });

    it('should login to the client with details from config', function (done) {
        var connectorPromise = connector.connect();

        connectorPromise.then(
            function() {
                var loginPromise = connector.login();

                loginPromise.then(
                    function() {
                        expect(
                            loginMock.loginWithEmail.calledWith(
                                clientMock,
                                configMock.server.user,
                                configMock.server.pass
                            )
                        );

                        done();
                    }
                );
            }
        );
    });

    it('should subscribe to the supplied publication from the client', function () {
        var subscriptionName = 'people';

        var connectorPromise = connector.connect();

        connectorPromise.then(
            function() {
                connector.subscribe(subscriptionName);

                assert(clientMock.subscribe.calledWith(subscriptionName));

                done();
            }
        );
    });

    it('should observe a publication from the client', function () {
        var publicationName = 'people';

        var connectorPromise = connector.connect();

        connectorPromise.then(
            function() {
                connector.observe(publicationName);

                assert(clientMock.observe.calledWith(publicationName));

                done();
            }
        );
    });
});
