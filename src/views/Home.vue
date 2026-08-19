<template>
  <div class="home-shell">
    <!-- 左侧栏：贯穿整列，上下无缝隙 -->
    <aside class="side-bar">
      <div class="side-cat-title">{{ currentCatLabel }}</div>
      <ul class="side-list">
        <li
          v-for="item in currentCatItems"
          :key="item.key"
          class="side-item"
          :class="{ active: item.key === currentItem }"
          @click="handleSideItemClick(item)"
        >
          <span class="side-item-label">{{ item.label[lang] || item.key }}</span>
        </li>
      </ul>
    </aside>

    <!-- 顶部：Logo + 分类下拉 -->
    <div class="top-bar">
      <router-link to="/" class="logo-link" :title="t.homeTitle">
        <img src="/icons/icon-192.png" alt="logo" class="logo-img" />
      </router-link>
      <el-select
        v-model="currentCat"
        class="cat-select"
        :placeholder="t.categoryPlaceholder"
        @change="handleCatChange"
      >
        <el-option
          v-for="cat in modules"
          :key="cat.key"
          :value="cat.key"
          :label="cat.label[lang] || cat.key"
        />
      </el-select>
    </div>

    <!-- 中间渲染区 -->
    <main class="content-area">
      <!-- 选中模块：渲染对应组件 -->
      <template v-if="hasSelection">
        <transition name="module-fade" mode="out-in">
          <KeepAlive>
            <component :is="currentComponent" :key="currentComponentKey" />
          </KeepAlive>
        </transition>
      </template>
      <!-- 未选择模块：首页暂时显示 Hello World -->
      <div v-else class="hello-world">
        <h1 class="hello-title">Hello World</h1>
        <p class="hello-sub">{{ t.helloSub }}</p>
      </div>
    </main>

    <!-- 底部：关于我的信息、链接、ICP 备案 -->
    <footer class="site-footer">
      <span class="footer-copy">© {{ year }} MyWorld · {{ t.footerRights }}</span>
      <div class="footer-links">
        <a
          v-for="link in footerLinks"
          :key="link.label"
          :href="link.url"
          target="_blank"
          rel="noopener noreferrer"
        >{{ link.label }}</a>
      </div>
      <span class="footer-icp">{{ icp }}</span>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { modules, findCategory } from '../config/modules';
import { useI18n, language } from '../composables/useI18n';
import { recordVisit } from '../composables/useVisitor';

const translations = {
  en: { categoryPlaceholder: 'Select category', itemPlaceholder: 'Select module', homeTitle: 'Home', helloSub: 'Home page under construction', footerRights: 'All rights reserved.' },
  zh: { categoryPlaceholder: '选择分类', itemPlaceholder: '选择模块', homeTitle: '返回主页', helloSub: '首页建设中', footerRights: '保留所有权利。' },
  fr: { categoryPlaceholder: 'Choisir une catégorie', itemPlaceholder: 'Choisir un module', homeTitle: 'Accueil', helloSub: "Page d'accueil en construction", footerRights: 'Tous droits réservés.' },
  es: { categoryPlaceholder: 'Seleccionar categoría', itemPlaceholder: 'Seleccionar módulo', homeTitle: 'Inicio', helloSub: 'Página de inicio en construcción', footerRights: 'Todos los derechos reservados.' },
  pt: { categoryPlaceholder: 'Selecionar categoria', itemPlaceholder: 'Selecionar módulo', homeTitle: 'Início', helloSub: 'Página inicial em construção', footerRights: 'Todos os direitos reservados.' },
  ru: { categoryPlaceholder: 'Выберите категорию', itemPlaceholder: 'Выберите модуль', homeTitle: 'Главная', helloSub: 'Страница в разработке', footerRights: 'Все права защищены.' },
  ar: { categoryPlaceholder: 'اختر الفئة', itemPlaceholder: 'اختر الوحدة', homeTitle: 'الرئيسية', helloSub: 'الصفحة الرئيسية قيد الإنشاء', footerRights: 'جميع الحقوق محفوظة.' }
};
const { t } = useI18n(translations);

const route = useRoute();

// ===== 底部页脚配置（按需修改为自己的信息） =====
const year = new Date().getFullYear();
const footerLinks = [
  { label: 'GitHub', url: 'https://github.com/' },
  { label: 'Email', url: 'mailto:admin@example.com' },
  { label: 'Blog', url: 'https://example.com' }
];
const icp = '京ICP备00000000号-1';
const router = useRouter();

const lang = computed(() => language.value);

const currentCat = ref('');
const currentItem = ref('');

const STORAGE_KEY = 'home_module';

const currentCatItems = computed(() => findCategory(currentCat.value)?.items || []);

// 左侧分类标题（当前分类名）
const currentCatLabel = computed(() => findCategory(currentCat.value)?.label[lang.value] || '');

// 点击左侧子项：切换模块
const handleSideItemClick = (item) => {
  currentItem.value = item.key;
  handleItemChange();
};

const currentComponent = computed(() => {
  const cat = findCategory(currentCat.value);
  return cat?.items.find((i) => i.key === currentItem.value)?.component;
});

const currentComponentKey = computed(() => `${currentCat.value}-${currentItem.value}`);

// 是否选中了有效模块（否则显示 Hello World 首页）
const hasSelection = computed(() => !!currentComponent.value);

// 持久化当前选择（localStorage + URL query）
const saveState = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ cat: currentCat.value, item: currentItem.value }));
  } catch (e) {
    console.warn('保存模块位置失败:', e);
  }
  // 空值不写入 query，保持 URL 干净（如返回主页时为 /）
  const query = {};
  if (currentCat.value) query.cat = currentCat.value;
  if (currentItem.value) query.item = currentItem.value;
  router.replace({ query }).catch(() => {});
};

const handleCatChange = () => {
  const items = currentCatItems.value;
  currentItem.value = items[0]?.key || '';
  saveState();
};

const handleItemChange = () => {
  saveState();
};

// 恢复位置：仅 URL query 指定了有效模块时才渲染；否则回到 Hello World 首页
const resolvePosition = () => {
  const qCat = typeof route.query.cat === 'string' ? route.query.cat : null;
  const qItem = typeof route.query.item === 'string' ? route.query.item : null;

  const cat = qCat ? findCategory(qCat) : null;
  if (cat && qItem && cat.items.some((i) => i.key === qItem)) {
    return { cat: qCat, item: qItem };
  }
  return { cat: '', item: '' };
};

onMounted(() => {
  // 访客本地计数：每次进入页面 +1
  try {
    recordVisit();
  } catch (e) {
    console.warn('记录访问失败:', e);
  }

  // 恢复上次选择的模块
  const pos = resolvePosition();
  currentCat.value = pos.cat;
  currentItem.value = pos.item;
});

// 路由 query 变化时同步状态（点击左上角 Logo 返回主页等场景）
watch(
  () => route.query,
  () => {
    const pos = resolvePosition();
    currentCat.value = pos.cat;
    currentItem.value = pos.item;
  }
);
</script>

<style scoped>
/* ===== 整体布局：顶部/页脚横跨全宽，左侧栏与内容区在中间一行 ===== */
.home-shell {
  height: 100vh;
  box-sizing: border-box;
  display: grid;
  grid-template-columns: 240px 1fr;
  grid-template-rows: auto 1fr auto;
  grid-template-areas:
    'top top'
    'side main'
    'footer footer';
}

/* ===== 顶部栏：Logo + 分类下拉 ===== */
.top-bar {
  grid-area: top;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 10px 16px;
  background: #dde3ee;
  border-bottom: 1px solid #d4dae3;
}

.logo-link {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  line-height: 0;
  cursor: pointer;
}

.logo-img {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  object-fit: cover;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.logo-link:hover .logo-img {
  transform: scale(1.08);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.cat-select {
  width: 280px;
}

/* ===== 左侧栏：子项纵向排列，过长自动滚动 ===== */
.side-bar {
  grid-area: side;
  min-width: 0;
  background: #eef1f6;
  border-right: 1px solid #d4dae3;
  padding: 12px 12px 16px;
  box-sizing: border-box;
  overflow-y: auto;
}

/* 自定义滚动条，融入底色 */
.side-bar::-webkit-scrollbar {
  width: 6px;
}

.side-bar::-webkit-scrollbar-thumb {
  background: rgba(144, 147, 153, 0.35);
  border-radius: 3px;
}

.side-bar::-webkit-scrollbar-track {
  background: transparent;
}

.side-cat-title {
  font-size: 13px;
  font-weight: 600;
  color: #606266;
  letter-spacing: 1px;
  padding: 0 8px;
  margin-bottom: 8px;
}

.side-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.side-item {
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  color: #606266;
  font-size: 14px;
  line-height: 1.4;
  user-select: none;
  transition: background-color 0.2s, color 0.2s;
}

.side-item:hover {
  background: rgba(64, 158, 255, 0.08);
  color: #409eff;
}

.side-item.active {
  background: #409eff;
  color: #ffffff;
  font-weight: 500;
}

/* 中间内容区：模块内容铺满，紧贴顶部与边缘，与背景融为一体 */
.content-area {
  grid-area: main;
  min-width: 0;
  overflow-y: auto;
  padding: 0;
  background: #ffffff;
}

/* 渲染区域融入背景：去掉组件卡片的外边框、阴影与背景 */
.content-area :deep(.el-card) {
  border: none;
  box-shadow: none;
  background: transparent;
}

.content-area :deep(.el-card__header) {
  border-bottom: none;
}

.content-area :deep(.about-section) {
  border: none;
  background: transparent;
}

.content-area :deep(.chart-container) {
  box-shadow: none;
}

/* Hello World 占位：占满中间区域并居中 */
.hello-world {
  min-height: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 24px 16px;
}

.hello-title {
  margin: 0;
  font-size: clamp(2.5rem, 6vw, 5rem);
  font-weight: 700;
  letter-spacing: 2px;
  background: linear-gradient(135deg, #409eff, #7a5cff);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.hello-sub {
  margin-top: 12px;
  font-size: 14px;
  color: #909399;
}

/* ===== 暗色主题：三区颜色区分 ===== */
.dark .top-bar {
  background: #30323a;
  border-bottom-color: #3a3c42;
}

.dark .side-bar {
  background: #232529;
  border-right-color: #3a3c42;
}

.dark .side-cat-title {
  color: #a8abb2;
}

.dark .side-item {
  color: #c0c4cc;
}

.dark .side-item:hover {
  background: rgba(64, 158, 255, 0.15);
  color: #7fb5ff;
}

.dark .side-bar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.18);
}

.dark .content-area {
  background: #1a1b1f;
}

.dark .hello-sub {
  color: #8a8d94;
}

/* ===== 底部页脚 ===== */
.site-footer {
  grid-area: footer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 6px 16px;
  padding: 10px 16px;
  font-size: 13px;
  color: #606266;
  background: #dde3ee;
  border-top: 1px solid #d4dae3;
}

.footer-links {
  display: flex;
  align-items: center;
  gap: 16px;
}

.footer-links a {
  color: #409eff;
  text-decoration: none;
  transition: opacity 0.2s;
}

.footer-links a:hover {
  opacity: 0.75;
  text-decoration: underline;
}

.dark .site-footer {
  background: #30323a;
  border-top-color: #3a3c42;
  color: #a8abb2;
}

.dark .footer-links a {
  color: #7fb5ff;
}

/* 模块切换动画 */
.module-fade-enter-active,
.module-fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.module-fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.module-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* 窄屏适配：单列布局，侧栏移到顶部，子项横向排列换行 */
@media (max-width: 768px) {
  .home-shell {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto 1fr auto;
    grid-template-areas:
      'top'
      'side'
      'main'
      'footer';
  }

  .side-bar {
    border-right: none;
    border-bottom: 1px solid #d4dae3;
    padding: 8px 12px;
    overflow-x: auto;
    max-height: 148px;
  }

  .side-list {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 6px;
  }

  .side-item {
    padding: 6px 12px;
    border-radius: 999px;
    white-space: nowrap;
  }

  .dark .side-bar {
    border-bottom-color: #3a3c42;
  }
}
</style>
