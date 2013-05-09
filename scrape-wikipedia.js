#!/usr/bin/env node
var fs = require('fs'),
        http = require('http'),
        readline = require('readline');

var ws = fs.createWriteStream('./wiki2.html', {
    flags: 'w',
    encoding: 'utf-8',
    mode: 0666
});

var options = {
    hostname: 'en.wikipedia.org',
    port: 80,
    path: '/wiki/Mobile_country_code',
    method: 'GET'
};

var req = http.request(options, function(res) {
    res.setEncoding('utf8');
    res.on('data', function(chunk) {
        ws.write(chunk);
    });
    res.on('end', function() {
        ws.end();
        processPage();
    });
});

req.on('error', function(e) {
    console.log('problem with request: ' + e.message);
});

req.end();

function processPage() {
    var rd = readline.createInterface({
        input: fs.createReadStream('./wiki2.html'),
        output: process.stdout,
        terminal: false
    });

    var field = 0;
    var operator = [];
    var inOperator = false;
    rd.on('line', function(line) {

        if (line === '<tr>') {
            inOperator = true;
            return;
        }

        if (inOperator && line === '</tr>') {
            if (operator[2]) {
                if (operator[2] === operator[3]) {
                    console.log(operator[0] + operator[1] + ',' + operator[0] + ',' + operator[1] + ',' + operator[2]);
                } else {
                    if (operator[3]) {
                        console.log(operator[0] + operator[1] + ',' + operator[0] + ',' + operator[1] + ',' + operator[2] + ' [' + [operator[3]] + ']');
                    } else {
                        console.log(operator[0] + operator[1] + ',' + operator[0] + ',' + operator[1] + ',' + operator[2]);
                    }
                }
            } else {
                if (operator[3]) {
                    console.log(operator[0] + operator[1] + ',' + operator[0] + ',' + operator[1] + ',' + operator[3]);
                }
            }

            field = 0;
            operator = [];
            inOperator = false;
        }


        if ((/^<td>/).test(line) && field++ < 4) {
            var value = line.replace(/<(?:.|\n)*?>/gm, '').replace('&amp;', '&').replace('&nbsp;??', '').replace('&nbsp;?', '');
            operator.push(value);
        }
    });
}
