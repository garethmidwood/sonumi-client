'use strict';

var fs = require('fs');

function fsAdapter() {}

fsAdapter.prototype = {
    mkdir: function (directory) {
        fs.mkdirSync(directory);
    }
};

module.exports = fsAdapter;