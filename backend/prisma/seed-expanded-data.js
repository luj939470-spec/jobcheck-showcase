const industryDefinitions = [
  ['12000000-0000-4000-8000-000000000001', 'internet-tech', '互联网科技', '互联网平台、内容、电商与数字服务', 210],
  ['12000000-0000-4000-8000-000000000002', 'gaming', '游戏公司', '游戏研发、发行与互动娱乐', 220],
  ['12000000-0000-4000-8000-000000000003', 'artificial-intelligence', 'AI公司', '人工智能、大模型、计算机视觉与智能语音', 230],
  ['12000000-0000-4000-8000-000000000004', 'finance', '金融企业', '银行、证券、保险与金融科技', 240],
  ['12000000-0000-4000-8000-000000000005', 'state-owned', '国企', '中央企业与大型国有企业', 250],
  ['12000000-0000-4000-8000-000000000006', 'foreign-enterprise', '外企', '跨国科技、工业与消费品牌在华企业', 260],
  ['12000000-0000-4000-8000-000000000007', 'fmcg', '快消企业', '食品饮料、日化与消费品牌', 270],
  ['12000000-0000-4000-8000-000000000008', 'manufacturing', '制造业', '汽车、家电、电子与先进制造', 280],
  ['12000000-0000-4000-8000-000000000009', 'design-media', '设计/传媒企业', '广告、品牌、设计、媒体与内容制作', 290],
];

const groups = [
  {
    code: 'internet-tech',
    summary: '互联网平台、内容社区、电商或数字服务企业',
    jobs: ['后端开发', '产品经理', '数据分析'],
    companies: [
      ['百度', 'baidu', '北京', '10000人以上', 'https://www.baidu.com', '已上市'],
      ['网易', 'netease', '杭州', '10000人以上', 'https://www.163.com', '已上市'],
      ['哔哩哔哩', 'bilibili', '上海', '10000人以上', 'https://www.bilibili.com', '已上市'],
      ['滴滴', 'didi', '北京', '10000人以上', 'https://www.didiglobal.com', '已上市'],
      ['小红书', 'xiaohongshu', '上海', '10000人以上', 'https://www.xiaohongshu.com', '未上市'],
      ['快手', 'kuaishou', '北京', '10000人以上', 'https://www.kuaishou.com', '已上市'],
      ['拼多多', 'pinduoduo', '上海', '10000人以上', 'https://www.pddholdings.com', '已上市'],
      ['携程集团', 'trip-com', '上海', '10000人以上', 'https://group.trip.com', '已上市'],
      ['知乎', 'zhihu', '北京', '5000-10000人', 'https://www.zhihu.com', '已上市'],
      ['新浪微博', 'weibo', '北京', '5000-10000人', 'https://weibo.com', '已上市'],
      ['三六零', '360', '北京', '5000-10000人', 'https://www.360.cn', '已上市'],
      ['搜狐', 'sohu', '北京', '1000-5000人', 'https://www.sohu.com', '已上市'],
    ],
  },
  {
    code: 'gaming',
    summary: '游戏研发、发行或互动娱乐企业',
    jobs: ['游戏策划', '游戏客户端开发', '游戏美术'],
    companies: [
      ['米哈游', 'mihoyo', '上海', '5000-10000人', 'https://www.mihoyo.com', '未上市'],
      ['莉莉丝游戏', 'lilith-games', '上海', '1000-5000人', 'https://www.lilith.com', '未上市'],
      ['鹰角网络', 'hypergryph', '上海', '1000-5000人', 'https://www.hypergryph.com', '未上市'],
      ['完美世界', 'perfect-world', '北京', '5000-10000人', 'https://www.wanmei.com', '已上市'],
      ['巨人网络', 'giant-network', '上海', '1000-5000人', 'https://www.ga-me.com', '已上市'],
      ['网易游戏', 'netease-games', '广州', '10000人以上', 'https://game.163.com', '已上市集团'],
      ['腾讯游戏', 'tencent-games', '深圳', '10000人以上', 'https://game.qq.com', '已上市集团'],
      ['西山居', 'seasun', '珠海', '1000-5000人', 'https://www.xishanju.com', '未上市'],
      ['叠纸游戏', 'papergames', '上海', '1000-5000人', 'https://www.papegames.com', '未上市'],
      ['三七互娱', '37games', '广州', '1000-5000人', 'https://www.37.com', '已上市'],
      ['游族网络', 'yoozoo', '上海', '1000-5000人', 'https://www.yoozoo.com', '已上市'],
      ['多益网络', 'duoyi', '广州', '1000-5000人', 'https://www.duoyi.com', '未上市'],
    ],
  },
  {
    code: 'artificial-intelligence',
    summary: '人工智能、大模型、智能语音或计算机视觉企业',
    jobs: ['算法工程师', '大模型产品经理', '机器学习工程师'],
    companies: [
      ['科大讯飞', 'iflytek', '合肥', '10000人以上', 'https://www.iflytek.com', '已上市'],
      ['商汤科技', 'sensetime', '上海', '5000-10000人', 'https://www.sensetime.com', '已上市'],
      ['智谱AI', 'zhipu-ai', '北京', '1000-5000人', 'https://www.zhipuai.cn', '战略融资'],
      ['月之暗面', 'moonshot-ai', '北京', '500-1000人', 'https://www.moonshot.cn', '战略融资'],
      ['MiniMax', 'minimax', '上海', '500-1000人', 'https://www.minimaxi.com', '战略融资'],
      ['百川智能', 'baichuan-ai', '北京', '500-1000人', 'https://www.baichuan-ai.com', '战略融资'],
      ['第四范式', '4paradigm', '北京', '1000-5000人', 'https://www.4paradigm.com', '已上市'],
      ['寒武纪', 'cambricon', '北京', '1000-5000人', 'https://www.cambricon.com', '已上市'],
      ['云从科技', 'cloudwalk', '广州', '1000-5000人', 'https://www.cloudwalk.com', '已上市'],
      ['旷视科技', 'megvii', '北京', '1000-5000人', 'https://www.megvii.com', '战略融资'],
      ['地平线机器人', 'horizon-robotics', '北京', '1000-5000人', 'https://www.horizon.auto', '已上市'],
      ['深度求索', 'deepseek', '杭州', '500-1000人', 'https://www.deepseek.com', '未上市'],
    ],
  },
  {
    code: 'finance',
    summary: '银行、证券、保险或金融科技企业',
    jobs: ['金融科技岗', '风险管理', '管培生'],
    companies: [
      ['招商银行', 'cmb', '深圳', '10000人以上', 'https://www.cmbchina.com', '已上市'],
      ['工商银行', 'icbc', '北京', '10000人以上', 'https://www.icbc.com.cn', '已上市'],
      ['建设银行', 'ccb', '北京', '10000人以上', 'https://www.ccb.com', '已上市'],
      ['农业银行', 'abc-bank', '北京', '10000人以上', 'https://www.abchina.com', '已上市'],
      ['中国银行', 'bank-of-china', '北京', '10000人以上', 'https://www.boc.cn', '已上市'],
      ['中国平安', 'ping-an', '深圳', '10000人以上', 'https://www.pingan.cn', '已上市'],
      ['中信银行', 'citic-bank', '北京', '10000人以上', 'https://www.citicbank.com', '已上市'],
      ['中金公司', 'cicc', '北京', '5000-10000人', 'https://www.cicc.com', '已上市'],
      ['蚂蚁集团', 'ant-group', '杭州', '10000人以上', 'https://www.antgroup.com', '未上市'],
      ['陆金所', 'lufax', '上海', '5000-10000人', 'https://www.lufaxholding.com', '已上市'],
      ['广发证券', 'gf-securities', '广州', '10000人以上', 'https://www.gf.com.cn', '已上市'],
      ['招商证券', 'cmschina', '深圳', '10000人以上', 'https://www.cmschina.com', '已上市'],
    ],
  },
  {
    code: 'state-owned',
    summary: '关系国计民生、基础设施或综合产业的大型国有企业',
    jobs: ['工程技术岗', '信息化岗', '综合管理岗'],
    companies: [
      ['国家电网', 'state-grid', '北京', '10000人以上', 'https://www.sgcc.com.cn', '中央企业'],
      ['中国石油', 'petrochina', '北京', '10000人以上', 'https://www.petrochina.com.cn', '中央企业'],
      ['中国石化', 'sinopec', '北京', '10000人以上', 'https://www.sinopecgroup.com', '中央企业'],
      ['中国移动', 'china-mobile', '北京', '10000人以上', 'https://www.chinamobile.com', '中央企业'],
      ['中国电信', 'china-telecom', '北京', '10000人以上', 'https://www.chinatelecom.com.cn', '中央企业'],
      ['中国联通', 'china-unicom', '北京', '10000人以上', 'https://www.chinaunicom.com.cn', '中央企业'],
      ['中国中车', 'crrc', '北京', '10000人以上', 'https://www.crrcgc.cc', '中央企业'],
      ['中国商飞', 'comac', '上海', '10000人以上', 'https://www.comac.cc', '中央企业'],
      ['中国建筑', 'cscec', '北京', '10000人以上', 'https://www.cscec.com', '中央企业'],
      ['中国邮政', 'china-post', '北京', '10000人以上', 'https://www.chinapost.com.cn', '中央企业'],
      ['中国中铁', 'crec', '北京', '10000人以上', 'https://www.crecg.com', '中央企业'],
      ['华润集团', 'china-resources', '香港', '10000人以上', 'https://www.crc.com.hk', '中央企业'],
    ],
  },
  {
    code: 'foreign-enterprise',
    summary: '在华开展研发、销售或专业服务的跨国企业',
    jobs: ['软件工程师', '市场管培生', '供应链专员'],
    companies: [
      ['微软中国', 'microsoft-china', '北京', '5000-10000人', 'https://www.microsoft.com/zh-cn', '外商独资'],
      ['谷歌中国', 'google-china', '北京', '1000-5000人', 'https://www.google.cn', '外商独资'],
      ['苹果中国', 'apple-china', '上海', '5000-10000人', 'https://www.apple.com.cn', '外商独资'],
      ['亚马逊中国', 'amazon-china', '北京', '5000-10000人', 'https://www.amazon.cn', '外商独资'],
      ['IBM中国', 'ibm-china', '北京', '5000-10000人', 'https://www.ibm.com/cn-zh', '外商独资'],
      ['SAP中国', 'sap-china', '上海', '1000-5000人', 'https://www.sap.cn', '外商独资'],
      ['西门子中国', 'siemens-china', '北京', '10000人以上', 'https://www.siemens.com/cn/zh.html', '外商独资'],
      ['博世中国', 'bosch-china', '上海', '10000人以上', 'https://www.bosch.com.cn', '外商独资'],
      ['英特尔中国', 'intel-china', '北京', '5000-10000人', 'https://www.intel.cn', '外商独资'],
      ['甲骨文中国', 'oracle-china', '北京', '1000-5000人', 'https://www.oracle.com/cn', '外商独资'],
      ['耐克中国', 'nike-china', '上海', '1000-5000人', 'https://www.nike.com.cn', '外商独资'],
      ['宜家中国', 'ikea-china', '上海', '10000人以上', 'https://www.ikea.cn', '外商独资'],
    ],
  },
  {
    code: 'fmcg',
    summary: '食品饮料、日化、美妆或综合消费品牌企业',
    jobs: ['品牌管理', '销售管培生', '供应链管理'],
    companies: [
      ['宝洁中国', 'pg-china', '广州', '5000-10000人', 'https://www.pg.com.cn', '外商独资'],
      ['联合利华中国', 'unilever-china', '上海', '5000-10000人', 'https://www.unilever.com.cn', '外商独资'],
      ['欧莱雅中国', 'loreal-china', '上海', '5000-10000人', 'https://www.lorealchina.com', '外商独资'],
      ['可口可乐中国', 'coca-cola-china', '上海', '5000-10000人', 'https://www.coca-cola.com/cn/zh', '外商独资'],
      ['百事中国', 'pepsico-china', '上海', '5000-10000人', 'https://www.pepsico.com.cn', '外商独资'],
      ['雀巢中国', 'nestle-china', '北京', '10000人以上', 'https://www.nestle.com.cn', '外商独资'],
      ['玛氏中国', 'mars-china', '北京', '5000-10000人', 'https://chn.mars.com', '外商独资'],
      ['亿滋中国', 'mondelez-china', '上海', '5000-10000人', 'https://www.mondelezinternational.com', '外商独资'],
      ['百威中国', 'budweiser-china', '上海', '10000人以上', 'https://www.ab-inbev.cn', '已上市集团'],
      ['伊利集团', 'yili', '呼和浩特', '10000人以上', 'https://www.yili.com', '已上市'],
      ['蒙牛乳业', 'mengniu', '呼和浩特', '10000人以上', 'https://www.mengniu.com.cn', '已上市'],
      ['农夫山泉', 'nongfu-spring', '杭州', '10000人以上', 'https://www.nongfuspring.com', '已上市'],
    ],
  },
  {
    code: 'manufacturing',
    summary: '汽车、家电、电子或先进装备制造企业',
    jobs: ['研发工程师', '制造工程师', '供应链工程师'],
    companies: [
      ['比亚迪', 'byd', '深圳', '10000人以上', 'https://www.bydglobal.com', '已上市'],
      ['小米集团', 'xiaomi', '北京', '10000人以上', 'https://www.mi.com', '已上市'],
      ['宁德时代', 'catl', '宁德', '10000人以上', 'https://www.catl.com', '已上市'],
      ['海尔智家', 'haier', '青岛', '10000人以上', 'https://www.haier.com', '已上市'],
      ['美的集团', 'midea', '佛山', '10000人以上', 'https://www.midea.com.cn', '已上市'],
      ['格力电器', 'gree', '珠海', '10000人以上', 'https://www.gree.com', '已上市'],
      ['吉利汽车', 'geely', '杭州', '10000人以上', 'https://www.geely.com', '已上市'],
      ['上汽集团', 'saic', '上海', '10000人以上', 'https://www.saicmotor.com', '已上市'],
      ['大疆创新', 'dji', '深圳', '10000人以上', 'https://www.dji.com/cn', '未上市'],
      ['联想集团', 'lenovo', '北京', '10000人以上', 'https://www.lenovo.com.cn', '已上市'],
      ['立讯精密', 'luxshare', '东莞', '10000人以上', 'https://www.luxshare-ict.com', '已上市'],
      ['京东方', 'boe', '北京', '10000人以上', 'https://www.boe.com', '已上市'],
    ],
  },
  {
    code: 'design-media',
    summary: '广告传播、品牌设计、媒体或内容制作企业',
    jobs: ['视觉设计师', '创意策划', '内容运营'],
    companies: [
      ['蓝色光标', 'bluefocus', '北京', '5000-10000人', 'https://www.bluefocusgroup.com', '已上市'],
      ['奥美中国', 'ogilvy-china', '上海', '1000-5000人', 'https://www.ogilvy.com.cn', '外资集团'],
      ['群邑中国', 'groupm-china', '上海', '1000-5000人', 'https://www.groupm.com', '外资集团'],
      ['电通中国', 'dentsu-china', '上海', '1000-5000人', 'https://www.dentsu.com/cn/zh', '外资集团'],
      ['阳狮中国', 'publicis-china', '上海', '1000-5000人', 'https://www.publicisgroupe.com', '外资集团'],
      ['华扬联众', 'hylink', '北京', '1000-5000人', 'https://www.hylink.com', '已上市'],
      ['视觉中国', 'vcg', '北京', '500-1000人', 'https://www.vcg.com', '已上市'],
      ['湖南广电', 'hunan-broadcasting', '长沙', '5000-10000人', 'https://www.hunantv.com', '国有企业'],
      ['芒果TV', 'mango-tv', '长沙', '5000-10000人', 'https://www.mgtv.com', '已上市集团'],
      ['上海广播电视台', 'smg', '上海', '5000-10000人', 'https://www.smg.cn', '国有企业'],
      ['财新传媒', 'caixin-media', '北京', '500-1000人', 'https://www.caixin.com', '未上市'],
      ['36氪', '36kr', '北京', '500-1000人', 'https://36kr.com', '已上市'],
    ],
  },
];

const expandedCompanies = [];
let companySequence = 1;
for (const group of groups) {
  for (const [name, slug, city, size, website, financing] of group.companies) {
    expandedCompanies.push({
      id: `41000000-0000-4000-8000-${String(companySequence).padStart(12, '0')}`,
      legalName: `${name}（测试数据）`,
      displayName: name,
      shortName: name,
      slug,
      industryCode: group.code,
      registeredAddress: `${city}市（测试数据地址）`,
      cityCode: city,
      companySizeCode: size,
      financingStageCode: financing,
      website,
      description: `${name}是${group.summary}。本条为面向大学生实习、校招和求职查询的测试企业资料，具体信息请以企业官方发布为准。`,
      tags: [group.code, '实习', '校招', ...group.jobs.map((job) => `热门岗位：${job}`)],
      hotPositions: group.jobs,
    });
    companySequence += 1;
  }
}

const defaultHotPositionsByIndustry = Object.fromEntries(groups.map((group) => [group.code, group.jobs]));

function buildExpandedReviewTemplates(allCompanies) {
  const templates = [];
  for (const [companyIndex, company] of allCompanies.entries()) {
    const positions = company.hotPositions ?? defaultHotPositionsByIndustry[company.industryCode] ?? ['产品经理', '开发工程师', '运营专员'];
    const position = positions[companyIndex % positions.length];
    const baseSalary = 6500 + (companyIndex % 8) * 500;
    const fullSalary = 12000 + (companyIndex % 12) * 1200;
    templates.push(
      [company.displayName, 'INTERNSHIP', 'INTERN', `${position}实习体验`, 4, baseSalary, 3, '导师会安排相对明确的任务，也能接触真实业务资料和团队协作流程。', '实习体验和工作内容会因部门与项目周期不同而有差异。', position, company.cityCode],
      [company.displayName, 'INTERVIEW', 'INTERN', `${position}校招面试体验`, 4, null, 3 + (companyIndex % 2), '面试主要围绕基础知识、项目经历和岗位匹配度展开，沟通流程较清晰。', '建议提前准备项目复盘、岗位知识和常见行为问题。', position, company.cityCode],
      [company.displayName, 'WORK', 'FULL_TIME', '工作节奏与加班情况', 3 + (companyIndex % 2), fullSalary, null, '团队会根据业务节点安排工作，日常节奏总体可预期。', '项目高峰期可能出现加班，不同部门、岗位和时期差异较大。', position, company.cityCode],
      [company.displayName, 'WORK', 'FULL_TIME', '薪资福利与成长体验', 4, fullSalary, null, '薪资结构和基础福利较完整，校招生通常有培训或导师支持。', '具体薪资需结合城市、职级、岗位和当年招聘政策确认。', position, company.cityCode],
      [company.displayName, 'WORK', 'FULL_TIME', '团队氛围与协作体验', 4, fullSalary, null, '同事专业度较高，日常协作有固定流程，愿意交流业务和方法。', '跨团队沟通有一定成本，主动同步进度会获得更好的协作体验。', position, company.cityCode],
    );
  }
  return templates;
}

module.exports = {
  industryDefinitions,
  expandedCompanies,
  defaultHotPositionsByIndustry,
  buildExpandedReviewTemplates,
};
