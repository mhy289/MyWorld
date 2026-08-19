<template>
  <div class="devlog-card">
    <h2 class="card-title">{{ t.title }}</h2>
    <div class="devlog-list">
      <article v-for="post in posts" :key="post.key" class="devlog-post">
        <div class="devlog-md" v-html="post.html"></div>
      </article>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from '../../composables/useI18n';
import { renderMarkdown } from '../../utils/markdown';

const translations = {
  en: { title: 'Development Journey' },
  zh: { title: '开发历程' },
  fr: { title: 'Parcours de développement' },
  es: { title: 'Trayectoria de desarrollo' },
  pt: { title: 'Jornada de desenvolvimento' },
  ru: { title: 'Путь разработки' },
  ar: { title: 'مسار التطوير' }
};
const { t } = useI18n(translations);

// 自动加载 src/content/devlog/ 下所有 .md 文件（文件名即日期，倒序 = 新到旧）
const mdModules = import.meta.glob('../../content/devlog/*.md', {
  eager: true,
  query: '?raw',
  import: 'default'
});

const posts = Object.keys(mdModules)
  .sort((a, b) => b.localeCompare(a))
  .map((path) => ({
    key: path,
    html: renderMarkdown(mdModules[path] || '')
  }));
</script>

<style scoped>
.devlog-card {
  max-width: 760px;
  padding: 28px 24px;
}

.card-title {
  margin: 0 0 20px;
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

.devlog-post {
  padding: 20px 0;
}

.devlog-post + .devlog-post {
  border-top: 1px solid #e4e7ed;
}

/* ===== md 内容样式（适配亮暗主题） ===== */
.devlog-md h1 {
  font-size: 20px;
  margin: 0 0 12px;
  color: #303133;
}

.devlog-md h2 {
  font-size: 16px;
  margin: 16px 0 8px;
  color: #303133;
}

.devlog-md h3 {
  font-size: 14px;
  margin: 12px 0 6px;
  color: #303133;
}

.devlog-md p {
  margin: 6px 0;
  font-size: 14px;
  line-height: 1.8;
  color: #606266;
}

.devlog-md ul,
.devlog-md ol {
  margin: 6px 0;
  padding-left: 22px;
  font-size: 14px;
  line-height: 1.8;
  color: #606266;
}

.devlog-md li {
  margin: 3px 0;
}

.devlog-md code {
  background: rgba(64, 158, 255, 0.1);
  color: #409eff;
  border-radius: 4px;
  padding: 1px 5px;
  font-size: 13px;
  font-family: Consolas, Monaco, monospace;
}

.devlog-md pre {
  background: #f5f7fa;
  border-radius: 8px;
  padding: 12px 14px;
  overflow-x: auto;
  margin: 8px 0;
}

.devlog-md pre code {
  background: transparent;
  color: #303133;
  padding: 0;
}

.devlog-md blockquote {
  margin: 8px 0;
  padding: 6px 12px;
  border-left: 3px solid #409eff;
  background: rgba(64, 158, 255, 0.06);
  border-radius: 0 6px 6px 0;
}

.devlog-md blockquote p {
  margin: 0;
  color: #606266;
}

.devlog-md a {
  color: #409eff;
  text-decoration: none;
}

.devlog-md a:hover {
  text-decoration: underline;
}

.devlog-md hr {
  border: none;
  border-top: 1px solid #e4e7ed;
  margin: 16px 0;
}

/* ===== 暗色主题 ===== */
.dark .card-title {
  color: #e5e7eb;
}

.dark .devlog-post + .devlog-post {
  border-top-color: #3a3c42;
}

.dark .devlog-md h1,
.dark .devlog-md h2,
.dark .devlog-md h3 {
  color: #e5e7eb;
}

.dark .devlog-md p,
.dark .devlog-md ul,
.dark .devlog-md ol,
.dark .devlog-md blockquote p {
  color: #a8abb2;
}

.dark .devlog-md pre {
  background: #26272b;
}

.dark .devlog-md pre code {
  color: #d1d5db;
}

.dark .devlog-md code {
  background: rgba(64, 158, 255, 0.18);
}

.dark .devlog-md hr {
  border-top-color: #3a3c42;
}
</style>
