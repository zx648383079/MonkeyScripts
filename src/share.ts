import { UserScript } from "./core/monkey";

@UserScript({
    name: "分享到微博",
    namespace: "https://zodream.cn/",
    version: "0.1",
    description: "分享到微博，并点评",
    author: "ZoDream",
    include: [
        "https://www.ithome.com/*",
        "https://news.ifeng.com/*",
    ],
    require: "https://code.jquery.com/jquery-2.1.4.min.js",
    "run-at": "context-menu"
})
class Share {

    constructor() {
        this.start();
    }

    public options = {
        appid: '11619240710',
        baseUrl: 'http://localhost:4200/frontend/micro/share',
    };

    public handleMap: {[host: string]: () => any} = {
        'www.ithome.com': () => {
            const box = $(".content")
            const title = box.find("h1").text().trim();
            const main = box.find('.post_content');
            const summary = main.text().trim().substr(0, 88) + '...';
            const pics: string[] = [];
            main.find('img').each(function() {
                const $this = $(this);
                if ($this.width() < 100) {
                    return;
                }
                pics.push($this.attr('data-original') || $this.attr('src'));
            });
            return {
                title,
                summary,
                pics,
            };
        },
        'news.ifeng.com': () => {
            const box = $('div[class^="content"]')
            const title = box.find("h1").text().trim();
            const main = box.find('div[class^="main_content"]');
            const summary = main.text().trim().substr(0, 88) + '...';
            const pics: string[] = [];
            main.find('img').each(function() {
                const $this = $(this);
                if ($this.width() < 100) {
                    return;
                }
                pics.push($this.attr('data-original') || $this.attr('src'));
            });
            return {
                title,
                summary,
                pics,
            };
        }
    };

    public start() {
        const host = window.location.host.toLowerCase();
        if (!Object.prototype.hasOwnProperty.call(this.handleMap, host)) {
            return;
        }
        const cb = this.handleMap[host];
        const data = cb();
        data.appid = this.options.appid;
        data.url = window.location.href;
        if (data.pics && typeof data.pics === 'object' && data.pics.length < 2) {
            data.pics = data.pics[0];
        }
        window.open(this.uriEncode(this.options.baseUrl, data), '_blank');
    }

    public uriEncode(path: string, obj: any = {}, unEncodeURI?: boolean): string {
        const result: string[] = [];
        const pushQuery = (key: string, value: any) => {
            if (typeof value !== 'object') {
                result.push(key + '=' + (unEncodeURI ? value : encodeURIComponent(value)));
                return;
            }
            if (value instanceof Array) {
                value.forEach(v => {
                    pushQuery(key + '[]', v);
                });
                return;
            }
            $.each(value, (v, k) => {
                pushQuery(key + '[' + k +']', v);
            });
        }
        for (const name in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, name)) {
                pushQuery(name, obj[name]);
            }
        }
        if (result.length < 1) {
            return path;
        }
        return path + (path.indexOf('?') > 0 ? '&' : '?') + result.join('&');
    }
}