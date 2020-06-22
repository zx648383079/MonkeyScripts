import { UserScript, GM_xmlhttpRequest } from "./core/monkey";

@UserScript({
    name: "商品信息抓取",
    namespace: "https://zodream.cn/",
    version: "0.1",
    description: "商品信息抓取",
    author: "ZoDream",
    include: [
        "https://item.jd.com/*",
        "https://detail.tmall.com/*",
        "https://item.taobao.com/*",
    ],
    require: "https://code.jquery.com/jquery-2.1.4.min.js",
    grant: "GM_xmlhttpRequest",
    "run-at": "context-menu"
})
class Spider {
    
    constructor() {
        this.start();
    }

    public start() {
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
    }

    
    public saveGoods(data: any) {
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
        })
    }

    public getJdGoods() {
        const id = window.location.pathname.replace('/', '').replace(/\..+$/, '');
        const title = $('.sku-name').text().trim();
        const description = $('.news').text().trim();
        const price = $('.p-price .price').text().split('-')[0];

        $('#J-detail-content .ssd-module').each(function () {
            const module = $(this);
            module.css('background-image', module.css('background-image'));
        });

        const content = $('#J-detail-content').html();

        const thumb = $('#spec-img').attr('src');
        const images = [];
        $('#spec-list li img').each((i: number, item: HTMLImageElement) => {
            images.push(item.src);
        });
        const attrs = [];
        $('#choose-attrs .p-choose').each((i, item) => {
            const name = $('.dt', item).text().trim();
            if (!name) {
                return;
            }
            const items: string[] = [];
            $('.item a', item).each((j: number, span: HTMLSpanElement) => {
                items.push(span.innerText);
            });
            attrs.push({name, items});
        });
        const brand = $('#parameter-brand a').text();
        const properties = [];
        $('#detail .parameter2 li').each((i, item: HTMLLIElement) => {
            var args = item.innerText.split('：');
            if (args.length > 1) {
                properties.push({name: args[0], value: args[1]});
            }
        });
        const category = $('#crumb-wrap .first').text();
        return {
            id,
            sn: 'JD' + id,
            title, 
            description, 
            price, 
            thumb, 
            images, 
            attrs, 
            brand, 
            category, 
            properties, 
            content
        };
    }
}