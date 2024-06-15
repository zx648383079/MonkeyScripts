// ==UserScript==
// @name            网易buff挂刀
// @namespace       https://zodream.cn/
// @version         0.1
// @description     网易buff挂刀价格查询
// @author          ZoDream
// @match           https://buff.163.com/goods/*
// @grant           GM_openInTab
// @run-at          document-end
// ==/UserScript==
(function () {
    'use strict';
    var BuffTooler = /** @class */ (function () {
        function BuffTooler() {
            var _this = this;
            this.steamPrice = 0;
            var target = document.querySelector('.detail-header .detail-summ .f_Strong');
            target.addEventListener('click', function () {
                var price = window.prompt('请输入Steam市场实时价格:');
                if (!price) {
                    return;
                }
                _this.steamPrice = _this.parseNumber(price);
                _this.updateItemPrice(document.querySelectorAll('.detail-tab-cont .t_Left .f_Strong'));
            });
            this.steamPrice = this.parseNumber(target.textContent);
            this.waitTdUpdate(this.updateItemPrice.bind(this));
        }
        Object.defineProperty(BuffTooler.prototype, "steamIncome", {
            get: function () {
                return this.steamPrice * .85;
            },
            enumerable: false,
            configurable: true
        });
        BuffTooler.prototype.getIncomeScale = function (price) {
            if (!this.steamPrice) {
                return 0;
            }
            return (this.parseNumber(price) * 10 / this.steamIncome).toFixed(2);
        };
        BuffTooler.prototype.updateItemPrice = function (items) {
            for (var i = 0; i < items.length; i++) {
                var element = items[i];
                this.appendTip(element, this.getIncomeScale(element.textContent));
            }
        };
        BuffTooler.prototype.waitTdUpdate = function (cb) {
            var _this = this;
            var table = document.querySelector('.detail-tab-cont');
            var observer = new MutationObserver(function () {
                cb.call(_this, table.querySelectorAll('.t_Left .f_Strong'));
            });
            observer.observe(table, { childList: true });
        };
        BuffTooler.prototype.parseNumber = function (val) {
            if (!val) {
                return 0;
            }
            if (typeof val === 'number') {
                return val;
            }
            return parseFloat(val.match(/[\d\.]+/)[0]);
        };
        BuffTooler.prototype.appendTip = function (target, val) {
            var cls = 'zre-tooltip';
            var next = target.nextSibling;
            if (next && next instanceof HTMLElement && next.classList.contains(cls)) {
                next.innerText = "\u6536\u76CA\u7387: \uFFE5".concat(val);
                return;
            }
            var tip = document.createElement('p');
            tip.classList.add(cls);
            tip.innerText = "\u6536\u76CA\u7387: \uFFE5".concat(val);
            this.insertAfter(target, tip);
        };
        /**
         * 在子节点最后添加元素
         * @param current
         * @param items
         */
        BuffTooler.prototype.insertLast = function (current, items) {
            for (var _i = 0, items_1 = items; _i < items_1.length; _i++) {
                var item = items_1[_i];
                current.appendChild(item);
            }
        };
        /**
         * 在元素之前添加兄弟节点
         * @param current
         * @param items
         */
        BuffTooler.prototype.insertBefore = function (current, items) {
            var parent = current.parentNode;
            for (var _i = 0, items_2 = items; _i < items_2.length; _i++) {
                var item = items_2[_i];
                parent.insertBefore(item, current);
            }
        };
        /**
         * 在元素之后添加兄弟节点
         * @param current
         * @param items
         * @returns
         */
        BuffTooler.prototype.insertAfter = function (current) {
            var items = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                items[_i - 1] = arguments[_i];
            }
            if (current.nextSibling) {
                this.insertBefore(current.nextSibling, items);
                return;
            }
            this.insertLast(current.parentNode, items);
        };
        return BuffTooler;
    }());
    new BuffTooler();
})();
