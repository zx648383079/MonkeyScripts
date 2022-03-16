import { UserScript, GM_xmlhttpRequest, GM_download } from "./core/monkey";

@UserScript({
    name: {
        '': "WeChat News Download",
        'zh-CN': '微信公众号推文图片一键下载'
    },
    namespace: "https://zodream.cn/",
    version: "0.1",
    description: "一键下载微信公众号推文内的图片到本地保存",
    author: "ZoDream",
    include: [
        "https://mp.weixin.qq.com/*",
    ],
    require: "https://cdnjs.cloudflare.com/ajax/libs/jquery/3.5.1/jquery.min.js",
    grant: [
        "GM_xmlhttpRequest",
        'GM_download'
    ],
    "run-at": "context-menu"
})
class WxNews {
    
    constructor() {
        this.start();
    }

    public start() {
        let i = 0;
        $('#page-content img').each((i: number, ele: HTMLImageElement) => {
            const img = $(ele);
            this.save(img.attr('data-src') || img.attr('src'), 'wx_img_' + (++i));
        })
    }

    public getExt(src: string) {
        if (src.indexOf('wx_fmt=gif') > 0 || src.indexOf('mmbiz_gif') > 0) {
            return '.gif';
        }
        if (src.indexOf('wx_fmt=png') > 0 || src.indexOf('mmbiz_png') > 0) {
            return '.png';
        }
        if (src.indexOf('wx_fmt=bmp') > 0 || src.indexOf('mmbiz_bmp') > 0) {
            return '.bmp';
        }
        return '.jpg';
    }

    
    public save(src: string, name: string) {
        var ext = this.getExt(src);
        GM_download(src, name + ext);
        // GM_xmlhttpRequest({
        //     method: 'GET',
        //     url: src,
        //     responseType: 'blob',
        //     onload: function (xhr) {
        //         var blobURL = window.URL.createObjectURL(xhr.response);
        //         var a = document.createElement('a');
        //         a.href = blobURL;
        //         a.setAttribute('download', name + ext);
        //         a.click();
        //         window.URL.revokeObjectURL(blobURL);
        //     }
        // });
    }
}