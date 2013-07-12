#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";
var URLFILE_DEFAULT = "url.html";
var rest = require('restler');
var util = require('util');

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
	console.log("%s does not exist. Exiting.", instr);
	process.exit(1);
    }
    return instr;
};

var buildfn = function(checksfile) {
    var response2console = function(result, response) {
	if (result instanceof Error) {
	    console.error('Error: ' + util.format(response.message));
	} else {
	    $ = cheerio.load(result);
	    var checks = JSON.parse(fs.readFileSync(checksfile)).sort();
	    var out = {};
	    for(var ii in checks) {
		var present = $(checks[ii]).length > 0;
		out[checks[ii]] = present;
	    }
	    var outJson = JSON.stringify(out, null, 4);
	    fs.writeFileSync("JSONoutput.txt", outJson);
	    console.log(outJson);
	}
    };
    return response2console;
};

var cheerioHtmlFile = function(htmlfile) {
      return cheerio.load(fs.readFileSync(htmlfile));
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile, checksfile) {
    $ = cheerioHtmlFile(htmlfile);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
	var present = $(checks[ii]).length > 0;
	out[checks[ii]] = present;
    }
    return out;
};

var clone = function(fn) {
    return fn.bind({});
};

if(require.main == module) {
    program
	.option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
	.option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists))
	.option('-u, --url <url_link>', 'Url to index.htm')
	.parse(process.argv);

    if(program.file){
	var checkJson = checkHtmlFile(program.file, program.checks);
	var outJson = JSON.stringify(checkJson, null, 4);
	console.log(outJson);
    }

    if(program.url){
	var response2console = buildfn(program.checks);
	rest.get(program.url).on('complete',response2console);
    }

} else {
    exports.checkHtmlFile = checkHtmlFile;
}

