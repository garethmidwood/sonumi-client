'use strict';

var winston = require('winston');
var logger;

function logAdapter()
{
    logger = new (winston.Logger)({
        transports: [
            new (winston.transports.Console)({
                name: 'console',
                level: 'debug'
            })
        ]
    });
}

logAdapter.prototype = {
    addLogFile: function(name, filename, level) {
        logger.add(winston.transports.File, {
            name: name,
            filename: filename,
            level: level
        });
    },
    log: function(msg) {
        logger.info(msg)
    },
    error: function(msg) {
        logger.error(msg);
    },
    debug: function(msg) {
        logger.debug(msg);
    }
};

module.exports = logAdapter;