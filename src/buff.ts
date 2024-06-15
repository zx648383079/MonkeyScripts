import { UserScript } from "./core/monkey";

@UserScript({
    name: "网易buff挂刀",
    namespace: "https://zodream.cn/",
    version: "0.1",
    description: "网易buff挂刀价格查询",
    author: "ZoDream",
    match: [
        "https://buff.163.com/goods/*",
    ],
    grant: "GM_openInTab",
    "run-at": "document-end"
})
class BuffTooler {
    constructor() {
        const target = document.querySelector('.detail-header .detail-summ .f_Strong');
        target.addEventListener('click', () => {
            const price = window.prompt('请输入Steam市场实时价格:');
            if (!price) {
                return;
            }
            this.steamPrice = this.parseNumber(price);
            this.updateItemPrice(document.querySelectorAll('.detail-tab-cont .t_Left .f_Strong'));
        });
        this.steamPrice = this.parseNumber(target.textContent);
        this.waitTdUpdate(this.updateItemPrice.bind(this));
    }

    private steamPrice: number = 0;
    private get steamIncome(): number {
        return this.steamPrice * .85;
    }

    private getIncomeScale(price: number|string) {
        if (!this.steamPrice) {
            return 0;
        }
        return (this.parseNumber(price) * 10 / this.steamIncome).toFixed(2);
    }

    private updateItemPrice(items: NodeListOf<Element>) {
        for (let i = 0; i < items.length; i++) {
            const element = items[i];
            this.appendTip(element, this.getIncomeScale(element.textContent));
        }
    }

    private waitTdUpdate(cb: (items: NodeListOf<Element>) => void) {
        const table = document.querySelector('.detail-tab-cont');
        const observer = new MutationObserver(() => {
            cb.call(this, table.querySelectorAll('.t_Left .f_Strong'));
        });
        observer.observe(table, {childList: true});
    }

    private parseNumber(val: any): number {
        if (!val) {
            return 0;
        }
        if (typeof val === 'number') {
            return val;
        }
        return parseFloat(val.match(/[\d\.]+/)[0]);
    }

    private appendTip(target: Node, val: any) {
        const cls = 'zre-tooltip';
        const next = target.nextSibling;
        if (next && next instanceof HTMLElement && next.classList.contains(cls)) {
            next.innerText = `收益率: ￥${val}`;
            return;
        }
        const tip = document.createElement('p');
        tip.classList.add(cls);
        tip.innerText = `收益率: ￥${val}`;
        this.insertAfter(target, tip);
    }

    /**
     * 在子节点最后添加元素
     * @param current 
     * @param items 
     */
    private insertLast(current: Node, items: Node[]) {
        for (const item of items) {
            current.appendChild(item);
        }
    }

    /**
     * 在元素之前添加兄弟节点
     * @param current 
     * @param items 
     */
    private insertBefore(current: Node, items: Node[]) {
        const parent = current.parentNode;
        for (const item of items) {
            parent.insertBefore(item, current);
        }
    }

    /**
     * 在元素之后添加兄弟节点
     * @param current 
     * @param items 
     * @returns 
     */
    private insertAfter(current: Node, ...items: Node[]) {
        if (current.nextSibling) {
            this.insertBefore(current.nextSibling, items);
            return;
        }
        this.insertLast(current.parentNode, items);
    }
}