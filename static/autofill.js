/* globals socket $:false */
'use strict'

$(document).ready(function () {
  $(window).on('composer:autocomplete:init', function (ev, data) {
    var strategy = {
      match: /\B&([^\s\n]+[^\n]+)$/,
      search: function (term, callback) {
        if (!term || term.length < 2) {
          return callback([])
        }

        socket.emit('plugins.giphy.search', {query: term}, function (err, links) {
          if (err) {
            return callback([])
          }

          callback(links)
        })
        // for testing
        // links = ['image1.jpg', 'image2.jpg']
        // callback(links)
      },
      index: 1,
      replace: function (selected) {
        var ele = $.parseHTML(selected)
        var orig = $(ele).attr('original')
        var term = $(ele).attr('term')
        var render = $(ele).attr('render')
        switch (render) {
          case 'html':
            return '<img src="' + orig + '" alt="' + term + '" title="' + term + '> '
          case 'bbcode':
            return '[img alt="' + term + '" title="' + term + '"]' + orig + '[/img] '
          default: // markdown
            return '![' + term + '](' + orig + ') '
        }
      },
      cache: true
    }

    data.strategies.push(strategy)
    data.options.footer = '<img src="/plugins/nodebb-plugin-giphy/static/giphy_badge.gif" width=100>'
    data.options.debounce = 300
  })

  $(window).on('action:composer.loaded', function (e, data) {
    var composer = $('#cmp-uuid-' + data.post_uuid + ' .write')
    composer.attr('data-giphy', '1')
  })
})
