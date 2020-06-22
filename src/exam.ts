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
            const name = box.find('.timu-text').text();
            const items = [];
            box.find('.options-w p').each((i: number, item: HTMLDivElement) => {
                items.push(item.innerText);
            });
            return {name, items};
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
        console.log(info);
        
        //this.save(info);
    }

    
    public save(data: any) {
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
        })
    }
}