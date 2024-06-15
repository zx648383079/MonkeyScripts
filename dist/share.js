// ==UserScript==
// @name            分享到微博
// @namespace       https://zodream.cn/
// @version         0.1
// @description     分享到微博，并点评
// @author          ZoDream
// @match           https://www.ithome.com/*
// @match           https://news.ifeng.com/*
// @match           https://www.msn.cn/*/news/*
// @require         https://code.jquery.com/jquery-2.1.4.min.js
// @run-at          context-menu
// ==/UserScript==
(function () {
    'use strict';
    var Share = /** @class */ (function () {
        function Share() {
            this.options = {
                appid: '11619240710',
                baseUrl: 'http://localhost:4200/frontend/micro/share',
            };
            this.handleMap = {
                'www.ithome.com': function () {
                    var box = $(".content");
                    var title = box.find("h1").text().trim();
                    var main = box.find('.post_content');
                    var summary = main.text().trim().substr(0, 88) + '...';
                    var pics = [];
                    main.find('img').each(function () {
                        var $this = $(this);
                        if ($this.width() < 100) {
                            return;
                        }
                        pics.push($this.attr('data-original') || $this.attr('src'));
                    });
                    return {
                        title: title,
                        summary: summary,
                        pics: pics,
                    };
                },
                'news.ifeng.com': function () {
                    var box = $('div[class^="content"]');
                    var title = box.find("h1").text().trim();
                    var main = box.find('div[class^="main_content"]');
                    var summary = main.text().trim().substr(0, 88) + '...';
                    var pics = [];
                    main.find('img').each(function () {
                        var $this = $(this);
                        if ($this.width() < 100) {
                            return;
                        }
                        pics.push($this.attr('data-original') || $this.attr('src'));
                    });
                    return {
                        title: title,
                        summary: summary,
                        pics: pics,
                    };
                },
                'www.msn.cn': function () {
                    var title = $('#precontent').find("h1").text().trim();
                    var main = $('#maincontent article');
                    var summary = main.text().trim().substr(0, 88) + '...';
                    var pics = [];
                    main.find('img').each(function () {
                        var $this = $(this);
                        if ($this.width() < 100) {
                            return;
                        }
                        var imgJson = JSON.parse($this.attr('data-src'));
                        pics.push(imgJson ? imgJson.default.src : $this.attr('src'));
                    });
                    return {
                        title: title,
                        summary: summary,
                        pics: pics,
                    };
                }
            };
            this.start();
        }
        Share.prototype.start = function () {
            var host = window.location.host.toLowerCase();
            if (!Object.prototype.hasOwnProperty.call(this.handleMap, host)) {
                return;
            }
            var cb = this.handleMap[host];
            var data = cb();
            data.appid = this.options.appid;
            data.url = window.location.href;
            if (data.pics && typeof data.pics === 'object' && data.pics.length < 2) {
                data.pics = data.pics[0];
            }
            window.open(this.uriEncode(this.options.baseUrl, data), '_blank');
        };
        Share.prototype.uriEncode = function (path, obj, unEncodeURI) {
            if (obj === void 0) { obj = {}; }
            var result = [];
            var pushQuery = function (key, value) {
                if (typeof value !== 'object') {
                    result.push(key + '=' + (unEncodeURI ? value : encodeURIComponent(value)));
                    return;
                }
                if (value instanceof Array) {
                    value.forEach(function (v) {
                        pushQuery(key + '[]', v);
                    });
                    return;
                }
                $.each(value, function (v, k) {
                    pushQuery(key + '[' + k + ']', v);
                });
            };
            for (var name_1 in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, name_1)) {
                    pushQuery(name_1, obj[name_1]);
                }
            }
            if (result.length < 1) {
                return path;
            }
            return path + (path.indexOf('?') > 0 ? '&' : '?') + result.join('&');
        };
        return Share;
    }());
    new Share();
})();
