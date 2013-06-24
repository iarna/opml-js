"use strict";
var opml = exports = module.exports = {}

var sax = require('sax'),
    _   = require('underscore'),
    events = require('events'),
    util = require('util');

opml.parse = function (stream, options, callback) {
    var document;
    var errors = [];
    if (typeof(options) === 'function' ) {
        callback = options;
        options = null;
    }
    return new opml.Parser( stream, options )
        .on('document',function (d) { document = d; d.outlines = [] })
        .on('outline',function (o) { o.outlines = []; o.parent.outlines.push(o); delete(o.parent) })
        .on('error',function (e) { errors.push(e) })
        .on('end', function () { callback( errors.length ? errors : null, document ) });
};

opml.Document = function () {
    this.version         = '2.0';
    this.title           = undefined;
    this.dateCreated     = undefined;
    this.dateModified    = undefined;
    this.ownerName       = undefined;
    this.ownerEmail      = undefined;
    this.ownerId         = undefined;
    this.docs            = undefined;
    this.expansionState  = undefined;
    this.vertScrollState = undefined;
    this.windowTop       = undefined;
    this.windowLeft      = undefined;
    this.windowBottom    = undefined;
    this.windowRight     = undefined;
};
opml.Document.prototype = {};

opml.Outline = function () {
    this.parent       = undefined;
    this.text         = '(unlabeled outline)';
    this.type         = undefined;
    this.isComment    = undefined;
    this.isBreakpoint = undefined;
    this.created      = undefined;
    this.categories   = [];
    this.tags         = [];
    this.url          = undefined;
    this.xmlUrl       = undefined;
    this.htmlUrl      = undefined;
    this.description  = undefined;
    this.language     = undefined;
    this.title        = undefined;
    this.version      = undefined;
    this.attributes   = [];
};
opml.Outline.prototype = {};

opml.Parser = function (stream,options) {
    events.EventEmitter.call(this);
    this.initialize(stream,options);
};

util.inherits(opml.Parser,events.EventEmitter);
opml.Parser.prototype.document = null;
opml.Parser.prototype.onlinepath = [];
opml.Parser.prototype.textBuffer = '';
opml.Parser.prototype.stream     = null;

opml.Parser.prototype.initialize = function (stream,options) {
    options = options || {};
    this.strict = !! options.strict;
    this.document = new opml.Document();
    this.outlinepath = [this.document];
    this.textBuffer = '';
    this.stream = stream.pipe( sax.createStream(this.strict, {normalize:true,lowercase:true,xmlns:true,noscript:true}) );
    this.stream.on( 'error', this.onSaxError.bind(this) )
               .on( 'opentag', this.onSaxOpentag.bind(this) )
               .on( 'closetag', this.onSaxClosetag.bind(this) )
               .on( 'text', this.onSaxTextOrCDATA.bind(this) )
               .on( 'cdata', this.onSaxTextOrCDATA.bind(this) )
               .on( 'end', this.onSaxEnd.bind(this) );
};

opml.Parser.prototype.onSaxError = function (e) {
    this.emit('error',e);
};

var lowerMap = function (memo,value) { memo[value.toLowerCase()] = value; return memo; }
var stringAttrs = _.reduce(['text','type','url','xmlUrl','htmlUrl','description','language','title','version'], lowerMap, {});
var boolAttrs   = _.reduce(['isComment','isBreakpoint'], lowerMap, {});
var dateAttrs   = _.reduce(['created'], lowerMap, {});
var catAttrs    = _.reduce(['category'], lowerMap, {});

opml.Parser.prototype.isStringAttr = function (key) {
    return stringAttrs[key];
};

opml.Parser.prototype.isBoolAttr = function (key) {
    return boolAttrs[key];
};

opml.Parser.prototype.isDateAttr = function (key) {
    return dateAttrs[key];
};

opml.Parser.prototype.isCatAttr = function (key) {
    return catAttrs[key];
};

opml.Parser.prototype.onSaxOpentag = function (node) {
    this.textBuffer = '';
    if (node.name == 'outline') {
        var outline = new opml.Outline();
        outline.parent = _.last(this.outlinepath);

        for (var attrName in node.attributes) {
            var attr = node.attributes[attrName];
            var propName;
            if (propName = this.isStringAttr(attrName)) {
                outline[propName] = attr.value;
            }
            else if (propName = this.isBoolAttr(attrName)) {
                outline[attrName] = attr.value == 'true' ? true : v == 'false' ? false : null;
            }
            else if (propName = this.isDateAttr(attrName)) {
                outline[attrName] = Date.parse(attr.value);
            }
            else if (propName = this.isCatAttr(attrName)) {
                var raw = _.map(attr.value.split(/,/),function (s) { return s.trim() });
                outline.categories = _.filter(raw, function (s) { return s.indexOf('/') != -1; });
                outline.tags       = _.filter(raw, function (s) { return s.indexOf('/') == -1; });
            }
        }
        outline.attributes = _.reduce(node.attributes,function (memo,attr,key) { memo[key]=attr.value; return memo; }, {});
        this.outlinepath.push(outline);
        this.emit( 'outline', outline );
    }
};

opml.Parser.prototype.onSaxClosetag = function (nodeName) {
    var text = this.textBuffer.trim();
    this.textBuffer = '';
    if ( nodeName == 'title' ) {
        this.document.title = text;
    }
    else if ( nodeName == 'ownername' ) {
        this.document.ownerName = text;
    }
    else if ( nodeName == 'owneremail' ) {
        this.document.ownerEmail = text;
    }
    else if ( nodeName == 'ownerid' ) {
        this.document.ownerId = text;
    }
    else if ( nodeName == 'docs' ) {
        this.document.docs = text;
    }
    else if ( nodeName == 'expansionstate' ) {
        this.document.expansionState = _.map(text.split(/,/),function (s) { return s.trim(); });
    }
    else if ( nodeName == 'vertscrollstate' ) {
        this.document.vertScrollState = parseInt(text,10);
    }
    else if ( nodeName == 'windowtop' ) {
        this.document.windowTop = parseInt(text,10);
    }
    else if ( nodeName == 'windowleft' ) {
        this.document.windowLeft = parseInt(text,10);
    }
    else if ( nodeName == 'windowbottom' ) {
        this.document.windowBottom = parseInt(text,10);
    }
    else if ( nodeName == 'windowright' ) {
        this.document.windowRight = parseInt(text,10);
    }
    else if (nodeName == 'datecreated' ) {
        this.document.dateCreated = Date.parse(text);
    }
    else if (nodeName == 'datemodified' ) {
        this.document.dateModified = Date.parse(text);
    }
    else if (nodeName == 'head' ) {
        this.emit('document',this.document);
    }
    else if (nodeName == 'outline' ) {
        this.outlinepath.pop();
    }
    else if (_.contains(['opml','body'],nodeName)) {
        // Known tags that we don't do anything with
    }
    else {
        if (this.strict) {
            this.emit('error','Strictness error, unknown tag: '+nodeName);
        }
    }
};

opml.Parser.prototype.onSaxTextOrCDATA = function (textOrCDATA) {
    this.textBuffer += textOrCDATA;
};

opml.Parser.prototype.onSaxEnd = function () {
    this.emit('end');
};
