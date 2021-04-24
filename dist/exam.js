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
                    var title = box.find('.timu-text').text().trim().replace(/^\d+\/\d+、/, '');
                    var image = box.find('.media-w img').attr('src');
                    var items = [];
                    var isJudge = true;
                    var answer = false;
                    var rightCount = 0;
                    box.find('.options-w p').each(function (i, item) {
                        var ele = $(item);
                        var option = ele.text().trim().replace(/^[A-Z]、/, '').trim();
                        if (['正确', '错误'].indexOf(option) < 0) {
                            isJudge = false;
                        }
                        var isRight = ele.hasClass('success');
                        if (option === '正确' && isRight) {
                            answer = true;
                        }
                        if (isRight) {
                            rightCount++;
                        }
                        items.push({
                            content: option,
                            is_right: isRight
                        });
                    });
                    var data = { title: title };
                    if (image) {
                        data['image'] = image;
                    }
                    if (isJudge) {
                        data['type'] = 2;
                        data['answer'] = answer;
                    }
                    else {
                        data['option'] = items;
                        data['type'] = rightCount > 1 ? 1 : 0;
                    }
                    var next = $('.com-shiti-xiangjie');
                    if (next.length < 1) {
                        return data;
                    }
                    data['easiness'] = parseInt(next.find('.star-w-s .bfb').attr('style').replace(/\D+/g, '')) / 10 - 1;
                    data['analysis'] = next.find('.xiangjie .content').text();
                    return data;
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
            this.save(info);
        };
        Exam.prototype.save = function (data) {
            data['course_id'] = 5;
            GM_xmlhttpRequest({
                url: 'http://zodream.localhost/exam/admin/question/import',
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
                        return;
                    }
                    alert(repsone && repsone.errors ? repsone.errors : '导入失败');
                }
            });
        };
        return Exam;
    }());
    new Exam();
})();
