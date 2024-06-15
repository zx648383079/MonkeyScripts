// ==UserScript==
// @name            商品信息抓取
// @namespace       https://zodream.cn/
// @version         0.1
// @description     商品信息抓取
// @author          ZoDream
// @match           https://item.jd.com/*
// @match           https://detail.tmall.com/*
// @match           https://item.taobao.com/*
// @require         https://code.jquery.com/jquery-2.1.4.min.js
// @grant           GM_xmlhttpRequest
// @run-at          context-menu
// ==/UserScript==
(function () {
    'use strict';
    var Spider = /** @class */ (function () {
        function Spider() {
            this.start();
        }
        Spider.prototype.start = function () {
            var info = null;
            switch (window.location.host) {
                case 'item.jd.com':
                    info = this.getJdGoods();
                    break;
                case 'detail.tmall.com':
                    info = this.getJdGoods();
                    break;
                case 'item.taobao.com':
                    info = this.getJdGoods();
                    break;
                default:
                    break;
            }
            if (!info) {
                return;
            }
            this.saveGoods(info);
        };
        Spider.prototype.saveGoods = function (data) {
            GM_xmlhttpRequest({
                url: 'http://zodream.localhost/shop/admin/goods/import',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                data: JSON.stringify(data),
                onload: function (res) {
                    console.log(res);
                    var repsone = JSON.parse(res.responseText);
                    if (repsone && repsone.code == 200) {
                        alert('导入成功');
                    }
                }
            });
        };
        Spider.prototype.getJdGoods = function () {
            var id = window.location.pathname.replace('/', '').replace(/\..+$/, '');
            var title = $('.sku-name').text().trim();
            var description = $('.news').text().trim();
            var price = $('.p-price .price').text().split('-')[0];
            $('#J-detail-content .ssd-module').each(function () {
                var module = $(this);
                module.css('background-image', module.css('background-image'));
            });
            var content = $('#J-detail-content').html();
            var thumb = $('#spec-img').attr('src');
            var images = [];
            $('#spec-list li img').each(function (i, item) {
                images.push(item.src);
            });
            var attrs = [];
            $('#choose-attrs .p-choose').each(function (i, item) {
                var name = $('.dt', item).text().trim();
                if (!name) {
                    return;
                }
                var items = [];
                $('.item a', item).each(function (j, span) {
                    items.push(span.innerText);
                });
                attrs.push({ name: name, items: items });
            });
            var brand = $('#parameter-brand a').text();
            var properties = [];
            $('#detail .parameter2 li').each(function (i, item) {
                var args = item.innerText.split('：');
                if (args.length > 1) {
                    properties.push({ name: args[0], value: args[1] });
                }
            });
            var category = $('#crumb-wrap .first').text();
            return {
                id: id,
                sn: 'JD' + id,
                title: title,
                description: description,
                price: price,
                thumb: thumb,
                images: images,
                attrs: attrs,
                brand: brand,
                category: category,
                properties: properties,
                content: content
            };
        };
        return Spider;
    }());
    new Spider();
})();
