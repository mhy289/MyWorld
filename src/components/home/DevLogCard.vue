<template>
  <div class="devlog-card">
    <h2 class="card-title">{{ t.title }}</h2>
    <ul class="timeline">
      <li v-for="(entry, i) in entries" :key="i" class="timeline-item">
        <span class="timeline-date">{{ entry.date }}</span>
        <span class="timeline-dot"></span>
        <div class="timeline-content">
          <p class="timeline-title">{{ entry.title[lang] }}</p>
          <p class="timeline-desc">{{ entry.desc[lang] }}</p>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { useI18n, language } from '../../composables/useI18n';

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

const lang = language;

// 开发历程数据（占位，可替换为真实数据）
const entries = [
  {
    date: '2025-01',
    title: { en: 'Project Started', zh: '项目启动', fr: 'Projet démarré', es: 'Proyecto iniciado', pt: 'Projeto iniciado', ru: 'Проект начат', ar: 'بدأ المشروع' },
    desc: { en: 'Initial scaffolding and tech stack setup.', zh: '完成项目脚手架与技术选型。', fr: 'Mise en place du squelette et de la stack.', es: 'Configuración inicial y stack tecnológico.', pt: 'Estrutura inicial e stack tecnológico.', ru: 'Начальная настройка и стек технологий.', ar: 'الإعداد الأولي واختيار التقنيات.' }
  },
  {
    date: '2025-03',
    title: { en: 'Deployment & Env Config', zh: '部署与环境配置', fr: 'Déploiement et configuration', es: 'Despliegue y configuración', pt: 'Deploy e configuração', ru: 'Развертывание и конфигурация', ar: 'النشر والتكوين' },
    desc: { en: 'Added environment variables for easy deployment.', zh: '新增环境变量，方便部署。', fr: 'Variables d’environnement pour le déploiement.', es: 'Variables de entorno para el despliegue.', pt: 'Variáveis de ambiente para deploy.', ru: 'Переменные окружения для деплоя.', ar: 'متغيرات البيئة لتسهيل النشر.' }
  },
  {
    date: '2025-06',
    title: { en: 'Visitor Stats Backend', zh: '访客统计后端接入', fr: 'Statistiques de visite', es: 'Estadísticas de visitas', pt: 'Estatísticas de visitas', ru: 'Статистика посетителей', ar: 'إحصائيات الزوار' },
    desc: { en: 'Connected visitor reporting to backend API.', zh: '访客数据上报接入后端接口。', fr: 'Rapport des visites via l’API.', es: 'Reporte de visitas vía API.', pt: 'Relatório de visitas via API.', ru: 'Отчет посетителей через API.', ar: 'إبلاغ الزوار عبر الواجهة.' }
  },
  {
    date: '2026-08',
    title: { en: 'Layout Refactor', zh: '页面框架重构', fr: 'Refonte de la mise en page', es: 'Refactorización del diseño', pt: 'Refatoração do layout', ru: 'Рефакторинг макета', ar: 'إعادة هيكلة التصميم' },
    desc: { en: 'Rebuilt the page as top + side + content layout.', zh: '重构为顶部 + 左侧 + 中间三区布局。', fr: 'Nouveau layout haut / côté / contenu.', es: 'Nuevo diseño superior / lateral / contenido.', pt: 'Novo layout topo / lateral / conteúdo.', ru: 'Новый макет: верх / бок / контент.', ar: 'تخطيط جديد: أعلى / جانب / محتوى.' }
  }
];
</script>

<style scoped>
.devlog-card {
  max-width: 720px;
  padding: 28px 24px;
}

.card-title {
  margin: 0 0 24px;
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

.timeline {
  list-style: none;
  margin: 0;
  padding: 0;
  position: relative;
}

/* 左侧时间线竖线 */
.timeline::before {
  content: '';
  position: absolute;
  left: 88px;
  top: 6px;
  bottom: 6px;
  width: 2px;
  background: #d4dae3;
}

.timeline-item {
  position: relative;
  display: flex;
  align-items: flex-start;
  margin-bottom: 20px;
}

.timeline-date {
  width: 72px;
  flex-shrink: 0;
  font-size: 13px;
  font-weight: 600;
  color: #909399;
  line-height: 1.6;
  padding-top: 2px;
  text-align: right;
  padding-right: 14px;
}

.timeline-dot {
  position: absolute;
  left: 84px;
  top: 8px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #409eff;
  border: 2px solid #ffffff;
  box-shadow: 0 0 0 2px #409eff;
}

.timeline-content {
  flex: 1;
  min-width: 0;
  padding-left: 22px;
}

.timeline-title {
  margin: 0 0 4px;
  font-size: 15px;
  font-weight: 500;
  color: #303133;
}

.timeline-desc {
  margin: 0;
  font-size: 13px;
  color: #909399;
  line-height: 1.6;
}

/* 暗色主题 */
.dark .card-title {
  color: #e5e7eb;
}

.dark .timeline::before {
  background: #3a3c42;
}

.dark .timeline-date {
  color: #8a8d94;
}

.dark .timeline-dot {
  border-color: #1a1b1f;
}

.dark .timeline-title {
  color: #e5e7eb;
}

.dark .timeline-desc {
  color: #8a8d94;
}
</style>
