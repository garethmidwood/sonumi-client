var config = require('config');
var ddpclient = require('ddp');
var ddplogin = require('ddp-login');
var sonumiLogger = require('sonumi-logger');

var client,
    logger;

function Connector()
{
    var logDirectory = config.logging.logDir;
    logger = sonumiLogger.init(logDirectory);
    logger.addLogFile('info', logDirectory + '/connector-info.log', 'info');
}

Connector.prototype = {
    connect: function () {
        client = new ddpclient({ host: config.server.host, port: config.server.port });

        return new Promise(function(resolve, reject) {
            logger.log('attempting connection');

            client.connect(function(error) {
                if (error) {
                    logger.error('connection error: ' + error.message);
                    reject('Connection error');
                    return;
                }

                client.on('socket-close', function (code, message) {
                    logger.log('Connection closed with code: ' + code + ' and message: ' + message);
                });

                client.on('socket-error', function (error) {
                    logger.error('Socket error: ' + error);
                });

                logger.log('connected successfully');

                resolve('connected successfully');
            });
        });
    },
    login: function() {
        return new Promise(function(resolve, reject) {
            logger.log('attempting login');

            ddplogin.loginWithEmail(client, config.server.user, config.server.pass, function (error, userInfo) {
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
    subscribe: function (subscription) {
        // subscribe to commands
        client.subscribe(subscription, [], function () {
            logger.log('subscription complete: ' + subscription);
        });
    }
};

module.exports = Connector;





//'pub_commands'
/*
 // start observing commands
 var commandHandler = new commandHandler(client);

 commandHandler.register_handler('led', new led(this));
 */