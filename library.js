'use strict';

var	async = module.parent.require('async');
var S = module.parent.require('string');
var winston = module.parent.require('winston');
var XRegExp = module.parent.require('xregexp');
var validator = module.parent.require('validator');
var nconf = module.parent.require('nconf');
var request = require('request');

var Utils = module.parent.require('../public/src/utils');

var SocketPlugins = module.parent.require('./socket.io/plugins');

SocketPlugins.giphy = {};

var Giphy = {};

Giphy.parsePost = function(data, callback) {
	if (!data || !data.postData || !data.postData.content) {
		return callback(null, data);
	}

	Giphy.parseRaw(data.postData.content, function(err, content) {
		if (err) {
			return callback(err);
		}

		data.postData.content = content;
		callback(null, data);
	});
};

Giphy.parseRaw = function(content, callback) {
	return callback(null, content);
};

Giphy.split = function(input, isMarkdown, splitBlockquote, splitCode) {
	var matchers = [isMarkdown ? '\\[.*?\\]\\(.*?\\)' : '<a[\\s\\S]*?</a>'];
	if (splitBlockquote) {
		matchers.push(isMarkdown ? '^>.*$' : '^<blockquote>.*?</blockquote>');
	}
	if (splitCode) {
		matchers.push(isMarkdown ? '`[^`\n]+`' : '<code[\\s\\S]*?</code>');
	}
	return input.split(new RegExp('(' + matchers.join('|') + ')', 'gm'));
};


SocketPlugins.giphy.search = function(socket, data, callback) {
	winston.info('data:', data);
	var url = 'https://api.giphy.com/v1/gifs/search?api_key=dc6zaTOxFJmzC&limit=2&q=' + data.query;
	winston.info('query:', url);
	request.get(url, function(error, res, body) {
		if (error) {
			winston.error(error);
			return callback(error);
		}
		var links = [];
		if (res.statusCode == 200) {
			winston.info('sending image links:', JSON.parse(body)['data']);
			// if (!body.data) return;
			links = JSON.parse(body).data.map(function(record) {
				return '<img src=' + record.images.fixed_width_small.url + ' original=' + record.images.original.url +
				' term=' + data.query + '>';
				// return record.images.fixed_width_small.url;
			})
			winston.info('links:', links);
		}
		return callback(null, links);
	});
	// winston.info('sending image links');
	// callback(null, ['image1.gif', 'image2.gif']);
}

module.exports = Giphy;
