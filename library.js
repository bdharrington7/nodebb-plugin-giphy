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
    parseMode: 'markdown'
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
    winston.warn(ns + 'API key is still set to the public one, this may cause problems in production')
  }
  Giphy.init()
  callback()
}

Giphy.init = function () {
  apiUrl = 'https://api.giphy.com/v1/gifs/search?api_key=' + settings.get('strings.apiKey')

  if (settings.get('strings.limit')) {
    apiUrl += '&limit=' + settings.get('strings.limit')
  }
  apiUrl += '&q='
}

Giphy.parsePost = function (data, callback) {
  if (!data || !data.postData || !data.postData.content) {
    return callback(null, data)
  }

  Giphy.parseRaw(data.postData.content, function (err, content) {
    if (err) {
      return callback(err)
    }

    data.postData.content = content
    callback(null, data)
  })
}

Giphy.parseRaw = function (content, callback) {
  return callback(null, content)
}

SocketPlugins.giphy.search = function (socket, data, callback) {
  winston.info('data:', data)
  var url = apiUrl + data.query
  if (debug) {
    winston.info('query:', url)
  }
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
        return '<img src=' + record.images.fixed_width_small.url + ' original=' + record.images.original.url +
        ' term=' + data.query + '>'
      })
      winston.info('links:', links)
    }
    return callback(null, links)
  })
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

SocketAdmin.settings.syncGiphy = function (data) {
  if (debug) {
    winston.info(ns + 'Syncing settings')
  }
  settings.sync(Giphy.init)
}

module.exports = Giphy
