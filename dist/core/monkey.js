"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var readable_stream_1 = require("readable-stream");
function each(data, cb) {
    if (typeof data !== 'object') {
        return cb(data, 0);
    }
    if (data instanceof Array) {
        for (var i = 0; i < data.length; i++) {
            if (cb(data[i], i) === false) {
                return;
            }
        }
        return;
    }
    for (var key in data) {
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
function template() {
    return new readable_stream_1.Transform({
        objectMode: true,
        transform: function (file, _, callback) {
            if (file.isNull()) {
                return callback();
            }
            if (!file.isBuffer()) {
                return callback();
            }
            var str = String(file.contents);
            var match = str.match(/(@UserScript(\([\s\S]+?\))\s*)class\s+(\S+)/);
            if (!match) {
                return callback(null, file);
            }
            var options = eval(match[2].trim());
            var lines = ['// ==UserScript=='];
            each(options, function (items, key) {
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
                    var prefix_1 = '// @' + key + new Array(17 - key.length).join(' ');
                    items.forEach(function (item) {
                        lines.push(prefix_1 + item);
                    });
                    return;
                }
                each(items, function (item, i) {
                    if (key === 'name' || key === 'description') {
                        var name_1 = key + (i.trim().length > 0 ? ':' + i : '');
                        lines.push('// @' + name_1 + new Array(17 - name_1.length).join(' ') + item);
                        return;
                    }
                    lines.push('// @' + name + ' ' + i + ' ' + item);
                });
            });
            lines.push('// ==/UserScript==');
            lines.push('');
            lines.push('(function() {');
            lines.push("    'use strict';");
            str.replace(match[1], '').replace(/import.+?from\s+.+?["'];/, '').split("\n").forEach(function (line) {
                lines.push('    ' + line);
            });
            lines.push('    new ' + match[3].trim() + '();');
            lines.push('})();');
            file.contents = Buffer.from(lines.join("\n"));
            return callback(null, file);
        }
    });
}
exports.default = template;
;
