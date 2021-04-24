import { Transform } from "readable-stream";
import * as vinyl from "vinyl";

interface UserScriptOption {
    [key: string]: any;
    /**
     * The name of the script.
     */
    name: string|any;

    /**
     * 命名空间，如果为 https:// 开头将作为插件的主页
     */
    namespace: string;

    /**
     * 脚本的版本
     */
    version: string| number;

    /**
     * 脚本的作者
     */
    author: string;

    /**
     * 脚本介绍
     */
    description: string| any;

    /**
     * 插件的主页官网
     */
    homepage?: string;

    /**
     * 图标
     */
    icon?: string;

    con64?: string;

    updateURL?: string;

    downloadURL?: string;

    supportURL?: string;

    /**
     * 支持哪些网址
     */
    include?: string|string[];

    match?: string|string[];

    /**
     * 排除哪些网址
     */
    exclude?: string|string[];

    /**
     * 加载引用其他脚本样式
     */
    require?: string|string[];

    /**
     * 预加载可通过GM_getResourceURL访问的资源，并由脚本GM_getResourceText。
     */
    resource?: {[key: string]: string};

    /**
     * GM_xmlhttpRequest检索的子域
     */
    connect?: string|string[];

    /**
     * 定义注入脚本的瞬
     */
    "run-at"?: "document-start" | "document-body" | "document-end" | "document-idle" | "context-menu";

    /**
     * 用于将GM_* 函数、不安全的 Window 对象和一些功能强大的窗口函数列入白名单
     */
    grant?: string| string[];

    /**
     * 此标记使脚本在主页上运行，但不是在 iframe 上运行。
     */
    noframes?: boolean;

    unwrap?: boolean;

    nocompat?: string;
}

/**
 * 定义脚本的声明
 */
export declare function UserScript(options: UserScriptOption): ClassDecorator;

/**
 * Adds the given style to the document and returns the injected style element.
 * @param css 
 */
export declare function GM_addStyle(css: string): void;

/**
 * Deletes 'name' from storage.
 * @param name 
 */
export declare function GM_deleteValue(name: string): void;
/**
 * List all names of the storage.
 */
export declare function GM_listValues(): any;

export declare function GM_addValueChangeListener(name: string, cb: (name: string, old_value: any, new_value: any, remote: any) => void): number;

export declare function GM_removeValueChangeListener(listener_id: number): void;
export declare function GM_setValue(name: string, value: any): void;
export declare function GM_getValue(name: string, defaultValue?: any): void;
export declare function GM_log(message: any): void;
export declare function GM_getResourceText(name: string): string;
export declare function GM_getResourceURL(name: string): string;
export declare function GM_registerMenuCommand(name: string, fn: Function, accessKey: string): number;

export declare function GM_unregisterMenuCommand(menuCmdId: number):void;

export declare interface OpenTabOption {
    active?: boolean;
    insert?: number;
    setParent?: any;
    incognito?: any;
}

export declare function GM_openInTab(url: string, options: OpenTabOption): void;
export declare function GM_openInTab(url: string, loadInBackground: boolean): void;

declare interface RequestOption {
    method: "GET" | "HEAD" | "POST";
    url: string;
    headers?: any;
    data?: string;
    cookie?: string;
    binary?: any;
    nocache?: boolean;
    revalidate?: any;
    timeout?: number;
    context?: any;
    responseType?: "arraybuffer" | "blob" | "json";
    overrideMimeType?: string;
    anonymous?: boolean;
    fetch?: any;
    username?: string;
    password?: string;
    onabort?: Function;
    onerror?: Function;
    onloadstart?: Function;
    onprogress?: Function;
    onreadystatechange?: Function;
    ontimeout?: Function;
    onload?: Function;
}

export declare function GM_xmlhttpRequest(details: RequestOption): void;

declare interface DownloadOption {
    url: string;
    name: string;
    headers?: any;
    saveAs?: boolean;
    onerror?: Function;
    onload?: Function;
    onprogress?: Function;
    ontimeout?: Function;
}

export declare function GM_download(details: DownloadOption): void;

export declare function GM_download(url: string, name: string): void;
export declare function GM_getTab(callback: any): void;
export declare function GM_saveTab(tab: any): void;
export declare function GM_getTabs(callback: any): void;

declare interface NotificationOption {
    text: string;
    title: string;
    image: string;
    highlight: boolean;
    silent: boolean;
    timeout: number;
    ondone: Function;
    onclick: Function;
}

export declare function GM_notification(details: NotificationOption, ondone: Function): void;
export declare function GM_notification(text: string, title: string, image: string, onclick: Function): void;

export declare interface ClipboardOption {
    type: "text" | "html";
    mimetype: string;
}

export declare function GM_setClipboard(data: any, info: ClipboardOption | "text" | "html"): void;
export declare function GM_info(): any;

function each(data: any, cb: (item: any, key: string| number) => boolean| void) {
    if (typeof data !== 'object') {
        return cb(data, 0);
    }
    if (data instanceof Array) {
        for (let i = 0; i < data.length; i++) {
            if (cb(data[i], i) === false) {
                return;
            }
        }
        return;
    }
    for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
            if (cb(data[key], key) === false) {
                return;
            }
        }
    }
}

/**
 * 生成模块
 */
 export default function template() {
    return new Transform({
        objectMode: true,
        transform(file: vinyl, _: any, callback: Function) {
            if (file.isNull()) {
                return callback();
            }
            if (!file.isBuffer()) {
                return callback();
            }
            let str = String(file.contents);
            let match = str.match(/(@UserScript(\([\s\S]+?\))\s*)class\s+(\S+)/);
            if (!match) {
                return callback(null, file);
            }
            const options = eval(match[2].trim());
            const lines = ['// ==UserScript=='];
            each(options, (items: any, key: string) => {
                if (typeof items === 'boolean') {
                    if (items) {
                        lines.push('// @' + key);
                    }
                    return;
                }
                if (typeof items !== 'object') {
                    lines.push('// @' + key + new Array(17 - key.length).join(' ') + items);
                    return;
                }
                if (items instanceof Array) {
                    const prefix = '// @' + key + new Array(17 - key.length).join(' ');
                    items.forEach(item => {
                        lines.push(prefix + item);
                    })
                    return;
                }
                each(items, (item: string, i: string) => {
                    if (key === 'name' || key === 'description') {
                        const name = key + (i.trim().length > 0 ? ':' + i : '');
                        lines.push('// @' + name + new Array(17 - name.length).join(' ') + item);
                        return;
                    }
                    lines.push('// @' + name + ' ' + i + ' ' + item);
                });
            });
            lines.push('// ==/UserScript==');
            lines.push('');
            lines.push('(function() {');
            lines.push("    'use strict';");

            str.replace(match[1], '').replace(/import.+?from\s+.+?["'];/, '').split("\n").forEach(line => {
                lines.push('    ' + line);
            });
            lines.push('    new ' + match[3].trim() +'();');
            lines.push('})();');
            file.contents = Buffer.from(lines.join("\n"));
            return callback(null, file);
        }
    });
};