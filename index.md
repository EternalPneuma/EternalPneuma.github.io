---
layout: default
title: 首页
---

# 欢迎来到「无名数据管理室」

- 用于记录个人洞察
> 希望能够对您有所帮助

---

## 关于这里

- **复盘**: 问题、方法、结论
- **技术**: 原理、步骤、实例
- **随笔**: 吐槽、思考、感悟

---

## 文章

<ul>
  {% for post in site.posts %}
    <li>
      <span>{{ post.date | date: "%Y-%m-%d" }}</span> — 
      <a href="{{ post.url }}">{{ post.title }}</a>
    </li>
  {% endfor %}
</ul>

---

## 风险提示

- 本博客所有内容仅供参考，不构成任何投资建议。

---

<small>powered by <a href="https://pages.github.com/">GitHub Pages</a> · <a href="https://github.com/pages-themes/minimal">minimal theme</a></small>
