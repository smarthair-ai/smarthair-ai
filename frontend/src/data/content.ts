// SmartHair AI — 全站数据，基于研究报告
// 所有数值均来自《基于人工智能与AR技术的理发店智能发型设计系统研究》

export const heroData = {
  title: "告别「凭感觉」",
  titleHighlight: "AI + AR 重新定义发型设计",
  subtitle:
    "3 秒读懂你的脸型与发质，AR 多角度预览剪发效果，连理发师都照着施工 — 再也不用赌运气。",
  ctas: [
    { label: "立即体验 Demo", href: "#demo", primary: true },
    { label: "预约方案演示", href: "#contact", primary: false },
  ],
  stats: [
    { value: "30+", label: "发型数据库", sub: "规划800+" },
    { value: "3秒", label: "AI分析", sub: "自动识别" },
    { value: "360°", label: "AR预览", sub: "三视角" },
    { value: "3-5元", label: "深度方案", sub: "单次解锁" },
  ],
  arViews: [
    { label: "正面视角", desc: "刘海修饰 · 脸型轮廓 · 染发色调" },
    { label: "45°侧面", desc: "颅顶蓬松 · 碎发修饰 · 层次衔接" },
    { label: "后脑视角", desc: "后部层次 · 发尾长短 · 狼尾结构" },
  ],
};

export const painPoints = [
  {
    icon: "MessageSquare",
    pain: "沟通靠嘴说",
    desc: "「显脸小、韩系、蓬松」等口语化描述易产生理解偏差",
  },
  {
    icon: "ImageOff",
    pain: "参考图「卖家秀」",
    desc: "模特五官、发质、灯光与普通消费者差异大，还原度低",
  },
  {
    icon: "UserX",
    pain: "理发师发挥不稳定",
    desc: "新人理发师缺乏充足造型适配经验，服务效率参差不齐",
  },
  {
    icon: "EyeOff",
    pain: "后脑勺盲区",
    desc: "传统沟通缺失视角，无法提前预览后脑层次与发尾结构",
  },
];

export const solutions = [
  {
    icon: "ScanFace",
    title: "AI 客观分析脸型 / 发质",
    desc: "五维度识别，告别主观判断",
    detail:
      "自动识别脸型、头型、颅顶高度、发质软硬、发际线高低，将碎片化经验转化为标准化数据。",
  },
  {
    icon: "Glasses",
    title: "AR 实时渲染所见即所得",
    desc: "正面 / 侧面 / 后脑三视角实时预览",
    detail:
      "数字发型实时贴合真人头部影像，剪发前直观展示完整造型，消除信息差。",
  },
  {
    icon: "ClipboardList",
    title: "标准化施工参数",
    desc: "剪裁层次 · 烫发杠具 · 护理建议",
    detail:
      "大模型输出理发师专用剪裁、烫染施工细则与居家护理教程，降低沟通门槛。",
  },
  {
    icon: "RotateCcw",
    title: "360° 无死角预览",
    desc: "连后脑勺都能提前看到效果",
    detail:
      "正面看刘海修饰，侧面看颅顶蓬松，后脑看层次结构，全方位可视化预览。",
  },
];

export const architecture = [
  {
    layer: "L1",
    name: "数据采集层",
    icon: "Camera",
    color: "purple",
    detail: {
      title: "智能镜面摄像头 + 素材库",
      points: [
        "镜面摄像头采集正脸 / 侧脸 / 后脑影像",
        "批量采集网络公开发型图文素材",
        "按韩式、法式、日系、男士商务等关键词分类检索",
        "用户扫描影像仅用于实时分析，加密存储、定期清理",
      ],
    },
  },
  {
    layer: "L2",
    name: "AI视觉分析层",
    icon: "ScanFace",
    color: "cyan",
    detail: {
      title: "五维度自动识别",
      points: [
        "脸型识别：圆脸 / 方脸 / 长脸 / 菱形脸 / 鹅蛋脸",
        "头型识别：颅顶高度测量",
        "发质识别：细软 / 粗硬 / 自然卷",
        "发际线识别：高 / 正常，决定刘海方案",
      ],
    },
  },
  {
    layer: "L3",
    name: "发型数据库层",
    icon: "Database",
    color: "purple",
    detail: {
      title: "30款已上线 · 规划800+",
      points: [
        "女性长发 8款 · 女性中短发 12款",
        "男士短发/烫染 8款 · 小众潮流 2款",
        "8项专业字段：名称/脸型/人群/发质/特点/难度/场景/施工",
        "半自动采集 + AI结构化处理 + 人工复核",
      ],
    },
  },
  {
    layer: "L4",
    name: "大模型分析层",
    icon: "Brain",
    color: "cyan",
    detail: {
      title: "多权重综合匹配算法",
      points: [
        "脸型适配 — 权重 30%",
        "发质适配 — 权重 25%",
        "使用场景匹配 — 权重 20%",
        "用户风格偏好 — 权重 15%",
        "日常打理难度 — 权重 10%",
      ],
    },
  },
  {
    layer: "L5",
    name: "AR展示层",
    icon: "Glasses",
    color: "purple",
    detail: {
      title: "实时叠加 · 参数可调",
      points: [
        "数字发型实时贴合真人头部影像",
        "长度参数：耳下 / 下巴 / 锁骨 / 胸口",
        "卷度参数：微卷 / 大波浪 / 羊毛卷",
        "刘海参数：空气 / 八字 / 齐刘海",
        "发色参数：黑茶 / 冷灰 / 茶棕 / 栗棕",
      ],
    },
  },
  {
    layer: "L6",
    name: "双向交互层",
    icon: "Users",
    color: "cyan",
    detail: {
      title: "顾客端 + 理发师端双端同步",
      points: [
        "顾客端：扫码启动 → 扫描头部 → AR试戴 → 确认造型",
        "理发师端：查看专业施工参数 → 完成剪裁",
        "服务完成后留存用户偏好，下次到店快速匹配",
        "双端同步展示TOP3推荐与施工方案",
      ],
    },
  },
];

// ---- Demo Tabs 类型定义 ----
export interface RecommendContent {
  scenario: string;
  top1: { name: string; score: number; reason: string; difficulty: string; scene: string };
  candidates: { name: string; score: number; rank: number }[];
  weights: { name: string; value: number }[];
}
export interface ArContent {
  views: { label: string; desc: string }[];
  params: { label: string; options: string[] }[];
}
export interface ConstructionContent {
  sections: { title: string; icon: string; items: string[] }[];
}

export interface DemoTab {
  id: string;
  label: string;
  icon: string;
  content: RecommendContent | ArContent | ConstructionContent;
}

export const demoTabs: DemoTab[] = [
  {
    id: "recommend",
    label: "智能推荐",
    icon: "Sparkles",
    content: {
      scenario: "22岁 · 圆脸 · 细软发 · 学生",
      top1: {
        name: "韩式高层次长发",
        score: 92,
        reason: "八字刘海修饰颧骨，高层次增加颅顶蓬松度",
        difficulty: "中等",
        scene: "校园日常",
      },
      candidates: [
        { name: "韩式高层次长发", score: 92, rank: 1 },
        { name: "法式羊毛卷", score: 82, rank: 2 },
        { name: "日系锁骨发", score: 80, rank: 3 },
      ],
      weights: [
        { name: "脸型适配", value: 30 },
        { name: "发质适配", value: 25 },
        { name: "使用场景", value: 20 },
        { name: "风格偏好", value: 15 },
        { name: "打理难度", value: 10 },
      ],
    },
  },
  {
    id: "ar",
    label: "AR 虚拟试戴",
    icon: "Glasses",
    content: {
      views: [
        {
          label: "正面视角",
          desc: "观察刘海修饰效果、脸型轮廓优化、染发整体色调",
        },
        {
          label: "45°侧面视角",
          desc: "查看颅顶蓬松高度、脸侧碎发修饰、前后层次衔接",
        },
        {
          label: "后脑视角",
          desc: "展示后部层次、发尾长短、狼尾/波波头后区结构",
        },
      ],
      params: [
        { label: "长度", options: ["耳下", "下巴", "锁骨", "胸口"] },
        { label: "卷度", options: ["微卷", "大波浪", "羊毛卷"] },
        { label: "刘海", options: ["空气", "八字", "齐刘海"] },
        { label: "发色", options: ["黑茶", "冷灰", "茶棕", "栗棕"] },
      ],
    },
  },
  {
    id: "construction",
    label: "施工参数卡",
    icon: "ClipboardList",
    content: {
      sections: [
        {
          title: "剪裁层次",
          icon: "Scissors",
          items: [
            "高层次碎剪，顶区提升蓬松度",
            "八字刘海长度至颧骨，修饰脸型",
            "后区层次自然过渡，发尾柔和",
          ],
        },
        {
          title: "烫发方案",
          icon: "Flame",
          items: [
            "顶区：20mm 杠具，提升颅顶蓬松",
            "两侧：25mm 杠具，柔和线条",
            "冷烫工艺，保留发质弹性",
          ],
        },
        {
          title: "护理建议",
          icon: "HeartHandshake",
          items: [
            "吹干：先吹根部分3:7分线，逆发根吹蓬松",
            "定型：弹力素抓揉发尾，避免根部塌陷",
            "日常：隔天洗发，每周1次深层护理",
          ],
        },
      ],
    },
  },
];

export const businessModel = {
  b2b: {
    title: "B端赋能",
    icon: "Store",
    items: [
      { title: "门店服务标准化", desc: "统一造型设计标准，缩小门店技术差距" },
      { title: "新人培训辅助", desc: "为新人理发师提供标准化造型适配知识库" },
      { title: "会员系统对接", desc: "对接门店会员、预约、收银系统，一体化管理" },
      { title: "差异化科技体验", desc: "打造科技服务亮点，新增小额增值收入" },
    ],
  },
  b2c: {
    title: "C端体验",
    icon: "User",
    items: [
      { title: "免费基础推荐", desc: "AI基础单款发型推荐，零门槛体验" },
      { title: "3-5元深度方案", desc: "TOP3全套推荐 + AR试戴 + 施工参数 + 护理教程" },
      { title: "提前可视化", desc: "剪发前直观预览效果，降低试错成本" },
      { title: "专属打理方案", desc: "分步骤居家吹干、定型护理教程" },
    ],
  },
  pricingTable: [
    { feature: "AI基础单款发型推荐", free: true, paid: true },
    { feature: "TOP3全套最优发型方案", free: false, paid: true },
    { feature: "正面/侧面/后脑完整AR试戴", free: false, paid: true },
    { feature: "理发师专业施工参数", free: false, paid: true },
    { feature: "分步骤居家打理全套教程", free: false, paid: true },
  ],
};

export const cases = [
  {
    avatar: "♀",
    age: "22岁",
    gender: "女生",
    faceShape: "圆脸",
    hairType: "细软发",
    scene: "学生",
    recommendation: "韩式高层次长发",
    score: 92,
    reason: "八字刘海收窄脸型，侧面提升颅顶，后脑层次自然柔和",
    tags: ["高层次", "八字刘海", "校园日常"],
  },
  {
    avatar: "♂",
    age: "25岁",
    gender: "男生",
    faceShape: "方脸",
    hairType: "粗硬发",
    scene: "职场",
    recommendation: "纹理渐变飞机头",
    score: 88,
    reason: "弱化下颌硬朗线条，顶部蓬松纹理，两侧渐变清爽",
    tags: ["飞机头", "渐变", "职场干练"],
  },
];

// Demo 体验区 — 模拟数据
export const demoFaces = [
  { id: "round", label: "圆脸", desc: "增加纵向蓬松，推荐八字刘海、高层次" },
  { id: "square", label: "方脸", desc: "柔化下颌线条，推荐波浪卷、碎层次" },
  { id: "long", label: "长脸", desc: "增加横向视觉，搭配空气刘海、锁骨短发" },
  { id: "diamond", label: "菱形脸", desc: "修饰颧骨，侧分、八字刘海优先" },
  { id: "oval", label: "鹅蛋脸", desc: "适配绝大多数发型" },
];

export const demoHairTypes = [
  { id: "fine", label: "细软发", desc: "高颅顶、层次剪裁、纹理烫" },
  { id: "thick", label: "粗硬发", desc: "降低厚度、柔和线条" },
  { id: "curly", label: "自然卷", desc: "顺势造型，减少拉直操作" },
];

// 脸型 × 发质 → 推荐发型映射（模拟数据）
export const recommendations: Record<string, Record<string, Array<{
  name: string;
  score: number;
  reason: string;
  tags: string[];
}>>> = {
  round: {
    fine: [
      { name: "韩式高层次长发", score: 92, reason: "八字刘海修饰颧骨，高层次增加颅顶蓬松度", tags: ["高层次", "八字刘海"] },
      { name: "法式羊毛卷", score: 82, reason: "卷度增加发量感，柔和脸部轮廓", tags: ["羊毛卷", "法式"] },
      { name: "日系锁骨发", score: 80, reason: "锁骨长度拉长脸型，空气刘海减龄", tags: ["锁骨发", "空气刘海"] },
    ],
    thick: [
      { name: "法式波浪卷长发", score: 89, reason: "波浪卷柔化圆脸轮廓，降低发量厚重感", tags: ["波浪卷", "法式"] },
      { name: "韩式层次中长发", score: 85, reason: "层次打薄降低厚重，修饰脸型", tags: ["层次", "中长发"] },
      { name: "日系短发", score: 78, reason: "清爽短发拉长面部比例", tags: ["短发", "日系"] },
    ],
    curly: [
      { name: "自然卷高层次", score: 86, reason: "顺势卷度增加蓬松，高层次修饰脸型", tags: ["高层次", "自然卷"] },
      { name: "韩式波浪卷", score: 83, reason: "利用自然卷度打造波浪感", tags: ["波浪卷", "韩式"] },
      { name: "日系空气感长发", score: 79, reason: "空气感卷度柔和圆脸", tags: ["空气感", "长发"] },
    ],
  },
  square: {
    fine: [
      { name: "大波浪长发", score: 88, reason: "波浪卷柔化下颌硬朗线条", tags: ["大波浪", "长发"] },
      { name: "韩式碎层次", score: 84, reason: "碎层次柔和方脸轮廓", tags: ["碎层次", "韩式"] },
      { name: "法式八字刘海", score: 81, reason: "八字刘海遮盖下颌角", tags: ["八字刘海", "法式"] },
    ],
    thick: [
      { name: "纹理飞机头", score: 88, reason: "顶部蓬松纹理，两侧渐变清爽轮廓", tags: ["飞机头", "渐变"] },
      { name: "韩式碎层次中长发", score: 85, reason: "碎层次降低厚重，柔化方脸", tags: ["碎层次", "中长发"] },
      { name: "日系波浪短发", score: 80, reason: "波浪卷短发柔和下颌", tags: ["波浪", "短发"] },
    ],
    curly: [
      { name: "自然卷波浪", score: 85, reason: "顺势卷度柔化方脸轮廓", tags: ["自然卷", "波浪"] },
      { name: "韩式碎卷", score: 82, reason: "碎卷层次修饰下颌", tags: ["碎卷", "韩式"] },
      { name: "法式凌乱卷", score: 78, reason: "凌乱感卷发柔和硬朗线条", tags: ["凌乱卷", "法式"] },
    ],
  },
  long: {
    fine: [
      { name: "空气刘海锁骨发", score: 90, reason: "空气刘海增加横向视觉，锁骨长度平衡脸型", tags: ["空气刘海", "锁骨发"] },
      { name: "韩式蓬松短发", score: 85, reason: "蓬松短发增加面部宽度", tags: ["蓬松", "短发"] },
      { name: "法式波浪中长发", score: 82, reason: "波浪卷增加横向体积", tags: ["波浪", "中长发"] },
    ],
    thick: [
      { name: "空气刘海中长发", score: 87, reason: "空气刘海缩短脸型，中长发平衡比例", tags: ["空气刘海", "中长发"] },
      { name: "韩式层次短发", score: 84, reason: "层次短发增加面部宽度", tags: ["层次", "短发"] },
      { name: "日系蓬松锁骨发", score: 80, reason: "蓬松感增加横向视觉", tags: ["蓬松", "锁骨发"] },
    ],
    curly: [
      { name: "自然卷空气刘海", score: 86, reason: "空气刘海缩短脸型，自然卷增加宽度", tags: ["空气刘海", "自然卷"] },
      { name: "韩式蓬松卷", score: 83, reason: "蓬松卷度增加面部宽度", tags: ["蓬松", "卷发"] },
      { name: "法式波浪短发", score: 79, reason: "波浪短发平衡长脸比例", tags: ["波浪", "短发"] },
    ],
  },
  diamond: {
    fine: [
      { name: "侧分八字刘海长发", score: 91, reason: "侧分修饰颧骨，八字刘海柔化棱角", tags: ["侧分", "八字刘海"] },
      { name: "韩式高层次中长发", score: 86, reason: "高层次修饰颧骨线条", tags: ["高层次", "中长发"] },
      { name: "法式波浪卷", score: 82, reason: "波浪卷柔和菱形轮廓", tags: ["波浪卷", "法式"] },
    ],
    thick: [
      { name: "侧分碎层次长发", score: 88, reason: "侧分遮盖颧骨，碎层次降低厚重", tags: ["侧分", "碎层次"] },
      { name: "韩式中长发", score: 84, reason: "中长发修饰颧骨线条", tags: ["中长发", "韩式"] },
      { name: "日系短发", score: 80, reason: "短发柔和菱形脸", tags: ["短发", "日系"] },
    ],
    curly: [
      { name: "自然卷侧分", score: 87, reason: "侧分修饰颧骨，自然卷柔和棱角", tags: ["侧分", "自然卷"] },
      { name: "韩式波浪", score: 83, reason: "波浪卷柔化菱形脸", tags: ["波浪", "韩式"] },
      { name: "法式凌乱卷", score: 79, reason: "凌乱感柔和颧骨线条", tags: ["凌乱卷", "法式"] },
    ],
  },
  oval: {
    fine: [
      { name: "韩式高层次长发", score: 94, reason: "鹅蛋脸适配度高，高层次增加蓬松", tags: ["高层次", "长发"] },
      { name: "法式波浪卷", score: 90, reason: "鹅蛋脸完美适配波浪卷", tags: ["波浪卷", "法式"] },
      { name: "日系锁骨发", score: 87, reason: "锁骨发搭配鹅蛋脸优雅大方", tags: ["锁骨发", "日系"] },
    ],
    thick: [
      { name: "韩式层次中长发", score: 92, reason: "层次打薄降低厚重，鹅蛋脸完美适配", tags: ["层次", "中长发"] },
      { name: "法式大波浪", score: 89, reason: "大波浪搭配鹅蛋脸优雅", tags: ["大波浪", "法式"] },
      { name: "日系短发", score: 85, reason: "短发搭配鹅蛋脸清爽干练", tags: ["短发", "日系"] },
    ],
    curly: [
      { name: "自然卷长发", score: 91, reason: "鹅蛋脸适配自然卷，尽显个性", tags: ["自然卷", "长发"] },
      { name: "韩式波浪卷", score: 88, reason: "波浪卷搭配鹅蛋脸优雅", tags: ["波浪卷", "韩式"] },
      { name: "法式凌乱卷", score: 84, reason: "凌乱卷搭配鹅蛋脸时尚", tags: ["凌乱卷", "法式"] },
    ],
  },
};
