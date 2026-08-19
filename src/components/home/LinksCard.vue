<template>
  <el-card class="links-card">
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-2">
        <el-icon :size="20" color="#409eff"><Link /></el-icon>
        <span class="text-lg font-medium">{{ t.linksTitle }}</span>
      </div>
      <div class="flex gap-2">
        <el-button
          size="small"
          :type="linksView === 'grid' ? 'primary' : 'default'"
          @click="linksView = 'grid'"
        >
          <el-icon><Grid /></el-icon>
          <span class="ml-1 hidden sm:inline">{{ t.linksViewGrid }}</span>
        </el-button>
        <el-button
          size="small"
          :type="linksView === 'list' ? 'primary' : 'default'"
          @click="linksView = 'list'"
        >
          <el-icon><Menu /></el-icon>
          <span class="ml-1 hidden sm:inline">{{ t.linksViewList }}</span>
        </el-button>
        <el-button size="small" type="primary" @click="addLinkDialogVisible = true">
          <el-icon><Plus /></el-icon>
          <span class="ml-1">{{ t.addLink }}</span>
        </el-button>
      </div>
    </div>

    <div v-if="links.length === 0" class="text-center py-8 text-gray-400">
      {{ t.emptyLinks }}
    </div>

    <!-- 网格视图 -->
    <div v-else-if="linksView === 'grid'" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
      <div
        v-for="link in links"
        :key="link.id"
        class="link-item"
        @click="openLink(link.url)"
        :style="{ borderLeft: '3px solid ' + link.color }"
      >
        <img
          v-if="!failedIcons[link.id]"
          :src="getFaviconUrl(link.url)"
          alt=""
          class="link-icon"
          @error="handleIconError(link.id)"
        />
        <el-icon v-else class="link-icon-fallback"><Link /></el-icon>
        <span class="link-name">{{ link.name }}</span>
        <el-icon class="link-delete" @click.stop="removeLink(link.id)"><Close /></el-icon>
      </div>
    </div>

    <!-- 列表视图 -->
    <div v-else class="flex flex-col gap-2">
      <div
        v-for="link in links"
        :key="link.id"
        class="link-row"
        @click="openLink(link.url)"
      >
        <img
          v-if="!failedIcons[link.id]"
          :src="getFaviconUrl(link.url)"
          alt=""
          class="link-row-icon"
          @error="handleIconError(link.id)"
        />
        <el-icon v-else class="link-row-icon link-icon-fallback"><Link /></el-icon>
        <span class="flex-1">{{ link.name }}</span>
        <span class="link-row-url">{{ getHost(link.url) }}</span>
        <el-icon class="link-delete" @click.stop="removeLink(link.id)"><Close /></el-icon>
      </div>
    </div>

    <!-- 添加链接对话框 -->
    <el-dialog
      v-model="addLinkDialogVisible"
      :title="t.addLink"
      width="420px"
      :append-to-body="false"
    >
      <el-form label-width="70px" @submit.prevent>
        <el-form-item :label="t.linkName">
          <el-input v-model="newLinkName" :placeholder="t.linkNamePlaceholder" @keyup.enter="confirmAddLink" />
        </el-form-item>
        <el-form-item :label="t.linkUrl">
          <el-input v-model="newLinkUrl" :placeholder="t.linkUrlPlaceholder" @keyup.enter="confirmAddLink" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addLinkDialogVisible = false">{{ t.cancel }}</el-button>
        <el-button type="primary" @click="confirmAddLink">{{ t.confirmAdd }}</el-button>
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup>
import { ref, watch } from 'vue';
import { Link, Grid, Menu, Plus, Close } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useI18n } from '../../composables/useI18n';

const translations = {
  en: {
    linksTitle: 'Quick Links', linksViewGrid: 'Grid', linksViewList: 'List', addLink: 'Add Link',
    linkName: 'Name', linkUrl: 'URL', confirmAdd: 'Add', cancel: 'Cancel', deleteConfirm: 'Delete link?',
    linkNamePlaceholder: 'e.g. Google', linkUrlPlaceholder: 'https://...', emptyLinks: 'No links yet. Click "Add Link".',
    addLinkEmptyName: 'Please enter a name', addLinkSuccess: 'Link added', linkDeleted: 'Link deleted'
  },
  zh: {
    linksTitle: '常用链接', linksViewGrid: '网格', linksViewList: '列表', addLink: '添加链接',
    linkName: '名称', linkUrl: '网址', confirmAdd: '添加', cancel: '取消', deleteConfirm: '确定删除该链接吗？',
    linkNamePlaceholder: '例如：Google', linkUrlPlaceholder: 'https://...', emptyLinks: '暂无链接，点击"添加链接"。',
    addLinkEmptyName: '请输入名称', addLinkSuccess: '链接已添加', linkDeleted: '链接已删除'
  },
  fr: {
    linksTitle: 'Liens rapides', linksViewGrid: 'Grille', linksViewList: 'Liste', addLink: 'Ajouter',
    linkName: 'Nom', linkUrl: 'URL', confirmAdd: 'Ajouter', cancel: 'Annuler', deleteConfirm: 'Supprimer le lien ?',
    linkNamePlaceholder: 'ex. Google', linkUrlPlaceholder: 'https://...', emptyLinks: 'Aucun lien. Cliquez sur "Ajouter".',
    addLinkEmptyName: 'Veuillez saisir un nom', addLinkSuccess: 'Lien ajouté', linkDeleted: 'Lien supprimé'
  },
  es: {
    linksTitle: 'Enlaces rápidos', linksViewGrid: 'Cuadrícula', linksViewList: 'Lista', addLink: 'Añadir',
    linkName: 'Nombre', linkUrl: 'URL', confirmAdd: 'Añadir', cancel: 'Cancelar', deleteConfirm: '¿Eliminar enlace?',
    linkNamePlaceholder: 'p.ej. Google', linkUrlPlaceholder: 'https://...', emptyLinks: 'Sin enlaces. Haga clic en "Añadir".',
    addLinkEmptyName: 'Introduzca un nombre', addLinkSuccess: 'Enlace añadido', linkDeleted: 'Enlace eliminado'
  },
  pt: {
    linksTitle: 'Links rápidos', linksViewGrid: 'Grade', linksViewList: 'Lista', addLink: 'Adicionar',
    linkName: 'Nome', linkUrl: 'URL', confirmAdd: 'Adicionar', cancel: 'Cancelar', deleteConfirm: 'Excluir link?',
    linkNamePlaceholder: 'ex.: Google', linkUrlPlaceholder: 'https://...', emptyLinks: 'Sem links. Clique em "Adicionar".',
    addLinkEmptyName: 'Digite um nome', addLinkSuccess: 'Link adicionado', linkDeleted: 'Link excluído'
  },
  ru: {
    linksTitle: 'Быстрые ссылки', linksViewGrid: 'Сетка', linksViewList: 'Список', addLink: 'Добавить',
    linkName: 'Название', linkUrl: 'URL', confirmAdd: 'Добавить', cancel: 'Отмена', deleteConfirm: 'Удалить ссылку?',
    linkNamePlaceholder: 'напр. Google', linkUrlPlaceholder: 'https://...', emptyLinks: 'Нет ссылок. Нажмите "Добавить".',
    addLinkEmptyName: 'Введите название', addLinkSuccess: 'Ссылка добавлена', linkDeleted: 'Ссылка удалена'
  },
  ar: {
    linksTitle: 'روابط سريعة', linksViewGrid: 'شبكة', linksViewList: 'قائمة', addLink: 'إضافة',
    linkName: 'الاسم', linkUrl: 'الرابط', confirmAdd: 'إضافة', cancel: 'إلغاء', deleteConfirm: 'حذف الرابط؟',
    linkNamePlaceholder: 'مثال: Google', linkUrlPlaceholder: 'https://...', emptyLinks: 'لا توجد روابط. انقر "إضافة".',
    addLinkEmptyName: 'أدخل اسماً', addLinkSuccess: 'تمت إضافة الرابط', linkDeleted: 'تم حذف الرابط'
  }
};
const { t } = useI18n(translations);

const links = ref([]);
const linksView = ref(localStorage.getItem('links_view') || 'grid');
const addLinkDialogVisible = ref(false);
const newLinkName = ref('');
const newLinkUrl = ref('');
const failedIcons = ref({});

const linkColors = ['#409eff', '#67c23a', '#e6a23c', '#f56c6c', '#909399', '#a855f7', '#06b6d4', '#f97316'];
const defaultLinks = [
  { id: Date.now() + 1, name: 'GitHub', url: 'https://github.com', color: '#303133' },
  { id: Date.now() + 2, name: 'Bilibili', url: 'https://www.bilibili.com', color: '#fb7299' },
  { id: Date.now() + 3, name: 'Google', url: 'https://www.google.com', color: '#4285f4' }
];

const loadLinks = () => {
  try {
    const saved = localStorage.getItem('quick_links');
    links.value = saved ? JSON.parse(saved) : [...defaultLinks];
  } catch {
    links.value = [...defaultLinks];
  }
};

const saveLinks = () => {
  localStorage.setItem('quick_links', JSON.stringify(links.value));
};

const openLink = (url) => {
  window.open(url, '_blank');
};

const getFaviconUrl = (url) => {
  try {
    return `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=32`;
  } catch {
    return '';
  }
};

const handleIconError = (id) => {
  failedIcons.value[id] = true;
};

const getHost = (url) => {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
};

const removeLink = (id) => {
  ElMessageBox.confirm(t.value.deleteConfirm, '', {
    confirmButtonText: t.value.confirmAdd,
    cancelButtonText: t.value.cancel,
    type: 'warning'
  }).then(() => {
    links.value = links.value.filter((l) => l.id !== id);
    saveLinks();
    ElMessage.success(t.value.linkDeleted);
  }).catch(() => {});
};

const confirmAddLink = () => {
  if (!newLinkName.value.trim()) {
    ElMessage.warning(t.value.addLinkEmptyName);
    return;
  }
  let url = newLinkUrl.value.trim();
  if (!/^https?:\/\//i.test(url)) {
    url = 'https://' + url;
  }
  links.value.push({
    id: Date.now(),
    name: newLinkName.value.trim(),
    url,
    color: linkColors[links.value.length % linkColors.length]
  });
  saveLinks();
  ElMessage.success(t.value.addLinkSuccess);
  newLinkName.value = '';
  newLinkUrl.value = '';
  addLinkDialogVisible.value = false;
};

watch(linksView, (val) => {
  localStorage.setItem('links_view', val);
});

loadLinks();
</script>
