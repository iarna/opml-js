"use strict";
var test = require("tape"),
    opml = require('../opml'),
    fs   = require('fs');

test("Specification Examples Test- category.opml", function (t) {
    t.plan(12);
    
    opml.parse(fs.createReadStream(__dirname+'/../specex/category.opml'))
        (function (e,d) {
            t.ok( e===null, 'Loaded document successfully' );
            if (e) throw new Error( e.join("\n") );
            t.is( typeof(d), 'object', 'Document object not constructed' );
            if (!d) throw new Error('No document object to test');
            t.is( d.version, 2.0, 'Version matches' );
            t.is( d.title, 'Illustrating the category attribute', 'Title matches' );
            t.is( d.dateCreated, Date.parse('Mon, 31 Oct 2005 19:23:00 GMT'), 'Created matches' );
            t.is( d.outlines.length, 1, 'One outline in the body' );
            var outline = d.outlines[0];
            t.is( outline.text, 'The Mets are the best team in baseball.', 'Outline text matches' );
            t.is( outline.created, Date.parse('Mon, 31 Oct 2005 18:21:33 GMT'), 'Outline created matches' );
            t.is( outline.tags.length, 0, 'Outline has no tags' );
            t.is( outline.categories.length, 2, 'Outline has two categories' );
            t.is( outline.categories[0], '/Philosophy/Baseball/Mets', 'Outline first category matches' );
            t.is( outline.categories[1], '/Tourism/New York', 'Outline second category matches' );
        });
});
