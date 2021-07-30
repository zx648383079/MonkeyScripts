// ==UserScript==
// @name            题库抓取
// @namespace       https://zodream.cn/
// @version         0.1
// @description     题库抓取
// @author          ZoDream
// @include         https://www.jiakaobaodian.com/*
// @include         http://tiku.21cnjy.com/*
// @include         https://www.zujuan.com/*
// @include         http://tiku.zujuan.com/*
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
                        data.image = image;
                    }
                    if (isJudge) {
                        data.type = 2;
                        data.answer = answer;
                    }
                    else {
                        data.option_items = items;
                        data.type = rightCount > 1 ? 1 : 0;
                    }
                    var next = $('.com-shiti-xiangjie');
                    if (next.length < 1) {
                        return data;
                    }
                    data.easiness = parseInt(next.find('.star-w-s .bfb').attr('style').replace(/\D+/g, '')) / 10 - 1;
                    data.analysis_items = [
                        { content: next.find('.xiangjie .content').text() }
                    ];
                    return data;
                },
                'tiku.21cnjy.com': function () {
                    Cookies.set('is_scan', 1);
                    var box = $('.answer_detail');
                    var title = box.find('dt p').text().trim().replace(/^\d+\/\d+、/, '');
                    var items = [];
                    var next = box.find('dd p');
                    var rightOrder = next.eq(0).find('i').text();
                    var rightCount = 0;
                    box.find('dt tr').each(function (i, item) {
                        var ele = $(item);
                        var text = ele.text().trim();
                        var option = text.replace(/^[A-Z]./, '').trim();
                        var isRight = rightOrder.indexOf(text.substr(0, 1)) >= 0;
                        if (isRight) {
                            rightCount++;
                        }
                        items.push({
                            content: option,
                            is_right: isRight
                        });
                    });
                    var data = { title: title };
                    data.option_items = items;
                    data.type = rightCount > 1 ? 1 : 0;
                    if (next.length < 2) {
                        return data;
                    }
                    data.analysis_items = [
                        { content: next.eq(1).find('i').text().trim() }
                    ];
                    return data;
                },
                'zujuan.com': {
                    match: /zujuan\.com$/,
                    done: function () {
                        Cookies.set('is_scan', 1);
                        // const box = $('#J_question_detail');
                        // const title = box.find('.q-tit').text().trim().replace(/^\d+\/\d+、/,  '');
                        // const items = [];
                        // const next = box.find('.q-analyize');
                        // const rightOrder = next.eq(0).find('i').text();
                        // let rightCount = 0;
                        // box.find('.exam-s .op-item').each((i: number, item: HTMLDivElement) => {
                        //     const ele = $(item);
                        //     const text = ele.text().trim();
                        //     let option = text.replace(/^[A-Z]./, '').trim();
                        //     const isRight = rightOrder.indexOf(text.substr(0, 1)) >= 0;
                        //     if (isRight) {
                        //         rightCount ++;
                        //     }
                        //     items.push({
                        //         content: option,
                        //         is_right: isRight
                        //     });
                        // });
                        // let data: IQuestion = {title};
                        // data.option_items = items;
                        // data.type = rightCount > 1 ? 1 : 0;
                        // if (next.length < 2) {
                        //     return data;
                        // }
                        // data.analysis_items = [
                        //     {content: next.eq(1).find('i').text().trim()}
                        // ];
                        // return data;
                    }
                }
            };
            this.start();
        }
        Exam.prototype.findRuleFn = function (host) {
            if (Object.prototype.hasOwnProperty.call(this.rules, host)) {
                return typeof this.rules[host] === 'object' ? this.rules[host].done : this.rules[host];
            }
            for (var key in this.rules) {
                if (Object.prototype.hasOwnProperty.call(this.rules, key)) {
                    var element = this.rules[key];
                    if (typeof element !== 'object') {
                        continue;
                    }
                    if (element.match.test(host)) {
                        return element.done;
                    }
                }
            }
            return;
        };
        Exam.prototype.start = function () {
            var fn = this.findRuleFn(window.location.host);
            if (!fn) {
                return;
            }
            var info = fn();
            if (!info) {
                return;
            }
            this.save(info);
        };
        Exam.prototype.save = function (data) {
            data.course_id = 5;
            console.log(data);
            GM_xmlhttpRequest({
                url: 'http://zodream.localhost/open/exam/admin/question/save?appid=11625319133',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    Authorization: 'Bearer 01648ce0919cd302da58ade6bbd509f6',
                },
                data: JSON.stringify(data),
                onload: function (res) {
                    console.log(res);
                    if (res.status === 200) {
                        alert('导入成功');
                        return;
                    }
                    var repsone = JSON.parse(res.responseText);
                    alert(repsone && repsone.message ? repsone.message : '导入失败');
                }
            });
        };
        return Exam;
    }());
    new Exam();
})();
