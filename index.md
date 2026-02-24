---
layout: default
title: 适配测试页
description: 用于测试 GitHub Pages 与 Minimal Theme 的展示效果
---

# Minimal Theme 适配测试

这是一份用于测试 **GitHub Pages** 与 _Minimal Theme_ 的文档，覆盖常见 Markdown 格式、内联样式、列表、表格、代码块、引用、图片与 HTML 混排等情况。  
当前时间：2026-02-24。链接示例：[GitHub Pages](https://pages.github.com)。

---

## 文本与排版

普通文本、**加粗**、_斜体_、~~删除线~~、`行内代码`、<kbd>Ctrl</kbd>+<kbd>S</kbd>。  
这里是一个带有换行的段落，下一行使用了 Markdown 的硬换行语法。

> 这是一个引用块。  
> 第二行引用内容，用于测试多行引用样式。

### 小标题

#### 更小标题

内容仍保持可读性与层级清晰。

---

## 列表

无序列表：
- 项目一
- 项目二
- 项目三

有序列表：
1. 第一步
2. 第二步
3. 第三步

任务列表：
- [x] 已完成
- [ ] 未完成

---

## 表格

| 项目 | 左对齐 | 居中 | 右对齐 |
| :--- | :---- | :--: | -----: |
| A | Alpha | 1 | 100 |
| B | Beta | 2 | 200 |
| C | Gamma | 3 | 300 |

---

## 代码块

```js
const theme = "minimal";
const features = ["markdown", "tables", "code", "image"];

function summary(name, list) {
  return `${name}: ${list.join(", ")}`;
}

console.log(summary(theme, features));
```

```json
{
  "site": "EternalPneuma.github.io",
  "theme": "pages-themes/minimal",
  "enabled": true
}
```

---

## 图片与链接

![占位图](https://via.placeholder.com/640x360.png?text=Minimal+Theme)

相关链接：
- [Jekyll](https://jekyllrb.com)
- [GitHub Pages Themes](https://pages.github.com/themes/)

---

## 混排 HTML

<details>
  <summary>展开查看说明</summary>
  <p>这里是 HTML details/summary 的内容，用于测试主题对原生 HTML 的支持。</p>
</details>

---

## 脚注

这里有一个脚注示例。[^\*]

[^\*]: 这是脚注内容，用于测试脚注展示效果。
