// ==UserScript==
// @name            百度文库下载
// @namespace       https://zodream.cn/
// @version         0.1
// @description     百度文库下载
// @author          ZoDream
// @match           https://wenku.baidu.com/*
// @grant           GM_openInTab
// @run-at          context-menu
// ==/UserScript==
(function () {
    'use strict';
    var BaiduWenKu = /** @class */ (function () {
        /**
         *
         */
        function BaiduWenKu() {
            var wenkuUrl = 'http://www.tool77.com/tampermonkey/doc/download?wenku_url=' + encodeURIComponent(window.location.href);
            GM_openInTab(wenkuUrl, { active: true });
        }
        return BaiduWenKu;
    }());
    new BaiduWenKu();
})();
