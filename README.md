# ballancemaps-fetch

从 [Ballance 地图管理站（永硕网盘）](http://ballancemaps.ysepan.com/)拉取地图信息。以 JavaScript 实现，配有演示用 HTML 页面。

## 技术细节

永硕使用 AJAX 的方式加载目录和文件列表，加载时的 HTTP 请求需要含有 Referer 请求头，否则会提示错误。加载出的内容是永硕已经生成好的 HTML。

### 解析 HTML

使用 HTML 相关的解析器，或者暴力正则表达式。
