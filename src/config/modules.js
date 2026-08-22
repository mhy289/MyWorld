import IpCard from '../components/home/IpCard.vue';
import WeatherCard from '../components/home/WeatherCard.vue';
import LinksCard from '../components/home/LinksCard.vue';
import QuoteCard from '../components/home/QuoteCard.vue';
import TimeCard from '../components/home/TimeCard.vue';
import StatsCard from '../components/home/StatsCard.vue';
import VideoCard from '../components/home/VideoCard.vue';
import VoteCard from '../components/home/VoteCard.vue';
import DevLogCard from '../components/home/DevLogCard.vue';
import PixelArtCard from '../components/home/PixelArtCard.vue';
import MessageBoardCard from '../components/home/MessageBoardCard.vue';

// 两级导航配置：cat = 顶部分类，item = 左侧子项
// label 为多语言对象，key 对应 en/zh/fr/es/pt/ru/ar
export const modules = [
  {
    key: 'info',
    label: { en: 'Info', zh: '信息', fr: 'Infos', es: 'Información', pt: 'Informação', ru: 'Инфо', ar: 'معلومات' },
    items: [
      { key: 'ip', label: { en: 'IP Lookup', zh: 'IP 查询', fr: 'Adresse IP', es: 'Consulta IP', pt: 'Consulta IP', ru: 'IP-адрес', ar: 'بحث IP' }, component: IpCard },
      { key: 'weather', label: { en: 'Weather', zh: '天气', fr: 'Météo', es: 'Clima', pt: 'Clima', ru: 'Погода', ar: 'الطقس' }, component: WeatherCard },
      { key: 'quote', label: { en: 'Daily Quote', zh: '每日一言', fr: 'Citation', es: 'Cita', pt: 'Citação', ru: 'Цитата', ar: 'اقتباس' }, component: QuoteCard },
      { key: 'time', label: { en: 'Time', zh: '时间', fr: 'Heure', es: 'Hora', pt: 'Hora', ru: 'Время', ar: 'الوقت' }, component: TimeCard }
    ]
  },
  {
    key: 'tools',
    label: { en: 'Tools', zh: '工具', fr: 'Outils', es: 'Herramientas', pt: 'Ferramentas', ru: 'Инструменты', ar: 'أدوات' },
    items: [
      { key: 'links', label: { en: 'Quick Links', zh: '常用链接', fr: 'Liens rapides', es: 'Enlaces', pt: 'Links', ru: 'Ссылки', ar: 'روابط' }, component: LinksCard },
      { key: 'pixel', label: { en: 'Pixel Art', zh: '像素图', fr: 'Pixel Art', es: 'Pixel Art', pt: 'Pixel Art', ru: 'Пиксель-арт', ar: 'بكسل آرت' }, component: PixelArtCard }
    ]
  },
  {
    key: 'data',
    label: { en: 'Data', zh: '数据', fr: 'Données', es: 'Datos', pt: 'Dados', ru: 'Данные', ar: 'بيانات' },
    items: [
      { key: 'stats', label: { en: 'Visit Stats', zh: '访问统计', fr: 'Statistiques', es: 'Estadísticas', pt: 'Estatísticas', ru: 'Статистика', ar: 'إحصائيات' }, component: StatsCard }
    ]
  },
  {
    key: 'media',
    label: { en: 'Media', zh: '媒体', fr: 'Média', es: 'Medios', pt: 'Mídia', ru: 'Медиа', ar: 'وسائط' },
    items: [
      { key: 'video', label: { en: 'Featured Video', zh: '精选视频', fr: 'Vidéo', es: 'Video', pt: 'Vídeo', ru: 'Видео', ar: 'فيديو' }, component: VideoCard }
    ]
  },
  {
    key: 'interact',
    label: { en: 'Interaction', zh: '互动', fr: 'Interaction', es: 'Interacción', pt: 'Interação', ru: 'Взаимодействие', ar: 'تفاعل' },
    items: [
      { key: 'vote', label: { en: 'Vote', zh: '投票', fr: 'Vote', es: 'Votar', pt: 'Votar', ru: 'Голосование', ar: 'تصويت' }, component: VoteCard },
      { key: 'message', label: { en: 'Message Board', zh: '留言板', fr: "Livre d'or", es: 'Muro de mensajes', pt: 'Mural de mensagens', ru: 'Гостевая книга', ar: 'لوحة الرسائل' }, component: MessageBoardCard }
    ]
  },
  {
    key: 'blog',
    label: { en: 'Blog', zh: '博客', fr: 'Blog', es: 'Blog', pt: 'Blog', ru: 'Блог', ar: 'مدونة' },
    items: [
      { key: 'devlog', label: { en: 'Development Journey', zh: '开发历程', fr: 'Parcours de développement', es: 'Trayectoria de desarrollo', pt: 'Jornada de desenvolvimento', ru: 'Путь разработки', ar: 'مسار التطوير' }, component: DevLogCard }
    ]
  }
];

// 根据 key 查找分类
export const findCategory = (key) => modules.find((m) => m.key === key) || null;

// 获取默认位置（第一个分类的第一个子项）
export const defaultPosition = () => ({
  cat: modules[0].key,
  item: modules[0].items[0].key
});
