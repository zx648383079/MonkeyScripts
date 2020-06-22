// ==UserScript==
// @name            题库抓取
// @namespace       https://zodream.cn/
// @version         0.1
// @description     题库抓取
// @author          ZoDream
// @include         https://www.jiakaobaodian.com/*
// @require         https://code.jquery.com/jquery-2.1.4.min.js
// @grant           GM_xmlhttpRequest
// @run-at          context-menu
// ==/UserScript==
(function () {
    'use strict';
    var Exam = /** @class */ (function () {
        function Exam() {
            this.rules = {
                'www.jiakaobaodian.com': function () {
                    var box = $('#ComQuestionDetail_qundefined');
                    var name = box.find('.timu-text').text();
                    var items = [];
                    box.find('.options-w p').each(function (i, item) {
                        items.push(item.innerText);
                    });
                    return { name: name, items: items };
                }
            };
            this.start();
        }
        Exam.prototype.start = function () {
            var info = null;
            switch (window.location.host) {
                default:
                    var cb = this.rules[window.location.host];
                    info = cb.call(this);
                    break;
            }
            if (!info) {
                return;
            }
            console.log(info);
            //this.save(info);
        };
        Exam.prototype.save = function (data) {
            GM_xmlhttpRequest({
                url: 'http://zodream.localhost/exam/admin/goods/import',
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
        return Exam;
    }());
    new Exam();
})();
