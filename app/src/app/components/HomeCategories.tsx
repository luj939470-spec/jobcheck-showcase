import { useEffect, useMemo, useState } from "react";
import {
  BriefcaseBusiness,
  Cpu,
  ExternalLink,
  Globe2,
  Home,
  Sparkles,
  Star,
} from "lucide-react";
import {
  categoryApi,
  contentApi,
  recommendApi,
  type ContentItem,
  type HomeCategory,
  type HomeCategoryType,
  type HomepageRecommendation,
} from "../../api";

const FALLBACK_CATEGORIES: HomeCategory[] = [
  { id: "recommend", name: "推荐", type: "RECOMMEND", description: "热门精选", icon: "home", sort: 10, status: "ACTIVE", createdAt: "" },
  { id: "internet", name: "互联网", type: "INTERNET", description: "技术资讯与开发资源", icon: "globe", sort: 20, status: "ACTIVE", createdAt: "" },
  { id: "ai", name: "AI", type: "AI", description: "AI 智能助手", icon: "sparkles", sort: 30, status: "ACTIVE", createdAt: "" },
  { id: "hardware", name: "智能硬件", type: "SMART_HARDWARE", description: "智能硬件入口", icon: "cpu", sort: 40, status: "ACTIVE", createdAt: "" },
  { id: "life", name: "生活服务", type: "LIFE_SERVICE", description: "求职与学习工具", icon: "briefcase", sort: 50, status: "ACTIVE", createdAt: "" },
];

const ICONS: Record<HomeCategoryType, typeof Home> = {
  RECOMMEND: Home,
  INTERNET: Globe2,
  AI: Sparkles,
  SMART_HARDWARE: Cpu,
  LIFE_SERVICE: BriefcaseBusiness,
};

function ContentCard({ item, onOpenAi }: { item: ContentItem; onOpenAi?: () => void }) {
  const internalAi = item.url === "/ai" || item.url.endsWith("/ai");
  return (
    <a
      href={item.url}
      target={internalAi ? undefined : "_blank"}
      rel={internalAi ? undefined : "noreferrer"}
      onClick={(event) => {
        if (internalAi && onOpenAi) {
          event.preventDefault();
          onOpenAi();
        }
      }}
      className="block rounded-2xl border border-white/10 bg-white/[0.055] p-4 transition hover:border-purple-400/40"
    >
      <div className="flex items-start gap-3">
        {item.cover ? (
          <img src={item.cover} alt="" className="h-16 w-20 shrink-0 rounded-xl object-cover" />
        ) : (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-400/10">
            <Globe2 size={19} className="text-purple-300" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-bold text-white">{item.title}</h3>
            <ExternalLink size={13} className="mt-0.5 shrink-0 text-white/30" />
          </div>
          {item.description && (
            <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-white/45">
              {item.description}
            </p>
          )}
          <p className="mt-2 text-[10px] text-purple-200/60">
            {item.source ?? item.category.name} · {item.viewCount} 次浏览
          </p>
        </div>
      </div>
    </a>
  );
}

export function HomeCategories({
  active,
  onChange,
  onOpenCompany,
  onOpenAi,
}: {
  active: HomeCategoryType;
  onChange: (type: HomeCategoryType) => void;
  onOpenCompany: (id: string) => void;
  onOpenAi: () => void;
}) {
  const [categories, setCategories] = useState<HomeCategory[]>(FALLBACK_CATEGORIES);
  const [recommendation, setRecommendation] = useState<HomepageRecommendation | null>(null);
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    categoryApi.list()
      .then((response) => {
        if (response.data.length) {
          const categoriesByType = new Map(
            FALLBACK_CATEGORIES.map((category) => [category.type, category]),
          );
          response.data.forEach((category) => categoriesByType.set(category.type, category));
          setCategories(
            [...categoriesByType.values()].sort((left, right) => left.sort - right.sort),
          );
        }
      })
      .catch(() => {
        // Keep navigation usable while the API or initial migration is unavailable.
      });
  }, []);

  useEffect(() => {
    setLoading(true);
    setError("");
    if (active === "RECOMMEND") {
      recommendApi.homepage()
        .then((response) => setRecommendation(response.data))
        .catch((reason) => setError(reason instanceof Error ? reason.message : "推荐内容加载失败"))
        .finally(() => setLoading(false));
      return;
    }
    if (active === "INTERNET" || active === "LIFE_SERVICE") {
      contentApi.list(active)
        .then((response) => setContents(response.data))
        .catch((reason) => setError(reason instanceof Error ? reason.message : "内容加载失败"))
        .finally(() => setLoading(false));
      return;
    }
    setLoading(false);
  }, [active]);

  const current = useMemo(
    () => categories.find((category) => category.type === active),
    [active, categories],
  );

  return (
    <section className="space-y-4">
      <nav className="grid grid-cols-5 gap-1" aria-label="首页分类">
        {categories.map((category) => {
          const Icon = ICONS[category.type];
          const selected = category.type === active;
          return (
            <button
              key={category.id}
              onClick={() => {
                if (category.type === "AI") onOpenAi();
                else onChange(category.type);
              }}
              className="flex min-w-0 flex-col items-center gap-1 rounded-xl px-1 py-2 text-[9px] font-bold transition"
              style={{
                background: selected ? "linear-gradient(135deg,#7C6EFA,#B490F5)" : "rgba(255,255,255,.055)",
                color: selected ? "white" : "rgba(255,255,255,.45)",
              }}
            >
              <Icon size={15} />
              <span className="truncate">{category.name}</span>
            </button>
          );
        })}
      </nav>

      {current?.description && active !== "RECOMMEND" && (
        <p className="text-xs text-white/35">{current.description}</p>
      )}
      {error && <p className="rounded-xl bg-red-400/10 p-3 text-xs text-red-300">{error}</p>}
      {loading && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-xs text-white/40">
          正在加载内容…
        </div>
      )}

      {!loading && active === "RECOMMEND" && recommendation && (
        <div className="space-y-4">
          <button
            onClick={onOpenAi}
            className="flex w-full items-center gap-3 rounded-2xl border border-purple-300/20 bg-purple-400/10 p-4 text-left"
          >
            <div className="rounded-xl bg-purple-400/20 p-2.5"><Sparkles size={20} /></div>
            <div className="flex-1">
              <h2 className="text-sm font-extrabold">{recommendation.aiEntry.title}</h2>
              <p className="mt-1 text-[11px] text-white/45">{recommendation.aiEntry.description}</p>
            </div>
            <ExternalLink size={15} className="text-white/35" />
          </button>

          {recommendation.popularCompanies.length > 0 && (
            <div>
              <h2 className="mb-2 text-sm font-extrabold">热门企业</h2>
              <div className="grid grid-cols-2 gap-2">
                {recommendation.popularCompanies.slice(0, 4).map((company) => (
                  <button
                    key={company.id}
                    onClick={() => onOpenCompany(company.id)}
                    className="rounded-xl border border-white/10 bg-white/5 p-3 text-left"
                  >
                    <p className="truncate text-xs font-bold">{company.name}</p>
                    <p className="mt-2 flex items-center gap-1 text-[10px] text-yellow-300">
                      <Star size={11} fill="currentColor" /> {Number(company.averageScore).toFixed(1)}
                      <span className="text-white/30">· {company.reviewCount} 条</span>
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {recommendation.popularReviews.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-sm font-extrabold">热门评价</h2>
              {recommendation.popularReviews.slice(0, 3).map((review) => (
                <button
                  key={review.id}
                  onClick={() => onOpenCompany(review.companyId)}
                  className="block w-full rounded-2xl border border-white/10 bg-white/[0.055] p-4 text-left"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate text-[11px] font-bold text-purple-200">
                      {review.company.displayName}
                    </p>
                    <p className="flex shrink-0 items-center gap-1 text-[10px] text-yellow-300">
                      <Star size={10} fill="currentColor" /> {Number(review.rating).toFixed(1)}
                    </p>
                  </div>
                  <h3 className="mt-2 text-sm font-bold text-white">{review.title}</h3>
                  <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-white/45">
                    {review.content}
                  </p>
                  <p className="mt-2 text-[10px] text-white/25">
                    {review.likeCount} 赞 · {review.commentCount} 条评论
                  </p>
                </button>
              ))}
            </div>
          )}

          {recommendation.popularContents.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-sm font-extrabold">热门内容</h2>
              {recommendation.popularContents.slice(0, 3).map((item) => (
                <ContentCard key={item.id} item={item} onOpenAi={onOpenAi} />
              ))}
            </div>
          )}
        </div>
      )}

      {!loading && (active === "INTERNET" || active === "LIFE_SERVICE") && (
        <div className="space-y-2">
          {contents.map((item) => (
            <ContentCard key={item.id} item={item} onOpenAi={onOpenAi} />
          ))}
          {!contents.length && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-7 text-center text-xs text-white/35">
              暂无已发布内容
            </div>
          )}
        </div>
      )}

      {!loading && active === "AI" && (
        <button
          onClick={onOpenAi}
          className="w-full rounded-2xl border border-purple-300/20 bg-gradient-to-br from-purple-500/20 to-blue-500/10 p-6 text-left"
        >
          <Sparkles className="text-purple-200" />
          <h2 className="mt-4 text-lg font-extrabold">AI 智能助手</h2>
          <p className="mt-2 text-xs leading-relaxed text-white/50">
            支持职场问答、企业分析、简历优化与模拟面试。
          </p>
          <p className="mt-4 text-xs font-bold text-purple-200">立即进入 →</p>
        </button>
      )}

      {!loading && active === "SMART_HARDWARE" && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
          <Cpu className="mx-auto text-purple-200" />
          <h2 className="mt-3 text-sm font-extrabold">智能硬件</h2>
          <p className="mt-2 text-xs text-white/35">分类入口已开放，复杂功能将在后续版本上线。</p>
        </div>
      )}
    </section>
  );
}
