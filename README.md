# MonkeyScripts

油猴脚本

# 脚本文件

在 `dist` 文件加下

# 编译

```
gulp
```

或借助 Code Runner，在文件编辑框中右键 Run Code 即可编译当前文件 目前仅支持 .ts

# 编写规则

1. 每一个脚本是一个文件
2. 一个脚本一个主类


## 基本结构

```ts
@UserScript({
    name: "抓取",
    namespace: "https://zodream.cn/",
    version: "0.1",
    description: "抓取",
    author: "ZoDream",
    include: [
        "https://*",
    ],
    require: "https://code.jquery.com/jquery-2.1.4.min.js",
    grant: "GM_xmlhttpRequest",
    "run-at": "context-menu"
})
class Spider {
    constructor() {
        // 这里面就是执行逻辑
    }
}
```

# 依赖

转换时必须有这个文件 [monkey.js](dist/core/monkey.js)