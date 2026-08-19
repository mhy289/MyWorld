import { ref, computed } from 'vue';

// 全局共享语言状态：所有组件（App 设置面板、首页模块）响应式联动
export const language = ref(localStorage.getItem('app_language') || 'en');

// 组件使用：传入当前组件的多语言文案表，返回 t（当前语言文案）
export function useI18n(translations) {
  const t = computed(() => translations[language.value] || translations.en || {});
  return { language, t };
}

// 设置语言：更新共享状态 + 持久化 + 广播事件（兼容旧监听方）
export function setLanguage(lang) {
  language.value = lang;
  localStorage.setItem('app_language', lang);
  localStorage.setItem('app_language_manual', '1');
  window.dispatchEvent(new CustomEvent('app-language-change', { detail: lang }));
}
