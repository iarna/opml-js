OPML
----

A simple, but fully OPML v2 compliant OPML parser.

Features
--------

* Streaming with events for the OPML document header, and then one for each outline.

    parser = new opml.Parser( fs.createReadStream('specex/states.opml') );
    parser.on('outline', function(o) { ... } );

* Document mode, where you use a callback to receive a complete object
  representation of the OPML document.

    opml.parse( fs.createReadStream('example.opml'), function (d,e) {
        if (e) {
            throw new Error( e.join("\n") );
        }
        console.log(d);
    });

Prior Art
---------

opml-parser - Provides basic OPML parsing for subscription lists, but does
not maintain sufficient information to recreate an OPML file from a parse. 
Does not report nested outlines.  It also doesn't inflate the various
structured fields.

TODO
----

* Add ability to emit OPML
* Examples from the wild
* Ensure namespaced additions, including with otherwise conflicting tag names, work properly.
* Support encodings other then UTF-8-- all of the examples are ISO-8859-1 *headdesk*
* Errors as exceptions-- generally look over how errors are being reported.
* Consider annotating outline nodes with expansionState and vertScrollState