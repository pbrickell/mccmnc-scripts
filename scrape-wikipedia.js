#!/usr/bin/env node
var fs = require('fs'),
        readline = require('readline');

var rd = readline.createInterface({
    input: fs.createReadStream('./wiki.html'),
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
                console.log(operator[0] + operator[1] + ',' + operator[2]);
            } else {
                if (operator[3]) {
                    console.log(operator[0] + operator[1] + ',' + operator[2] + ' [' + [operator[3]] + ']');
                } else {
                    console.log(operator[0] + operator[1] + ',' + operator[2]);
                }
            }
        } else {
            if (operator[3]) {
                console.log(operator[0] + operator[1] + ',' + operator[3]);
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
