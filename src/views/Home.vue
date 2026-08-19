<template>
  <div class="home-shell">
    <!-- 顶部分类下拉 -->
    <div class="top-bar">
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

    <!-- 主体：左侧子项下拉 + 中间渲染区 -->
    <div class="main-area">
      <aside class="side-bar">
        <div class="side-bar-inner">
          <el-select
            v-model="currentItem"
            class="item-select"
            :placeholder="t.itemPlaceholder"
            @change="handleItemChange"
          >
            <el-option
              v-for="item in currentCatItems"
              :key="item.key"
              :value="item.key"
              :label="item.label[lang] || item.key"
            />
          </el-select>
        </div>
      </aside>

      <main class="content-area">
        <transition name="module-fade" mode="out-in">
          <KeepAlive>
            <component :is="currentComponent" :key="currentComponentKey" />
          </KeepAlive>
        </transition>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { modules, findCategory, defaultPosition } from '../config/modules';
import { useI18n, language } from '../composables/useI18n';
import { recordVisit } from '../composables/useVisitor';

const translations = {
  en: { categoryPlaceholder: 'Select category', itemPlaceholder: 'Select module' },
  zh: { categoryPlaceholder: '选择分类', itemPlaceholder: '选择模块' },
  fr: { categoryPlaceholder: 'Choisir une catégorie', itemPlaceholder: 'Choisir un module' },
  es: { categoryPlaceholder: 'Seleccionar categoría', itemPlaceholder: 'Seleccionar módulo' },
  pt: { categoryPlaceholder: 'Selecionar categoria', itemPlaceholder: 'Selecionar módulo' },
  ru: { categoryPlaceholder: 'Выберите категорию', itemPlaceholder: 'Выберите модуль' },
  ar: { categoryPlaceholder: 'اختر الفئة', itemPlaceholder: 'اختر الوحدة' }
};
const { t } = useI18n(translations);

const route = useRoute();
const router = useRouter();

const lang = computed(() => language.value);

const currentCat = ref('');
const currentItem = ref('');

const STORAGE_KEY = 'home_module';

const currentCatItems = computed(() => findCategory(currentCat.value)?.items || []);

const currentComponent = computed(() => {
  const cat = findCategory(currentCat.value);
  return cat?.items.find((i) => i.key === currentItem.value)?.component;
});

const currentComponentKey = computed(() => `${currentCat.value}-${currentItem.value}`);

// 持久化当前选择（localStorage + URL query）
const saveState = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ cat: currentCat.value, item: currentItem.value }));
  } catch (e) {
    console.warn('保存模块位置失败:', e);
  }
  router.replace({
    query: { cat: currentCat.value, item: currentItem.value }
  }).catch(() => {});
};

const handleCatChange = () => {
  const items = currentCatItems.value;
  currentItem.value = items[0]?.key || '';
  saveState();
};

const handleItemChange = () => {
  saveState();
};

// 恢复上次位置：URL query > localStorage > 默认第一个
const resolvePosition = () => {
  const fallback = defaultPosition();
  const qCat = typeof route.query.cat === 'string' ? route.query.cat : null;
  const qItem = typeof route.query.item === 'string' ? route.query.item : null;

  let saved = null;
  try {
    saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
  } catch {
    saved = null;
  }

  const catKey =
    (qCat && findCategory(qCat)) ? qCat
    : (saved && findCategory(saved.cat)) ? saved.cat
    : fallback.cat;

  const cat = findCategory(catKey);
  const itemKey =
    (qItem && cat.items.some((i) => i.key === qItem)) ? qItem
    : (saved && cat.items.some((i) => i.key === saved.item)) ? saved.item
    : cat.items[0].key;

  return { cat: catKey, item: itemKey };
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
</script>

<style scoped>
.home-shell {
  height: calc(100vh - 70px);
  margin-top: 70px;
  padding: 0 16px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

/* 顶部分类下拉 */
.top-bar {
  flex-shrink: 0;
  display: flex;
  justify-content: center;
  padding: 12px 0;
}

.cat-select {
  width: 280px;
}

/* 主体 */
.main-area {
  flex: 1;
  display: flex;
  gap: 16px;
  min-height: 0;
}

.side-bar {
  width: 240px;
  flex-shrink: 0;
  border-right: 1px solid #ebeef5;
  padding: 12px 16px 12px 0;
  box-sizing: border-box;
}

.dark .side-bar {
  border-right-color: #363637;
}

.side-bar-inner {
  position: sticky;
  top: 12px;
}

.item-select {
  width: 100%;
}

.content-area {
  flex: 1;
  min-width: 0;
  overflow-y: auto;
  padding: 12px 16px 24px;
  border-radius: 8px;
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

/* 窄屏适配：左侧栏隐藏，子项下拉移到顶部 */
@media (max-width: 768px) {
  .main-area {
    flex-direction: column;
  }

  .side-bar {
    width: 100%;
    border-right: none;
    padding: 8px 0;
  }

  .side-bar-inner {
    position: static;
  }
}
</style>
