var defaultConfig = require('config');
var ddpClient = require('ddp');
var ddpLogin = require('ddp-login');
var sonumiLogger = require('sonumi-logger');

var logger, client, login, config;
var loggedIn = false;

function connectionCallback(error)
{
    if (error) {
        logger.error('connection error: ' + error.message);
        return;
    }

    logger.log('connected! attempting to login');

    login(
        client,
        {
            env: 'METEOR_TOKEN',
            method: 'email',
            account: config.server.user,
            pass: config.server.pass,
            retry: 5,
            plaintext: false
        },
        function (error, userInfo) {
            if (error) {
                loggedIn = false;
                logger.error('error logging in: ' +  error);
            } else {
                // We are now logged in, with userInfo.token as our session auth token.
                loggedIn = true;
                logger.log('logged in successfully. token: ' + userInfo.token);
            }
        }
    );
}

function Connector(dependencies)
{
    logger = typeof dependencies['logger'] !== 'undefined' ? dependencies['logger'] : new sonumiLogger();
    login = typeof dependencies['login'] !== 'undefined' ? dependencies['login'] : ddpLogin;
    config = typeof dependencies['config'] !== 'undefined' ? dependencies['config'] : defaultConfig;
    client = typeof dependencies['client'] !== 'undefined' ? dependencies['client'] :
        new ddpClient({ host: config.server.host, port: config.server.port });
}

Connector.prototype = {
    connect: function () {
        logger.log('attempting connection');

        client.connect(connectionCallback);

        client.on('socket-close', function (code, message) {
            logger.log('Connection closed with code: ' + code + ' and message: ' + message);
        });

        client.on('socket-error', function (error) {
            logger.error('Socket error: ' + error);
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