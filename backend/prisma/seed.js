const bcrypt = require('bcrypt');
const {
  CategoryStatus,
  CategoryType,
  CompanyStatus,
  ContentStatus,
  ExperienceType,
  PrismaClient,
  RecommendationStatus,
  RecommendationType,
  ReviewStatus,
  ReviewType,
  VerificationStatus,
} = require('@prisma/client');

const prisma = new PrismaClient();
const {
  industryDefinitions,
  expandedCompanies,
  defaultHotPositionsByIndustry,
  buildExpandedReviewTemplates,
} = require('./seed-expanded-data');

const homeCategories = [
  ['10000000-0000-4000-8000-000000000001', CategoryType.RECOMMEND, 'recommend', '推荐', '热门企业、评价和精选内容', 'home', 10],
  ['10000000-0000-4000-8000-000000000002', CategoryType.INTERNET, 'internet', '互联网', '技术资讯与开发资源', 'globe', 20],
  ['10000000-0000-4000-8000-000000000003', CategoryType.AI, 'ai', 'AI', '进入 AI 求职助手', 'sparkles', 30],
  ['10000000-0000-4000-8000-000000000004', CategoryType.SMART_HARDWARE, 'smart-hardware', '智能硬件', '智能硬件分类入口', 'cpu', 40],
  ['10000000-0000-4000-8000-000000000005', CategoryType.LIFE_SERVICE, 'life-service', '生活服务', '求职、学习与生活工具', 'briefcase', 50],
];

const industries = [
  ['11000000-0000-4000-8000-000000000001', 'internet-platform', '互联网平台', '综合互联网平台与数字服务', 110],
  ['11000000-0000-4000-8000-000000000002', 'ecommerce', '电子商务', '电商、零售与本地生活', 120],
  ['11000000-0000-4000-8000-000000000003', 'social-entertainment', '社交与内容', '社交、内容与线上娱乐', 130],
  ['11000000-0000-4000-8000-000000000004', 'telecom-hardware', '通信与智能硬件', '通信设备、终端与企业技术', 140],
];
industries.push(...industryDefinitions);

const companies = [
  {
    id: '40000000-0000-4000-8000-000000000001',
    legalName: '深圳市腾讯计算机系统有限公司',
    displayName: '腾讯',
    shortName: '腾讯',
    slug: 'tencent',
    industryCode: 'social-entertainment',
    registeredAddress: '广东省深圳市南山区科技中一路腾讯大厦',
    cityCode: '深圳',
    companySizeCode: '10000人以上',
    financingStageCode: '已上市',
    website: 'https://www.tencent.com',
    description: '腾讯是一家以互联网为基础的科技与文化公司，业务覆盖通信社交、数字内容、金融科技与企业服务。',
    tags: ['大厂', '社交', '游戏', '云计算', '校招'],
  },
  {
    id: '40000000-0000-4000-8000-000000000002',
    legalName: '阿里巴巴（中国）有限公司',
    displayName: '阿里巴巴',
    shortName: '阿里',
    slug: 'alibaba',
    industryCode: 'ecommerce',
    registeredAddress: '浙江省杭州市余杭区文一西路969号',
    cityCode: '杭州',
    companySizeCode: '10000人以上',
    financingStageCode: '已上市',
    website: 'https://www.alibabagroup.com',
    description: '阿里巴巴集团业务涵盖电商、云计算、物流与数字媒体，服务消费者、商家和企业客户。',
    tags: ['大厂', '电商', '云计算', '平台业务', '校招'],
  },
  {
    id: '40000000-0000-4000-8000-000000000003',
    legalName: '北京字节跳动科技有限公司',
    displayName: '字节跳动',
    shortName: '字节',
    slug: 'bytedance',
    industryCode: 'social-entertainment',
    registeredAddress: '北京市海淀区北三环西路甲23号院',
    cityCode: '北京',
    companySizeCode: '10000人以上',
    financingStageCode: '未上市',
    website: 'https://www.bytedance.com',
    description: '字节跳动是一家全球化科技公司，产品覆盖内容资讯、短视频、协作办公和企业服务。',
    tags: ['大厂', '内容平台', '短视频', '全球化', '增长'],
  },
  {
    id: '40000000-0000-4000-8000-000000000004',
    legalName: '华为技术有限公司',
    displayName: '华为',
    shortName: '华为',
    slug: 'huawei',
    industryCode: 'telecom-hardware',
    registeredAddress: '广东省深圳市龙岗区坂田华为总部办公楼',
    cityCode: '深圳',
    companySizeCode: '10000人以上',
    financingStageCode: '未上市',
    website: 'https://www.huawei.com',
    description: '华为是全球信息与通信基础设施和智能终端提供商，业务覆盖运营商、企业和消费者市场。',
    tags: ['通信', '智能硬件', '研发', '全球化', '校招'],
  },
  {
    id: '40000000-0000-4000-8000-000000000005',
    legalName: '北京三快在线科技有限公司',
    displayName: '美团',
    shortName: '美团',
    slug: 'meituan',
    industryCode: 'ecommerce',
    registeredAddress: '北京市海淀区北四环西路9号',
    cityCode: '北京',
    companySizeCode: '10000人以上',
    financingStageCode: '已上市',
    website: 'https://www.meituan.com',
    description: '美团是科技零售公司，通过零售与科技战略连接消费者和本地生活服务商家。',
    tags: ['本地生活', '即时零售', '大厂', '平台业务', '数据驱动'],
  },
  {
    id: '40000000-0000-4000-8000-000000000006',
    legalName: '北京京东世纪贸易有限公司',
    displayName: '京东',
    shortName: '京东',
    slug: 'jd',
    industryCode: 'ecommerce',
    registeredAddress: '北京市北京经济技术开发区科创十一街18号',
    cityCode: '北京',
    companySizeCode: '10000人以上',
    financingStageCode: '已上市',
    website: 'https://www.jd.com',
    description: '京东是以供应链为基础的技术与服务企业，业务覆盖零售、物流、科技和健康等领域。',
    tags: ['电商', '物流', '供应链', '大厂', '校招'],
  },
];
companies.push(...expandedCompanies);

const reviewTemplates = [
  ['腾讯', ReviewType.INTERNSHIP, ExperienceType.INTERN, '产品经理实习：导师和项目都比较靠谱', 4, 8500, 3, '能接触真实用户量较大的产品，导师反馈及时，跨团队协作流程成熟。', '会议较多，部分需求推进链路长。', '产品经理实习', '深圳'],
  ['腾讯', ReviewType.INTERVIEW, ExperienceType.INTERN, '产品实习面试复盘', 4, null, 4, '面试官会围绕项目深挖，重视数据意识和产品判断。', '流程轮次较多，等待结果需要耐心。', '产品经理实习', '深圳'],
  ['阿里巴巴', ReviewType.WORK, ExperienceType.FULL_TIME, '平台产品工作体验', 4, 26000, null, '业务复杂度高，能系统学习电商平台和商业化方法。', '跨团队沟通成本高，节奏受业务周期影响明显。', '产品经理', '杭州'],
  ['阿里巴巴', ReviewType.INTERVIEW, ExperienceType.FULL_TIME, '技术面试注重基础和项目细节', 4, null, 4, '面试问题和岗位相关，技术讨论比较深入。', '部分轮次时间较长，需要准备完整的项目复盘。', '后端开发', '杭州'],
  ['字节跳动', ReviewType.INTERNSHIP, ExperienceType.INTERN, '数据产品实习成长很快', 4, 9000, 4, '目标明确，反馈频率高，实习生也能独立承担模块。', '节奏快，对主动推进和交付速度要求高。', '数据产品实习', '北京'],
  ['字节跳动', ReviewType.WORK, ExperienceType.FULL_TIME, '高密度协作下的工作体验', 4, 30000, null, '工具完善，信息透明，优秀同事密度高。', '业务变化快，需要持续适应优先级调整。', '研发工程师', '北京'],
  ['华为', ReviewType.WORK, ExperienceType.FULL_TIME, '研发体系完整，适合打基础', 4, 24000, null, '研发流程规范，培训资源多，技术积累扎实。', '流程和文档要求较多，不同团队体验差异明显。', '软件工程师', '深圳'],
  ['华为', ReviewType.INTERVIEW, ExperienceType.FULL_TIME, '校招面试更看重基础知识', 4, null, 3, '考察范围清晰，基础题和项目问题结合。', '流程节点较多，建议提前准备手撕代码。', '软件工程师', '深圳'],
  ['美团', ReviewType.INTERNSHIP, ExperienceType.INTERN, '本地生活策略实习体验', 4, 7500, 3, '业务数据丰富，能快速理解本地生活供需和运营策略。', '项目节奏快，数据口径需要反复对齐。', '策略产品实习', '北京'],
  ['美团', ReviewType.WORK, ExperienceType.FULL_TIME, '业务务实，结果导向明显', 4, 27000, null, '业务问题真实，数据基础设施较完善。', '高峰期工作强度上升，团队之间差异较大。', '数据分析师', '北京'],
  ['京东', ReviewType.INTERNSHIP, ExperienceType.INTERN, '供应链产品实习有实际产出', 4, 6500, 3, '能接触仓配和供应链真实场景，导师愿意带新人。', '系统链路长，熟悉业务术语需要时间。', '供应链产品实习', '北京'],
  ['京东', ReviewType.WORK, ExperienceType.FULL_TIME, '零售技术团队工作体验', 4, 23000, null, '业务稳定，供应链场景深，工程落地机会多。', '部分系统历史较长，推进改造需要耐心。', 'Java开发工程师', '北京'],
];
reviewTemplates.push(...buildExpandedReviewTemplates(companies));

async function upsertCategory(id, type, code, name, description, icon, sort) {
  return prisma.category.upsert({
    where: { id },
    create: { id, type, code, name, description, icon, sort, status: CategoryStatus.ACTIVE, isActive: true },
    update: { type, code, name, description, icon, sort, status: CategoryStatus.ACTIVE, isActive: true, deletedAt: null },
  });
}

async function seed() {
  const industryByCode = new Map();
  for (const item of homeCategories) await upsertCategory(...item);
  for (const [id, code, name, description, sort] of industries) {
    const category = await upsertCategory(id, CategoryType.INDUSTRY, code, name, description, 'building', sort);
    industryByCode.set(code, category);
  }

  const companyByName = new Map();
  for (const item of companies) {
    const { industryCode, hotPositions, ...companyData } = item;
    const positions = hotPositions ?? defaultHotPositionsByIndustry[industryCode] ?? ['产品经理', '开发工程师', '运营专员'];
    const data = {
      ...companyData,
      tags: Array.from(new Set([...(companyData.tags ?? []), ...positions.map((position) => `热门岗位：${position}`)])),
    };
    const company = await prisma.company.upsert({
      where: { id: item.id },
      create: {
        ...data,
        businessStatus: CompanyStatus.ACTIVE,
        verificationStatus: VerificationStatus.APPROVED,
      },
      update: {
        ...data,
        businessStatus: CompanyStatus.ACTIVE,
        verificationStatus: VerificationStatus.APPROVED,
        deletedAt: null,
      },
    });
    const industry = industryByCode.get(industryCode);
    await prisma.companyCategory.upsert({
      where: { companyId_categoryId: { companyId: company.id, categoryId: industry.id } },
      create: { companyId: company.id, categoryId: industry.id, isPrimary: true },
      update: { isPrimary: true },
    });
    companyByName.set(company.displayName, company);
  }

  const passwordHash = await bcrypt.hash('JobCheck123!', 10);
  const users = [];
  for (let index = 0; index < 6; index += 1) {
    const number = String(index + 1).padStart(2, '0');
    users.push(await prisma.user.upsert({
      where: { email: `demo${number}@jobcheck.local` },
      create: {
        id: `50000000-0000-4000-8000-0000000000${number}`,
        email: `demo${number}@jobcheck.local`,
        passwordHash,
        nickname: `职场观察员${number}`,
      },
      update: { passwordHash, nickname: `职场观察员${number}`, deletedAt: null },
    }));
  }

  for (let index = 0; index < reviewTemplates.length; index += 1) {
    const [companyName, reviewType, experienceType, title, rating, salary, interviewDifficulty, advantage, disadvantage, position, city] = reviewTemplates[index];
    const company = companyByName.get(companyName);
    const scoreA = rating;
    const scoreB = Math.max(1, rating - (index % 3 === 0 ? 1 : 0));
    const content = `${advantage} ${disadvantage} 这是一条基于个人经历整理的匿名评价，具体体验会因部门、岗位和时期而不同。`;
    const data = {
      companyId: company.id,
      userId: users[index % users.length].id,
      title,
      reviewType,
      experienceType,
      content,
      advantage,
      disadvantage,
      salary,
      salaryInfo: salary ? `税前月薪约 ${salary} 元` : null,
      interviewDifficulty,
      workExperience: `${city} · ${position}`,
      position,
      employmentStatus: experienceType === ExperienceType.INTERN ? 'INTERN' : 'CURRENT',
      rating,
      workEnvironmentScore: scoreA,
      managementScore: scoreB,
      salaryBenefitScore: scoreA,
      growthScore: scoreA,
      isAnonymous: true,
      status: ReviewStatus.APPROVED,
      publishedAt: new Date(Date.now() - index * 86400000 * 3),
      deletedAt: null,
    };
    await prisma.review.upsert({
      where: { id: `60000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}` },
      create: { id: `60000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`, ...data },
      update: data,
    });
  }

  for (const company of companyByName.values()) {
    const stats = await prisma.review.aggregate({
      where: { companyId: company.id, status: ReviewStatus.APPROVED, deletedAt: null },
      _count: { id: true },
      _avg: {
        rating: true,
        workEnvironmentScore: true,
        managementScore: true,
        salaryBenefitScore: true,
        growthScore: true,
      },
    });
    await prisma.company.update({
      where: { id: company.id },
      data: {
        reviewCount: stats._count.id,
        ratingAverage: stats._avg.rating ?? 0,
        workScoreAverage: stats._avg.workEnvironmentScore ?? 0,
        managementScoreAverage: stats._avg.managementScore ?? 0,
        benefitsScoreAverage: stats._avg.salaryBenefitScore ?? 0,
        growthScoreAverage: stats._avg.growthScore ?? 0,
        ratingUpdatedAt: new Date(),
      },
    });
  }

  const lifeCategory = await prisma.category.findUniqueOrThrow({
    where: { type_code: { type: CategoryType.LIFE_SERVICE, code: 'life-service' } },
  });
  await prisma.content.upsert({
    where: { id: '30000000-0000-4000-8000-000000000006' },
    create: {
      id: '30000000-0000-4000-8000-000000000006',
      categoryId: lifeCategory.id,
      title: 'JobCheck AI 求职助手',
      description: '根据站内企业信息与真实评价，分析岗位体验、薪资和面试准备重点。',
      url: '/ai',
      source: 'JobCheck',
      status: ContentStatus.PUBLISHED,
    },
    update: {
      categoryId: lifeCategory.id,
      title: 'JobCheck AI 求职助手',
      description: '根据站内企业信息与真实评价，分析岗位体验、薪资和面试准备重点。',
      url: '/ai',
      source: 'JobCheck',
      status: ContentStatus.PUBLISHED,
      deletedAt: null,
    },
  });

  await prisma.recommendation.upsert({
    where: { id: '20000000-0000-4000-8000-000000000001' },
    create: {
      id: '20000000-0000-4000-8000-000000000001',
      type: RecommendationType.AI_ENTRY,
      title: 'AI 求职助手',
      description: '基于企业数据与真实评价生成求职分析',
      icon: 'sparkles',
      url: '/ai',
      sort: 10,
      status: RecommendationStatus.ACTIVE,
    },
    update: {
      title: 'AI 求职助手',
      description: '基于企业数据与真实评价生成求职分析',
      icon: 'sparkles',
      url: '/ai',
      sort: 10,
      status: RecommendationStatus.ACTIVE,
    },
  });

  console.log(`Seed completed: ${companies.length} companies, ${reviewTemplates.length} reviews.`);
}

seed()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
