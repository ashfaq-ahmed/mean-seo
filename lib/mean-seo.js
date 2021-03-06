'use strict';

/*!
 * MEAN - SEO
 * Ported from https://github.com/meanjs/mean-seo
 * MIT Licensed
 */

/**
 * Module dependencies.
 */
var _ = require('lodash'),
	browser = require('./browser'),
	Cache = require('./cache');

/**
 * Module default options
 */
var defaultOptions = {
	cacheClient: 'disk',
	cacheDuration: 2 * 60 * 60 * 24 * 1000,
	cacheFolder: __dirname + '/../tmp/mean-seo/cache'
};

/**
 * SEO:
 *
 * Renders static pages for crawlers
 *
 * @param {Object} options
 * @return {Function}
 * @api public
 */
module.exports = function SEO(options) {
	//Initialize local variables
	options = _.merge(defaultOptions, options || {});
	var cache = new Cache(options);

	return function SEO(req, res, next) {

		var escapedFragment = req.query._escaped_fragment_;

		//If the request came from a crawler
		if (req.itsABot) {
      var url;

			// If the request is in HTML5 pushstate style.
			url = req.protocol + '://' + req.get('host') + req.originalUrl;

			cache.get(url, function(err, page) {
				if (err) {
					//If not in cache crawl page
					browser.crawl(url, 200 * 1024, function(err, html) {
						if (err) {
							next(err);
						} else {
							//Save page to cache
							cache.set(url, html, function(err, res) {
								if (err) {
									next(err);
								}
							});

							//And output the result
							res.send(html);
						}
					});
				} else {
					//If page was found in cache, output the result
					res.send(page.content);
				}
			});
		} else {
			next();
		}
	};
};
