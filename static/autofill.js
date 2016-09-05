"use strict";
/* globals socket, app, utils */


$(document).ready(function() {

	$(window).on('composer:autocomplete:init', function(ev, data) {
		var subset;
		var strategy = {
			match: /\B&([^\s\n]*)?$/,
			search: function (term, callback) {
				if (!term || term.length < 2) {
					console.log('term is too short');
					return callback([]);
				}
				console.log('searching for', term);

				socket.emit('plugins.giphy.search', {query: term}, function(err, links) {
					if (err) {
						return callback([]);
					}

					// return an array of links

					callback(links);
				});
			},
			index: 1,
			replace: function (selected) {
				// console.log('selected:', selected)
				var ele = $.parseHTML(selected);
				var orig = $(ele).attr('original');
				return '![](' + orig + ') ';
			},
			cache: true
		};

		data.strategies.push(strategy);
	});

	$(window).on('action:composer.loaded', function(e, data) {
		var composer = $('#cmp-uuid-' + data.post_uuid + ' .write');
		composer.attr('data-giphy', '1');
	});
});
