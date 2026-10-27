// 归档页「外链作品」数据
// category：顶部筛选栏的大类（类似文件夹）；tags：卡片上的内容要点小标签，仅展示不参与筛选
export type FeaturedLink = {
  id: string;
  name: string;
  description: string;
  icon: string;
  // 节点横幅封面图（public 下相对路径）；缺省时回退为 emoji 渐变横幅
  coverImage?: string;
  // 归档大类：个人简历 / 文献阅读 / 项目
  category: string;
  // 内容要点小标签（卡片下方胶囊展示，不参与顶部筛选）
  tags: string[];
  url: string;
  kind: 'github' | 'link';
};

export const featuredLinks: FeaturedLink[] = [
  {
    id: 'resume',
    name: '个人简历 · Beilynn',
    description:
      '应用心理学专业个人简历，涵盖教育背景、专业技能、社会实践经历与代表项目，可据此了解学习轨迹与能力结构。',
    icon: '📄',
    coverImage: '/works/resume-cover.png',
    category: '个人简历',
    tags: ['教育背景', '项目经历'],
    url: 'https://beilynn.github.io/Resume/',
    kind: 'link',
  },
  {
    id: 'ai-consult',
    name: 'AI 问诊安全工具 · 网络疑病症科普站',
    description:
      '围绕网络疑病症（Cyberchondria）与健康信息素养的循证科普站点，内置自评清单与安全边界问诊模板，强调信息整理不替代临床诊断。',
    icon: '🩺',
    coverImage: '/works/ai-consult-hero.png',
    category: '项目',
    tags: ['健康信息素养', '循证科普', 'AI 工具'],
    url: 'https://beilynn.github.io/AI_assisted_consultation/',
    kind: 'link',
  },
];
