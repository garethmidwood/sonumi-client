'use strict';

var defaultLogAdapter = require('./adapter/logger/winston');
var defaultFsAdapter = require('./adapter/fs/fs');

function logger(logDirectory, adapters)
{
    logDirectory = typeof logDirectory !== 'undefined' ? logDirectory : '/tmp/sonumi-logs';
    adapters = typeof adapters !== 'undefined' ? adapters : {};

    var fsAdapter = adapters.hasOwnProperty('fs') ? adapters['fs'] : new defaultFsAdapter();
    var logAdapter = adapters.hasOwnProperty('logger') ? adapters['logger'] : new defaultLogAdapter();

    try {
        fsAdapter.mkdir(logDirectory);
    } catch(e) {
        if (e.code != 'EEXIST') {
            throw e;
        }
    }

    return logAdapter;
}

module.exports = logger;