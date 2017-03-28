/*global require,Blob,JSHINT*/
/*global gallery_demos*/// defined by gallery/gallery-index.js, created by build
/*global sandcastleJsHintOptions*/// defined by jsHintOptions.js, created by build
require({
    baseUrl : '../../Source',
    packages : [ {
        name : 'Sandcastle',
        location : '../Apps/Sandcastle'
    }, {
        name : 'Source',
        location : '.'
    }]
}, [
        'Sandcastle/LinkButton',
        'Source/Cesium'
    ], function(
        LinkButton,
        Cesium) {
    "use strict";

    //In order for CodeMirror auto-complete to work, Cesium needs to be defined as a global.
    window.Cesium = Cesium;

    function defined(value) {
        return value !== undefined;
    }

    parser.parse();

    fx.fadeOut({
        node : 'loading',
        onEnd : function() {
            domConstruct.destroy('loading');
        }
    }).play();

    var numberOfNewConsoleMessages = 0;

    var logOutput = document.getElementById('logOutput');
    function appendConsole(className, message, showConsole) {
        var ele = document.createElement('span');
        ele.className = className;
        ele.textContent = message + '\n';
        logOutput.appendChild(ele);
        logOutput.parentNode.scrollTop = logOutput.clientHeight + 8 - logOutput.parentNode.clientHeight;
        if (showConsole) {
            hideGallery();
        } else {
            ++numberOfNewConsoleMessages;
            registry.byId('logContainer').set('title', 'Console (' + numberOfNewConsoleMessages + ')');
        }
    }

    var URL = window.URL || window.webkitURL;

    function findCssStyle(selectorText) {
        for (var iSheets = 0, lenSheets = document.styleSheets.length; iSheets < lenSheets; ++iSheets) {
            var rules = document.styleSheets[iSheets].cssRules;
            for (var iRules = 0, lenRules = rules.length; iRules < lenRules; ++iRules) {
                if (rules[iRules].selectorText === selectorText) {
                    return rules[iRules];
                }
            }
        }
    }

    var jsEditor;
    var htmlEditor;
    var suggestButton = registry.byId('buttonSuggest');
    var docTimer;
    var docTabs = {};
    var subtabs = {};
    var docError = false;
    var galleryError = false;
    var galleryTooltipTimer;
    var activeGalleryTooltipDemo;
    var demoTileHeightRule = findCssStyle('.demoTileThumbnail');
    var cesiumContainer = registry.byId('cesiumContainer');
    var docNode = dom.byId('docPopup');
    var docMessage = dom.byId('docPopupMessage');
    var local = {
        'docTypes' : [],
        'headers' : '<html><head></head><body>',
        'bucketName' : '',
        'emptyBucket' : ''
    };
    var bucketTypes = {};
    var demoTooltips = {};
    var errorLines = [];
    var highlightLines = [];
    var searchTerm = '';
    var searchRegExp;
    var hintTimer;
    var currentTab = '';
    var newDemo;
    var demoHtml = '';
    var demoJs = '';

    var galleryErrorMsg = document.createElement('span');
    galleryErrorMsg.className = 'galleryError';
    galleryErrorMsg.style.display = 'none';
    galleryErrorMsg.textContent = 'No demos match your search terms.';

    var bucketFrame = document.getElementById('bucketFrame');
    var bucketPane = registry.byId('bucketPane');
    var bucketWaiting = false;

    xhr.get({
        url : '../../Build/Documentation/types.txt',
        handleAs : 'json',
        error : function(error) {
            docError = true;
        }
    }).then(function(value) {
        local.docTypes = value;
    });

    var decoderSpan = document.createElement('span');
    function encodeHTML(text) {
        decoderSpan.textContent = text;
        text = decoderSpan.innerHTML;
        decoderSpan.innerHTML = '';
        return text;
    }
    function decodeHTML(text) {
        decoderSpan.innerHTML = text;
        text = decoderSpan.textContent;
        decoderSpan.innerHTML = '';
        return text;
    }
});
