<template>
  <div class="pixel-card">
    <h2 class="card-title">{{ t.title }}</h2>

    <!-- 上传区 -->
    <div
      class="drop-zone"
      :class="{ dragging, hasImage }"
      @click="fileInput?.click()"
      @dragover.prevent="dragging = true"
      @dragleave.prevent="dragging = false"
      @drop.prevent="onDrop"
    >
      <input
        ref="fileInput"
        type="file"
        accept="image/png,image/jpeg,image/gif"
        hidden
        @change="onFileChange"
      />
      <template v-if="!hasImage">
        <el-icon :size="32" color="#909399"><UploadFilled /></el-icon>
        <p class="drop-text">{{ t.dropHint }}</p>
        <p class="drop-sub">{{ t.dropSub }}</p>
      </template>
      <template v-else>
        <img :src="originalUrl" alt="origin" class="origin-preview" />
        <span class="change-text">{{ t.changeImage }}</span>
      </template>
    </div>

    <!-- 转换中 -->
    <div v-if="loading" class="converting">
      <el-icon class="is-loading" :size="22" color="#409eff"><Loading /></el-icon>
      <span>{{ t.converting }}</span>
    </div>

    <!-- 结果：16 / 32 像素图 -->
    <div v-else-if="hasResult" class="result-area">
      <div class="pixel-item">
        <span class="pixel-label">16 × 16</span>
        <div class="pixel-view">
          <img :src="url16" alt="16x16" class="pixel-img" />
        </div>
        <el-button size="small" type="primary" plain @click="exportPng(16)">
          {{ t.export }}
        </el-button>
      </div>
      <div class="pixel-item">
        <span class="pixel-label">32 × 32</span>
        <div class="pixel-view">
          <img :src="url32" alt="32x32" class="pixel-img" />
        </div>
        <el-button size="small" type="primary" plain @click="exportPng(32)">
          {{ t.export }}
        </el-button>
      </div>
    </div>

    <!-- 错误提示 -->
    <p v-if="errorText" class="error-text">{{ errorText }}</p>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { UploadFilled, Loading } from '@element-plus/icons-vue';
import { useI18n } from '../../composables/useI18n';
import { convertImage } from '../../api';

const translations = {
  en: {
    title: 'Pixel Art Converter',
    dropHint: 'Click or drag an image here',
    dropSub: 'PNG / JPG / GIF, up to 5MB',
    changeImage: 'Click to change image',
    converting: 'Converting…',
    export: 'Export PNG',
    errorFile: 'Unsupported file type or too large (max 5MB).',
    errorApi: 'Conversion failed, please make sure the backend is online.'
  },
  zh: {
    title: '像素图转换',
    dropHint: '点击或拖拽图片到此处',
    dropSub: '支持 PNG / JPG / GIF，最大 5MB',
    changeImage: '点击更换图片',
    converting: '转换中…',
    export: '导出 PNG',
    errorFile: '文件类型不支持或超过 5MB 限制。',
    errorApi: '转换失败，请确认后端已在线。'
  },
  fr: {
    title: 'Convertisseur Pixel Art',
    dropHint: 'Cliquez ou glissez une image ici',
    dropSub: 'PNG / JPG / GIF, 5 Mo max',
    changeImage: 'Cliquer pour changer',
    converting: 'Conversion…',
    export: 'Exporter PNG',
    errorFile: 'Type de fichier non pris en charge ou > 5 Mo.',
    errorApi: 'Échec de la conversion, vérifiez le backend.'
  },
  es: {
    title: 'Convertidor de Píxeles',
    dropHint: 'Haz clic o arrastra una imagen aquí',
    dropSub: 'PNG / JPG / GIF, máx. 5 MB',
    changeImage: 'Clic para cambiar',
    converting: 'Convirtiendo…',
    export: 'Exportar PNG',
    errorFile: 'Tipo de archivo no soportado o > 5 MB.',
    errorApi: 'Error al convertir, comprueba el backend.'
  },
  pt: {
    title: 'Conversor de Pixel Art',
    dropHint: 'Clique ou arraste uma imagem aqui',
    dropSub: 'PNG / JPG / GIF, máx. 5 MB',
    changeImage: 'Clique para trocar',
    converting: 'Convertendo…',
    export: 'Exportar PNG',
    errorFile: 'Tipo de arquivo não suportado ou > 5 MB.',
    errorApi: 'Falha na conversão, verifique o backend.'
  },
  ru: {
    title: 'Конвертер пиксель-арта',
    dropHint: 'Нажмите или перетащите изображение',
    dropSub: 'PNG / JPG / GIF, до 5 МБ',
    changeImage: 'Нажмите, чтобы изменить',
    converting: 'Преобразование…',
    export: 'Экспорт PNG',
    errorFile: 'Неподдерживаемый тип или больше 5 МБ.',
    errorApi: 'Ошибка преобразования, проверьте бэкенд.'
  },
  ar: {
    title: 'محوّل البكسل آرت',
    dropHint: 'انقر أو اسحب صورة هنا',
    dropSub: 'PNG / JPG / GIF، حتى 5 م.ب',
    changeImage: 'انقر للتغيير',
    converting: 'جارٍ التحويل…',
    export: 'تصدير PNG',
    errorFile: 'نوع الملف غير مدعوم أو أكبر من 5 م.ب.',
    errorApi: 'فشل التحويل، تأكد من اتصال الخادم.'
  }
};
const { t } = useI18n(translations);

const fileInput = ref(null);
const dragging = ref(false);
const loading = ref(false);
const errorText = ref('');
const file = ref(null);
const originalUrl = ref('');
const blob16 = ref(null);
const blob32 = ref(null);

const hasImage = computed(() => !!file.value);
const hasResult = computed(() => blob16.value && blob32.value);
const url16 = computed(() => (blob16.value ? URL.createObjectURL(blob16.value) : ''));
const url32 = computed(() => (blob32.value ? URL.createObjectURL(blob32.value) : ''));

const resetErrors = () => {
  errorText.value = '';
};

const validateFile = (f) => {
  if (!f) return false;
  if (!['image/png', 'image/jpeg', 'image/gif'].includes(f.type)) return false;
  if (f.size > 5 * 1024 * 1024) return false;
  return true;
};

const handleFile = async (f) => {
  resetErrors();
  if (!validateFile(f)) {
    errorText.value = t.value.errorFile;
    return;
  }
  // 清理旧对象 URL
  if (originalUrl.value) URL.revokeObjectURL(originalUrl.value);
  if (blob16.value) URL.revokeObjectURL(url16.value);
  if (blob32.value) URL.revokeObjectURL(url32.value);

  file.value = f;
  originalUrl.value = URL.createObjectURL(f);
  blob16.value = null;
  blob32.value = null;

  loading.value = true;
  try {
    // 并行请求 16 与 32 两种尺寸
    const [b16, b32] = await Promise.all([convertImage(f, 16), convertImage(f, 32)]);
    blob16.value = b16;
    blob32.value = b32;
    ElMessage.success('16×16 / 32×32 ✓');
  } catch (e) {
    errorText.value = t.value.errorApi;
    console.warn('像素转换失败:', e);
  } finally {
    loading.value = false;
  }
};

const onFileChange = (e) => {
  handleFile(e.target.files?.[0]);
  e.target.value = ''; // 允许重复选择同一文件
};

const onDrop = (e) => {
  dragging.value = false;
  handleFile(e.dataTransfer?.files?.[0]);
};

// 导出：把像素小图放大绘制到 canvas（关闭平滑保持像素边缘），下载 PNG
const exportPng = (size) => {
  const blob = size === 16 ? blob16.value : blob32.value;
  if (!blob) return;
  const url = URL.createObjectURL(blob);
  const img = new Image();
  img.onload = () => {
    const scale = 10; // 放大 10 倍导出，方便查看
    const canvas = document.createElement('canvas');
    canvas.width = size * scale;
    canvas.height = size * scale;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    URL.revokeObjectURL(url);

    const out = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = out;
    a.download = `pixel-${size}x${size}.png`;
    a.click();
  };
  img.onerror = () => {
    URL.revokeObjectURL(url);
    ElMessage.error(t.value.errorApi);
  };
  img.src = url;
};
</script>

<style scoped>
.pixel-card {
  max-width: 720px;
  padding: 28px 24px;
}

.card-title {
  margin: 0 0 20px;
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

/* 上传区 */
.drop-zone {
  border: 2px dashed #c0c4cc;
  border-radius: 12px;
  padding: 32px 16px;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.2s, background-color 0.2s;
}

.drop-zone:hover,
.drop-zone.dragging {
  border-color: #409eff;
  background: rgba(64, 158, 255, 0.06);
}

.drop-zone.hasImage {
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.drop-text {
  margin: 8px 0 0;
  font-size: 15px;
  color: #606266;
}

.drop-sub {
  margin: 4px 0 0;
  font-size: 12px;
  color: #a8abb2;
}

.origin-preview {
  max-width: 200px;
  max-height: 120px;
  border-radius: 8px;
  object-fit: contain;
}

.change-text {
  font-size: 13px;
  color: #909399;
}

/* 转换中 */
.converting {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 20px;
  color: #606266;
  font-size: 14px;
}

/* 结果区 */
.result-area {
  margin-top: 24px;
  display: flex;
  gap: 32px;
  flex-wrap: wrap;
  justify-content: center;
}

.pixel-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.pixel-label {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.pixel-view {
  width: 160px;
  height: 160px;
  border-radius: 8px;
  background: repeating-conic-gradient(#f0f0f0 0% 25%, #ffffff 0% 50%) 0 0 / 16px 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 1px solid #e4e7ed;
}

/* 像素点图放大显示，保持像素边缘 */
.pixel-img {
  width: 100%;
  height: 100%;
  object-fit: fill;
  image-rendering: pixelated;
}

/* 错误提示 */
.error-text {
  margin-top: 16px;
  text-align: center;
  font-size: 13px;
  color: #f56c6c;
}

/* 暗色主题 */
.dark .card-title,
.dark .pixel-label {
  color: #e5e7eb;
}

.dark .drop-zone {
  border-color: #4a4d55;
}

.dark .drop-zone:hover,
.dark .drop-zone.dragging {
  border-color: #7fb5ff;
  background: rgba(64, 158, 255, 0.12);
}

.dark .drop-text,
.dark .converting {
  color: #a8abb2;
}

.dark .drop-sub {
  color: #6b6e76;
}

.dark .pixel-view {
  border-color: #3a3c42;
  background: repeating-conic-gradient(#2a2b2f 0% 25%, #232529 0% 50%) 0 0 / 16px 16px;
}

.dark .change-text {
  color: #8a8d94;
}
</style>
