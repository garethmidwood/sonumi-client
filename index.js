var config = require('config');
var ddp = require('ddp');
var ddplogin = require('ddp-login');
var sonumiLogger = require('sonumi-logger');

var ddpclient,
    logger;

function Client()
{
    var logDirectory = config.logging.logDir;
    logger = sonumiLogger.init(logDirectory);
    logger.addLogFile('info', logDirectory + '/client-info.log', 'info');
}

Client.prototype = {
    connected: false,
    connect: function (reconnectionCallback) {
        ddpclient = new ddp({ host: config.server.host, port: config.server.port, autoReconnect : true });

        var self = this;

        return new Promise(function(resolve, reject) {
            logger.log('attempting connection to ' + config.server.host + ':' + config.server.port);

            ddpclient.connect(function(error) {
                if (error) {
                    self.connected = false;
                    logger.error('connection error: ' + error.message);
                    reject('Connection error');
                    return;
                }

                self.connected = true;

                ddpclient.on('socket-close', function (code, message) {
                    self.connected = false;
                    logger.log('Connection closed with code: ' + code + ' and message: ' + message);
                    reconnectionCallback();
                });

                ddpclient.on('socket-error', function (error) {
                    self.connected = false;
                    logger.error('Socket error: ' + error);
                    reconnectionCallback();
                });

                logger.log('connected successfully');

                resolve('connected successfully');
            });
        });
    },
    login: function() {
        return new Promise(function(resolve, reject) {
            logger.log('attempting login as ' + config.server.user);

            ddplogin.loginWithEmail(ddpclient, config.server.user, config.server.pass, function (error, userInfo) {
                if (error) {
                    logger.error('error logging in: ' +  error);
                    reject(Error('Error logging in'));
                } else {
                    // We are now logged in, with userInfo.token as our session auth token.
                    logger.log('logged in successfully. token: ' + userInfo.token);
                    resolve('Logged in successfully');
                }
            });
        });
    },
    subscribe: function (publication) {
        return new Promise(function(resolve, reject) {
            ddpclient.subscribe(publication, [], function () {
                logger.log('subscription complete: ' + publication);
                resolve();
            });
        });
    },
    observe: function (publication) {
        logger.log('Added observer for ' + publication);
        return ddpclient.observe(publication);
    },
    collections: function() {
        return ddpclient.collections;
    },
    call: function(command, params, callback) {
        return ddpclient.call(command, params, callback);
    }
};

module.exports = Client;
