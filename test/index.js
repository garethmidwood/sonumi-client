var expect = require('chai').expect,
    assert = require('chai').assert,
    sinon  = require('sinon'),
    rewire = require('rewire'),
    sonumiClient = rewire("../index");


describe("Connect to DDP server", function() {
    var loggerMock,
        sonumiLoggerMock,
        ddpMock,
        ddpClientMock,
        loginMock,
        configMock,
        client;

    beforeEach(function() {
        loggerMock = sinon.stub();
        loggerMock.log = sinon.stub();
        loggerMock.addLogFile = sinon.stub();
        sonumiLoggerMock = sinon.stub();
        sonumiLoggerMock.init = sinon.stub().returns(loggerMock);
        ddpClientMock = sinon.stub();
        ddpClientMock.connect = sinon.stub().callsArg(0);
        ddpClientMock.on = sinon.stub();
        ddpClientMock.subscribe = sinon.spy();
        loginMock = sinon.stub();
        loginMock.loginWithEmail = sinon.stub().callsArgWith(3, null, { token: '1234' });
        ddpMock = function() { return ddpClientMock; };

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

        sonumiClient.__set__({
            config: configMock,
            ddp: ddpMock,
            ddplogin: loginMock,
            logger: loggerMock,
            sonumiLogger: sonumiLoggerMock
        });

        client = new sonumiClient();
    });

    it('should connect to the client', function () {
        var clientPromise = client.connect();

        clientPromise.then(function() { done(); });

        assert(ddpClientMock.connect.calledOnce);
    });

    it('should login to the client with details from config', function () {
        var clientPromise = client.connect();

        clientPromise.then(
            function() {
                var loginPromise = client.login();

                loginPromise.then(
                    function() {
                        expect(
                            loginMock.loginWithEmail.calledWith(
                                ddpClientMock,
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

        var clientPromise = client.connect();

        clientPromise.then(
            function() {
                var subscribePromise = client.subscribe(subscriptionName);

                subscribePromise.then(
                    function() {
                        assert(ddpClientMock.subscribe.calledWith(subscriptionName));

                        done();
                    }
                );
            }
        );
    });

    it('should observe a publication from the client', function () {
        var publicationName = 'people';

        var clientPromise = client.connect();

        clientPromise.then(
            function() {
                client.observe(publicationName);

                assert(ddpClientMock.observe.calledWith(publicationName));

                done();
            }
        );
    });
});
