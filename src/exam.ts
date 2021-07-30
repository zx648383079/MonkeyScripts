import { UserScript, GM_xmlhttpRequest } from "./core/monkey";

interface IQuestion {
    title: string;
    image?: string;
    type?: 0|1|2|3|4;
    answer?: string|boolean;
    option_items?: {
        content: string;
        is_right?: boolean;
    }[];
    easiness?: number;
    analysis_items?: {
        content: string;
        type?: number;
    }[];
    course_id?: number;
}

type RuleDone = () => any;

interface IRuleMap {
    [host: string]: RuleDone | {
        match: RegExp,
        done: RuleDone
    };
}

declare var Cookies: any;

@UserScript({
    name: "题库抓取",
    namespace: "https://zodream.cn/",
    version: "0.1",
    description: "题库抓取",
    author: "ZoDream",
    include: [
        "https://www.jiakaobaodian.com/*",
        "http://tiku.21cnjy.com/*",
        "https://www.zujuan.com/*",
        "http://tiku.zujuan.com/*",
    ],
    require: "https://code.jquery.com/jquery-2.1.4.min.js",
    grant: "GM_xmlhttpRequest",
    "run-at": "context-menu"
})
class Exam {
    
    constructor() {
        this.start();
    }

    private rules: IRuleMap = {
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
            let data: IQuestion = {title};
            if (image) {
                data.image = image;
            }
            if (isJudge) {
                data.type = 2;
                data.answer = answer;
            } else {
                data.option_items = items;
                data.type = rightCount > 1 ? 1 : 0;
            }
            const next = $('.com-shiti-xiangjie');
            if (next.length < 1) {
                return data;
            }
            data.easiness = parseInt(next.find('.star-w-s .bfb').attr('style').replace(/\D+/g, '')) / 10 - 1;
            data.analysis_items = [
                {content: next.find('.xiangjie .content').text()}
            ];
            return data;
        },
        'tiku.21cnjy.com': function() {
            Cookies.set('is_scan', 1);
            const box = $('.answer_detail');
            const title = box.find('dt p').text().trim().replace(/^\d+\/\d+、/,  '');
            const items = [];
            const next = box.find('dd p');
            const rightOrder = next.eq(0).find('i').text();
            let rightCount = 0;
            box.find('dt tr').each((i: number, item: HTMLDivElement) => {
                const ele = $(item);
                const text = ele.text().trim();
                let option = text.replace(/^[A-Z]./, '').trim();
                const isRight = rightOrder.indexOf(text.substr(0, 1)) >= 0;
                if (isRight) {
                    rightCount ++;
                }
                items.push({
                    content: option,
                    is_right: isRight
                });
            });
            let data: IQuestion = {title};
            data.option_items = items;
            data.type = rightCount > 1 ? 1 : 0;
            if (next.length < 2) {
                return data;
            }
            data.analysis_items = [
                {content: next.eq(1).find('i').text().trim()}
            ];
            return data;
        },
        'zujuan.com': {
            match: /zujuan\.com$/,
            done: function() {
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

    private findRuleFn(host: string): RuleDone | undefined  {
        if (Object.prototype.hasOwnProperty.call(this.rules, host)) {
            return typeof this.rules[host] === 'object' ? (this.rules[host] as any).done : this.rules[host];
        }
        for (const key in this.rules) {
            if (Object.prototype.hasOwnProperty.call(this.rules, key)) {
                const element = this.rules[key];
                if (typeof element !== 'object') {
                    continue;
                }
                if (element.match.test(host)) {
                    return element.done;
                }
            }
        }
        return;
    }

    public start() {
        const fn = this.findRuleFn(window.location.host);
        if (!fn) {
            return;
        }
        let info: IQuestion|null = fn();
        if (!info) {
            return;
        }
        this.save(info);
    }

    
    public save(data: IQuestion) {
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
                const repsone = JSON.parse(res.responseText);
                alert(repsone && repsone.message ? repsone.message : '导入失败');
            }
        })
    }
}