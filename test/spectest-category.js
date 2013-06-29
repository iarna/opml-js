"use strict";
var test = require("tap").test,
    opml = require('../opml'),
    fs   = require('fs');

test("Can we parse at all?", function (t) {
    t.plan(1);
    
    opml.parse( fs.createReadStream(__dirname+'/../specex/category.opml'), function (e,d) {
        var assertion = 'Loaded category document successfully';
        if (e) {
            t.fail(assertion);
            throw new Error( e.join("\n") );
        }
        else if (d) {
            t.pass(assertion);
//            console.log(d);
//            console.log(d.outlines);
        }
    });

});
