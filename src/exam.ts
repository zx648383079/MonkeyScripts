import { UserScript, GM_xmlhttpRequest } from "./core/monkey";

@UserScript({
    name: "题库抓取",
    namespace: "https://zodream.cn/",
    version: "0.1",
    description: "题库抓取",
    author: "ZoDream",
    include: [
        "https://www.jiakaobaodian.com/*",
    ],
    require: "https://code.jquery.com/jquery-2.1.4.min.js",
    grant: "GM_xmlhttpRequest",
    "run-at": "context-menu"
})
class Exam {
    
    constructor() {
        this.start();
    }

    private rules = {
        'www.jiakaobaodian.com': function() {
            const box = $('#ComQuestionDetail_qundefined');
            const title = box.find('.timu-text').text().trim().replace(/^\d+\/\d+、/,  '');
            const image = box.find('.media-w img').attr('src');
            const items = [];
            let isJudge = true;
            let answer = false;
            let rightCount = 0;
            box.find('.options-w p').each((i: number, item: HTMLDivElement) => {
                const ele = $(item);
                let option = ele.text().trim().replace(/^[A-Z]、/, '').trim();
                if (['正确', '错误'].indexOf(option) < 0) {
                    isJudge = false;
                }
                const isRight = ele.hasClass('success');
                if (option === '正确' && isRight) {
                    answer = true;
                }
                if (isRight) {
                    rightCount ++;
                }
                items.push({
                    content: option,
                    is_right: isRight
                });
            });
            let data = {title};
            if (image) {
                data['image'] = image;
            }
            if (isJudge) {
                data['type'] = 2;
                data['answer'] = answer;
            } else {
                data['option'] = items;
                data['type'] = rightCount > 1 ? 1 : 0;
            }
            const next = $('.com-shiti-xiangjie');
            if (next.length < 1) {
                return data;
            }
            data['easiness'] = parseInt(next.find('.star-w-s .bfb').attr('style').replace(/\D+/g, '')) / 10 - 1;
            data['analysis'] = next.find('.xiangjie .content').text();
            return data;
        }
    };

    public start() {
        let info = null;
        switch (window.location.host) {
            default:
                const cb = this.rules[window.location.host];
                info = cb.call(this);
                break;
        }
        if (!info) {
            return;
        }
        this.save(info);
    }

    
    public save(data: any) {
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
        })
    }
}