/* global env:false */

'use strict'

var winston = module.parent.require('winston')
var Settings = module.parent.require('./settings')
var request = require('request')

var SocketPlugins = module.parent.require('./socket.io/plugins')
var SocketAdmin = module.parent.require('./socket.io/admin')

SocketPlugins.giphy = {}

var Giphy = {}
var ns = '[plugins/Giphy] '
var debug
var apiUrl

var constants = Object.freeze({
  'name': 'Giphy',
  'admin': {
    'route': '/plugins/giphy',
    'icon': 'fa-th-large',
    'name': 'Giphy'
  },
  'namespace': 'nodebb-plugin-giphy'
})

var defaultSettings = {
  strings: {
    apiKey: 'dc6zaTOxFJmzC',
    limit: '3',
    render: 'markdown',
    rating: '(none)'
  }
}

var settings = new Settings('giphy', '0.0.1', defaultSettings, function () {
  if (debug) {
    winston.info(ns + 'Settings loaded')
  }
})

Giphy.onLoad = function (params, callback) {
  debug = env === 'development'
  function render (req, res, next) {
    res.render('admin/plugins/giphy')
  }

  params.router.get('/admin/plugins/giphy', params.middleware.admin.buildHeader, render)
  params.router.get('/api/admin/plugins/giphy', render)
  winston.info(ns + 'Initializing with API key:', settings.get('strings.apiKey'))
  if (settings.get('strings.apiKey') === defaultSettings.strings.apiKey) {
    winston.warn(ns + 'API key is still set to the public beta key')
  }
  Giphy.init()
  callback()
}

Giphy.init = function () {
  apiUrl = 'https://api.giphy.com/v1/gifs/search?api_key=' + settings.get('strings.apiKey')

  if (settings.get('strings.limit')) {
    apiUrl += '&limit=' + settings.get('strings.limit')
  }
  var rating = settings.get('strings.rating')
  if (rating && rating !== '(none)') {
    apiUrl += '&rating=' + rating
  }
  apiUrl += '&q='
}

SocketPlugins.giphy.search = function (socket, data, callback) {
  var url = apiUrl + encodeURIComponent(data.query)
  if (debug) {
    winston.info('query:', url)
  }
  // for testing
  // var links = [{src: 'img1', orig: 'img1orig'}, {src: 'img1', orig: 'img1orig'}].map(function (record) {
  //   return createImgTag(record.src, record.orig, data.query, settings.get('strings.render'))
  // })
  // callback(null, links)
  // return
  // end testing

  request.get(url, function (error, res, body) {
    if (error) {
      winston.error(ns + error)
      return callback(error)
    }
    var links = []
    if (res.statusCode === 200) {
      if (debug) {
        winston.info('sending image links:', JSON.parse(body)['data'])
      }
      links = JSON.parse(body).data.map(function (record) {
        return createImgTag(record.images.fixed_width_small.url, record.images.original.url, data.query,
          settings.get('strings.render'))
      })
      if (debug) {
        winston.info('links:', links)
      }
    }
    return callback(null, links)
  })
}

var createImgTag = function (smallUrl, originalUrl, term, render) {
  return '<img src="' + smallUrl + '" original="' + originalUrl + '" term="' + term + '" render="' + render + '">'
}

/* Admin functions */

Giphy.admin = {
  menu: function (custom_header, callback) {
    custom_header.plugins.push({
      'route': constants.admin.route,
      'icon': constants.admin.icon,
      'name': constants.admin.name
    })
    callback(null, custom_header)
  }
}

SocketAdmin.settings.syncGiphy = function (data, cb) {
  if (debug) {
    winston.info(ns + 'Syncing settings')
  }
  settings.sync(function (err) {
    Giphy.init()
    cb(err)
  })
}

module.exports = Giphy
