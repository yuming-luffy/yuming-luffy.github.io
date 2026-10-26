# 张峰瑜的伟大航线

海贼王主题中文个人博客，免费托管于 GitHub Pages。

网站：<https://yuming-luffy.github.io/>

## 本地预览

需要 Node.js 22 或更高版本。

```sh
npm ci
npm run dev
```

打开命令显示的本地地址。

## 发布文章

文章保存在 `src/posts/`，使用 Markdown。复制已有文章，修改文件名及开头信息：

```yaml
---
title: 文章标题
description: 一句话简介
date: 2026-10-26
category: 技术笔记
topics: [笔记, 学习]
cover: 12
---
```

分类可选：技术笔记、学习记录、生活随笔、摄影作品。`cover` 对应主题配图编号 1–12。

正式文章无需 `sample`；草稿设置 `draft: true`。二级和三级标题自动进入目录。分类、标签和全文搜索索引随构建更新。

## 部署方式

当前沿用仓库已开启的 Pages 分支发布：`main` 分支根目录。根目录的 HTML、`assets/`、`posts/`、`categories/`、`tags/` 等是生成结果，源文件保存在 `src/` 与 `public/`。

运行 `npm run build` 会生成 `_site/`。发布时将 `_site/` 内的文件同步到仓库根目录，再提交到 `main`。不要直接修改生成的 HTML；应修改源文件后重新构建。

`deployment/pages.yml.example` 是可选的 Actions 发布参考，当前没有启用，避免和现有分支发布重复部署。后续文章由建站助手协助更新时，直接提供文章即可。

## 评论

评论使用本仓库 GitHub Issues。每篇文章的讨论标题为 `[留言] 文章文件名`，例如 `[留言] set-sail`。网站读取公开留言，读者登录 GitHub 后在对应讨论中回复。无需安装额外评论应用、配置密钥或租用服务器。

正文以纯文本安全显示。GitHub API 限流或网络不可用时，会显示重试按钮及 GitHub 留言入口。

## 素材与待补内容

十二幅海贼王图片由站主提供，相关权利归原权利方，详情见网站「图片说明」。没有将动漫画面当作原创摄影。三篇文章标注为内容样例；正式简历、技术博客与摄影作品待补充。

静态生成使用 [Eleventy](https://github.com/11ty/eleventy)，博客组织方式参考 [Eleventy Base Blog](https://github.com/11ty/eleventy-base-blog)。主题与交互为本网站定制。
