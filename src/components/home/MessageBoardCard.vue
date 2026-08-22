<template>
  <el-card class="message-card">
    <template #header>
      <div class="flex items-center gap-2">
        <el-icon :size="18" color="#409eff"><ChatDotRound /></el-icon>
        <span class="font-medium">留言板</span>
        <span v-if="backendAvailable" class="mode-tag online">在线模式</span>
        <span v-else class="mode-tag offline">后端未连接</span>
      </div>
    </template>

    <div class="editor">
      <div class="editor-row">
        <el-input
          v-model="nickname"
          placeholder="你的昵称"
          maxlength="64"
          class="nickname-input"
          :disabled="!backendAvailable"
        />
      </div>
      <el-input
        v-model="content"
        type="textarea"
        :rows="3"
        placeholder="说点什么吧…"
        maxlength="2000"
        show-word-limit
        resize="none"
        :disabled="!backendAvailable"
      />
      <div class="editor-footer">
        <span class="hint">{{ backendAvailable ? '畅所欲言' : '后端未连接，无法留言' }}</span>
        <el-button type="primary" :loading="submitting" :disabled="!canSubmit" @click="send">
          发送留言
        </el-button>
      </div>
    </div>

    <el-divider />

    <div v-if="loading" class="empty">加载中…</div>
    <div v-else-if="messages.length === 0" class="empty">还没有留言，快来抢沙发吧</div>
    <div v-else class="list">
      <div v-for="msg in messages" :key="msg.id" class="item">
        <div class="item-head">
          <span class="floor">#{{ msg.id }}</span>
          <span class="nickname">{{ msg.nickname }}</span>
          <span class="time">{{ msg.createdAt }}</span>
        </div>
        <div class="content">{{ msg.content }}</div>
      </div>
    </div>
  </el-card>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { ChatDotRound } from '@element-plus/icons-vue';
import { getMessages, submitMessage } from '../../api';

const NICKNAME_KEY = 'message_board_nickname';

const nickname = ref(localStorage.getItem(NICKNAME_KEY) || '');
const content = ref('');
const messages = ref([]);
const backendAvailable = ref(false);
const loading = ref(false);
const submitting = ref(false);

const canSubmit = computed(
  () => backendAvailable.value && !submitting.value && nickname.value.trim() !== '' && content.value.trim() !== ''
);

const loadMessages = async () => {
  loading.value = true;
  try {
    messages.value = await getMessages();
    backendAvailable.value = true;
  } catch (e) {
    console.warn('获取留言失败:', e);
    backendAvailable.value = false;
  } finally {
    loading.value = false;
  }
};

const send = async () => {
  const name = nickname.value.trim();
  const text = content.value.trim();
  if (!name || !text) {
    ElMessage.warning('请填写昵称和留言内容');
    return;
  }
  submitting.value = true;
  try {
    await submitMessage(name, text);
    localStorage.setItem(NICKNAME_KEY, name);
    content.value = '';
    ElMessage.success('留言成功');
    await loadMessages();
  } catch (e) {
    console.warn('留言提交失败:', e);
    ElMessage.error(e.message || '留言失败，请稍后重试');
  } finally {
    submitting.value = false;
  }
};

onMounted(loadMessages);
</script>

<style scoped>
.editor {
  margin-bottom: 8px;
}

.editor-row {
  margin-bottom: 10px;
}

.nickname-input {
  max-width: 320px;
}

.editor-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 10px;
  flex-wrap: wrap;
}

.hint {
  font-size: 12px;
  color: #909399;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.item {
  border-radius: 8px;
  background: #f5f7fa;
  padding: 12px 14px;
  transition: background 0.3s;
}

.dark .item {
  background: #26282e;
}

.item-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
  flex-wrap: wrap;
}

.floor {
  display: inline-block;
  padding: 1px 8px;
  border-radius: 12px;
  background: #409eff;
  color: #fff;
  font-size: 12px;
  font-weight: 600;
}

.nickname {
  font-weight: 600;
  color: #303133;
}

.dark .nickname {
  color: #e5e7eb;
}

.time {
  margin-left: auto;
  font-size: 12px;
  color: #909399;
}

.content {
  white-space: pre-wrap;
  word-break: break-word;
  color: #606266;
  line-height: 1.6;
}

.dark .content {
  color: #c9cdd4;
}

.empty {
  text-align: center;
  color: #909399;
  padding: 30px 0;
}

.mode-tag {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 20px;
  font-size: 12px;
  margin-left: 8px;
}

.mode-tag.online {
  background: #e6f7e6;
  color: #389e0d;
  border: 1px solid #b7eb8f;
}

.dark .mode-tag.online {
  background: rgba(56, 158, 13, 0.15);
  color: #73d13d;
  border-color: rgba(56, 158, 13, 0.3);
}

.mode-tag.offline {
  background: #fff7e6;
  color: #d48806;
  border: 1px solid #ffd591;
}

.dark .mode-tag.offline {
  background: rgba(212, 136, 6, 0.15);
  color: #ffc53d;
  border-color: rgba(212, 136, 6, 0.3);
}
</style>
