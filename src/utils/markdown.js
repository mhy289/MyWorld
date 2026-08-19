// 轻量 markdown → HTML 渲染器（零依赖）
// 支持：标题、段落、分割线、引用、无序/有序列表、代码块、行内代码/粗体/斜体/链接
// 安全性：先转义 HTML 再解析，避免 XSS

function inline(text) {
  return text
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
}

export function renderMarkdown(md) {
  if (!md) return '';

  // 先转义 HTML，防止注入
  const escaped = md.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const lines = escaped.split('\n');
  const html = [];
  let i = 0;
  let listType = null; // 'ul' | 'ol'
  let inCode = false;
  let codeBuf = [];

  const closeList = () => {
    if (listType) {
      html.push(`</${listType}>`);
      listType = null;
    }
  };

  while (i < lines.length) {
    const line = lines[i];

    // 代码块
    if (/^```/.test(line)) {
      if (inCode) {
        html.push('<pre><code>' + codeBuf.join('\n') + '</code></pre>');
        codeBuf = [];
        inCode = false;
      } else {
        closeList();
        inCode = true;
      }
      i++;
      continue;
    }
    if (inCode) {
      codeBuf.push(line);
      i++;
      continue;
    }

    // 空行
    if (!line.trim()) {
      closeList();
      i++;
      continue;
    }

    // 标题
    const h = line.match(/^(#{1,6})\s+(.*)/);
    if (h) {
      closeList();
      const level = h[1].length;
      html.push(`<h${level}>${inline(h[2])}</h${level}>`);
      i++;
      continue;
    }

    // 分割线
    if (/^(-{3,}|\*{3,})$/.test(line.trim())) {
      closeList();
      html.push('<hr>');
      i++;
      continue;
    }

    // 引用
    if (/^>\s?/.test(line)) {
      closeList();
      const buf = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        buf.push(lines[i].replace(/^>\s?/, ''));
        i++;
      }
      html.push('<blockquote><p>' + buf.map(inline).join('<br>') + '</p></blockquote>');
      continue;
    }

    // 无序列表
    if (/^[-*+]\s+/.test(line)) {
      if (listType !== 'ul') {
        closeList();
        html.push('<ul>');
        listType = 'ul';
      }
      html.push('<li>' + inline(line.replace(/^[-*+]\s+/, '')) + '</li>');
      i++;
      continue;
    }

    // 有序列表
    if (/^\d+\.\s+/.test(line)) {
      if (listType !== 'ol') {
        closeList();
        html.push('<ol>');
        listType = 'ol';
      }
      html.push('<li>' + inline(line.replace(/^\d+\.\s+/, '')) + '</li>');
      i++;
      continue;
    }

    // 普通段落（合并相邻非空行）
    closeList();
    const buf = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^(#{1,6})\s/.test(lines[i]) &&
      !/^```/.test(lines[i]) &&
      !/^[-*+]\s/.test(lines[i]) &&
      !/^\d+\.\s/.test(lines[i]) &&
      !/^>\s?/.test(lines[i])
    ) {
      buf.push(lines[i]);
      i++;
    }
    html.push('<p>' + buf.map(inline).join('<br>') + '</p>');
  }

  closeList();
  if (inCode) html.push('<pre><code>' + codeBuf.join('\n') + '</code></pre>');
  return html.join('\n');
}
