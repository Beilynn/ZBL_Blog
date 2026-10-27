// 项目页外链卡片数据：开源项目与学习资料
export type Project = {
  id: string;
  name: string;
  description: string;
  icon: string;
  url: string;
  // github 显示 GitHub 图标，link 显示外链跳转图标
  kind: 'github' | 'link';
  tags: string[];
};

export const projectsData: Project[] = [
  {
    id: 'psyhot',
    name: 'PsyHOT 心理学前沿动态',
    description:
      '心理学研究每日精选与日报，综合学界与业界动态，按日期汇总研究摘要、来源出处与原文入口，适合持续跟踪最新心理学研究进展。',
    icon: '🧠',
    url: 'https://psyhot.cn/',
    kind: 'link',
    tags: ['心理学', '研究动态', '每日精选'],
  },
  {
    id: 'deeptutor',
    name: 'DeepTutor',
    description:
      '港大 HKUDS 开源的智能体学习工作台，支持上传文档构建知识库问答、多智能体协同解题、个性化习题生成与学习可视化，用于自主学习与备考。',
    icon: '🎓',
    url: 'https://github.com/HKUDS/DeepTutor',
    kind: 'github',
    tags: ['开源项目', 'AI 学习', 'RAG'],
  },
  {
    id: 'lightrag',
    name: 'LightRAG',
    description:
      '港大 HKUDS 开源的轻量级知识图谱 RAG 框架，将文档解析为实体与关系网络，结合图谱双层检索与向量检索，并支持增量更新，兼顾检索准确性与效率。',
    icon: '🕸️',
    url: 'https://github.com/HKUDS/LightRAG',
    kind: 'github',
    tags: ['开源项目', 'RAG', '知识图谱'],
  },
  {
    id: 'bettafish',
    name: 'BettaFish（微舆）',
    description:
      '从零实现的多智能体舆情分析系统，自动采集国内外主流社媒数据，完成信息检索、情绪分析与趋势研判，并生成可视化舆情报告辅助判断。',
    icon: '🐟',
    url: 'https://github.com/666ghj/BettaFish',
    kind: 'github',
    tags: ['开源项目', '多智能体', '舆情分析'],
  },
  {
    id: 'jspsych-cn',
    name: 'jsPsych v8 中文文档',
    description:
      'jsPsych 是在浏览器中构建心理学行为实验的 JavaScript 框架，本中文文档对应 v8 版本，覆盖反应时任务、问卷量表、时间线编排与各类实验插件用法。',
    icon: '🧪',
    url: 'https://shaobin-jiang.github.io/jsPsych-Chinese-Documentation/v8/',
    kind: 'link',
    tags: ['学习资料', '实验编程', '中文文档'],
  },
  {
    id: 'emollm',
    name: 'EmoLLM',
    description:
      '基于开源大模型指令微调得到的心理健康大模型，覆盖理解情绪、情感支持与心理辅导的完整链路，整合情绪调节、情感表达与情感体验等能力。',
    icon: '💛',
    url: 'https://github.com/SmartFlowAI/EmoLLM',
    kind: 'github',
    tags: ['开源项目', '心理健康', '大模型微调'],
  },
  {
    id: 'vllm',
    name: 'vLLM',
    description:
      '源自加州大学伯克利分校的高吞吐、显存高效大模型推理与服务库，以 PagedAttention 高效管理注意力键值显存、连续批处理提升并发吞吐，提供 OpenAI 兼容接口，支持主流开源模型与多 GPU 并行部署。',
    icon: '⚡',
    url: 'https://github.com/vllm-project/vllm',
    kind: 'github',
    tags: ['开源项目', '大模型推理', '服务部署'],
  },
];
