import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Bookmark,
  Building2,
  CheckCircle,
  LogIn,
  LogOut,
  MessageSquare,
  Search,
  Send,
  Sparkles,
  Star,
  ThumbsUp,
  User,
  X,
} from "lucide-react";
import {
  ApiError,
  aiApi,
  companyApi,
  reviewApi,
  type CreateReviewInput,
  type Company,
  type CompanyDetail,
  type CompanyStatistics,
  type HomeCategoryType,
  type Industry,
  type PageMeta,
  type Review,
  type ReviewComment,
} from "../api";
import { useAuth } from "../auth/AuthContext";
import { HomeCategories } from "./components/HomeCategories";

const STARS = Array.from({ length: 70 }, (_, i) => ({
  id: i,
  x: (i * 137.508) % 100,
  y: (i * 97.39) % 100,
  size: i % 8 === 0 ? 2 : 1,
  opacity: 0.12 + (i % 6) * 0.08,
}));

function StarField() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {STARS.map((star) => (
        <span
          key={star.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
            opacity: star.opacity,
          }}
        />
      ))}
    </div>
  );
}

function GlassCard({
  children,
  className = "",
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <div
      className={`rounded-2xl border border-white/10 ${className}`}
      onClick={onClick}
      style={{
        background: "rgba(255,255,255,0.055)",
        backdropFilter: "blur(24px)",
        boxShadow: "0 6px 28px rgba(0,0,0,0.3)",
      }}
    >
      {children}
    </div>
  );
}

function ActionButton({
  children,
  onClick,
  disabled,
  secondary,
  type = "button",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  secondary?: boolean;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="rounded-xl px-4 py-2 text-xs font-bold text-white transition active:scale-95 disabled:opacity-50"
      style={{
        background: secondary
          ? "rgba(255,255,255,0.09)"
          : "linear-gradient(135deg,#7C6EFA,#B490F5)",
        border: secondary ? "1px solid rgba(255,255,255,0.13)" : "none",
      }}
    >
      {children}
    </button>
  );
}

function Rating({ value, count }: { value: number; count?: number }) {
  const safeValue = Number(value) || 0;
  return (
    <div className="flex items-center gap-1">
      <Star size={13} fill="#facc15" className="text-yellow-400" />
      <span className="text-sm font-extrabold text-white">{safeValue.toFixed(1)}</span>
      {count !== undefined && <span className="text-xs text-white/35">({count} 条评价)</span>}
    </div>
  );
}

function LoadingCard({ text = "正在加载真实数据…" }: { text?: string }) {
  return (
    <GlassCard className="p-8 text-center">
      <div className="mx-auto mb-3 h-6 w-6 animate-spin rounded-full border-2 border-white/15 border-t-purple-400" />
      <p className="text-xs text-white/45">{text}</p>
    </GlassCard>
  );
}

function EmptyCard({ text }: { text: string }) {
  return (
    <GlassCard className="p-8 text-center">
      <Building2 className="mx-auto mb-3 text-white/20" />
      <p className="text-sm text-white/45">{text}</p>
    </GlassCard>
  );
}

function AuthDialog({ close }: { close: () => void }) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [identifier, setIdentifier] = useState("");
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      if (mode === "login") await login(identifier, password);
      else await register(identifier, password, nickname);
      close();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "操作失败，请稍后重试。");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-5">
      <GlassCard className="w-full max-w-sm p-5">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-white">
              {mode === "login" ? "登录 JobCheck" : "创建账号"}
            </h2>
            <p className="mt-1 text-xs text-white/35">登录后可评论、点赞和收藏企业</p>
          </div>
          <button onClick={close} aria-label="关闭"><X className="text-white/45" /></button>
        </div>
        <form onSubmit={submit} className="space-y-3">
          {mode === "register" && (
            <input
              value={nickname}
              onChange={(event) => setNickname(event.target.value)}
              placeholder="昵称"
              required
              maxLength={80}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-purple-400/60"
            />
          )}
          <input
            value={identifier}
            onChange={(event) => setIdentifier(event.target.value)}
            placeholder={mode === "login" ? "邮箱或手机号" : "邮箱"}
            type={mode === "register" ? "email" : "text"}
            required
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-purple-400/60"
          />
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="密码（至少 8 位）"
            type="password"
            required
            minLength={8}
            maxLength={72}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-purple-400/60"
          />
          {error && <p className="rounded-xl bg-red-400/10 p-3 text-xs text-red-300">{error}</p>}
          <ActionButton type="submit" disabled={busy}>
            {busy ? "请稍候…" : mode === "login" ? "登录" : "注册并登录"}
          </ActionButton>
        </form>
        <button
          className="mt-4 text-xs font-bold text-purple-300"
          onClick={() => {
            setMode((value) => (value === "login" ? "register" : "login"));
            setError("");
          }}
        >
          {mode === "login" ? "没有账号？立即注册" : "已有账号？返回登录"}
        </button>
      </GlassCard>
    </div>
  );
}

function CompanyCard({ company, open }: { company: Company; open: () => void }) {
  return (
    <GlassCard className="cursor-pointer p-4 transition hover:border-purple-400/30" onClick={open}>
      <div className="flex items-center gap-3">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl text-lg font-black text-white"
          style={{ background: "linear-gradient(135deg,#1a1050,#7C6EFA)" }}
        >
          {company.logo ? (
            <img src={company.logo} alt="" className="h-full w-full object-cover" />
          ) : (
            company.name.slice(0, 1)
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h3 className="truncate text-sm font-bold text-white">{company.name}</h3>
            {company.verificationStatus === "APPROVED" && (
              <CheckCircle size={13} className="shrink-0 text-green-400" />
            )}
          </div>
          <p className="mt-1 text-[11px] text-white/40">
            {company.industry?.name ?? "行业未设置"} · {company.city ?? "城市未设置"}
          </p>
          <div className="mt-2"><Rating value={company.averageScore} count={company.reviewCount} /></div>
        </div>
      </div>
    </GlassCard>
  );
}

function ScoreGrid({ statistics }: { statistics: CompanyStatistics }) {
  const scores = [
    ["工作体验", statistics.workEnvironmentScore],
    ["管理", statistics.managementScore],
    ["薪资福利", statistics.salaryBenefitScore],
    ["成长空间", statistics.growthScore],
  ];
  return (
    <div className="grid grid-cols-2 gap-2">
      {scores.map(([label, score]) => (
        <div key={String(label)} className="rounded-xl bg-white/5 p-3">
          <p className="text-[10px] text-white/35">{label}</p>
          <p className="mt-1 text-lg font-extrabold text-white">{Number(score).toFixed(1)}</p>
        </div>
      ))}
    </div>
  );
}

function Comments({
  review,
  requireLogin,
}: {
  review: Review;
  requireLogin: () => boolean;
}) {
  const [open, setOpen] = useState(false);
  const [comments, setComments] = useState<ReviewComment[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function toggle() {
    const next = !open;
    setOpen(next);
    if (!next || comments.length) return;
    setLoading(true);
    try {
      const response = await reviewApi.comments(review.id);
      setComments(response.data);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "评论加载失败");
    } finally {
      setLoading(false);
    }
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!content.trim() || !requireLogin()) return;
    setLoading(true);
    setError("");
    try {
      const response = await reviewApi.comment(review.id, content.trim());
      setComments((value) => [...value, response.data]);
      setContent("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "评论发布失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button onClick={toggle} className="flex items-center gap-1 text-[11px] text-white/40">
        <MessageSquare size={12} /> {review.commentCount} 条评论
      </button>
      {open && (
        <div className="mt-3 space-y-2 border-t border-white/5 pt-3">
          {loading && !comments.length && <p className="text-xs text-white/30">评论加载中…</p>}
          {comments.map((comment) => (
            <div key={comment.id} className="rounded-xl bg-white/5 p-3">
              <div className="flex justify-between text-[10px] text-white/30">
                <span>{comment.author.nickname}</span>
                <span>{new Date(comment.createdAt).toLocaleDateString("zh-CN")}</span>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-white/65">{comment.content}</p>
            </div>
          ))}
          {!loading && comments.length === 0 && <p className="text-xs text-white/30">暂无评论</p>}
          <form onSubmit={submit} className="flex gap-2">
            <input
              value={content}
              onChange={(event) => setContent(event.target.value)}
              maxLength={2000}
              placeholder="写下你的评论…"
              className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none placeholder:text-white/25"
            />
            <button
              type="submit"
              disabled={loading || !content.trim()}
              className="rounded-xl bg-purple-500/80 px-3 text-white disabled:opacity-40"
              aria-label="发表评论"
            >
              <Send size={14} />
            </button>
          </form>
          {error && <p className="text-xs text-red-300">{error}</p>}
        </div>
      )}
    </div>
  );
}

function ReviewCard({
  review,
  requireLogin,
}: {
  review: Review;
  requireLogin: () => boolean;
}) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(review.likeCount);
  const [busy, setBusy] = useState(false);

  async function toggleLike() {
    if (!requireLogin() || busy) return;
    setBusy(true);
    try {
      const response = liked ? await reviewApi.unlike(review.id) : await reviewApi.like(review.id);
      setLiked(response.data.liked);
      setLikeCount(response.data.likeCount);
    } catch (reason) {
      if (reason instanceof ApiError && reason.code === "REVIEW_ALREADY_LIKED") {
        setLiked(true);
      }
    } finally {
      setBusy(false);
    }
  }

  const scores = [
    ["体验", review.workEnvironmentScore],
    ["管理", review.managementScore],
    ["福利", review.salaryBenefitScore],
    ["成长", review.growthScore],
  ];
  const typeLabel = {
    INTERNSHIP: "实习经历",
    INTERVIEW: "面试评价",
    WORK: "工作体验",
  }[review.reviewType];

  return (
    <GlassCard className="p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold text-purple-200">匿名用户 · {typeLabel}</p>
          <h3 className="mt-1 text-sm font-extrabold text-white">{review.title}</h3>
        </div>
        <span className="text-[10px] text-white/25">
          {new Date(review.publishedAt ?? review.createdAt).toLocaleDateString("zh-CN")}
        </span>
      </div>
      <div className="mt-2"><Rating value={Number(review.rating)} /></div>
      <p className="mt-3 text-xs leading-relaxed text-white/65">{review.content}</p>
      {(review.advantage || review.disadvantage) && (
        <div className="mt-3 space-y-2 text-[11px] leading-relaxed">
          {review.advantage && (
            <p className="rounded-lg bg-emerald-400/10 p-2 text-emerald-100/75">
              优点：{review.advantage}
            </p>
          )}
          {review.disadvantage && (
            <p className="rounded-lg bg-orange-400/10 p-2 text-orange-100/70">
              需要留意：{review.disadvantage}
            </p>
          )}
        </div>
      )}
      {(review.salary || review.interviewDifficulty) && (
        <p className="mt-3 text-[10px] text-white/40">
          {review.salary ? `税前月薪约 ¥${review.salary.toLocaleString("zh-CN")}` : ""}
          {review.salary && review.interviewDifficulty ? " · " : ""}
          {review.interviewDifficulty ? `面试难度 ${review.interviewDifficulty}/5` : ""}
        </p>
      )}
      <div className="mt-3 grid grid-cols-4 gap-1">
        {scores.map(([label, score]) => (
          <div key={String(label)} className="rounded-lg bg-white/5 p-2 text-center">
            <p className="text-[9px] text-white/30">{label}</p>
            <p className="text-xs font-bold text-white">{score}</p>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-4">
        <button
          disabled={busy}
          onClick={toggleLike}
          className="flex items-center gap-1 text-[11px]"
          style={{ color: liked ? "#B8A8F8" : "rgba(255,255,255,.4)" }}
        >
          <ThumbsUp size={12} fill={liked ? "currentColor" : "none"} /> {likeCount}
        </button>
        <Comments review={review} requireLogin={requireLogin} />
      </div>
    </GlassCard>
  );
}

function ReviewForm({
  companyId,
  close,
}: {
  companyId: string;
  close: (submitted: boolean) => void;
}) {
  const [form, setForm] = useState<CreateReviewInput>({
    title: "",
    reviewType: "WORK",
    experienceType: "FULL_TIME",
    content: "",
    advantage: "",
    disadvantage: "",
    workEnvironmentScore: 4,
    managementScore: 4,
    salaryBenefitScore: 4,
    growthScore: 4,
  });
  const [position, setPosition] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const update = <K extends keyof CreateReviewInput>(key: K, value: CreateReviewInput[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await reviewApi.create(companyId, {
        ...form,
        position: position || undefined,
        workExperience: position || undefined,
        salary: form.salary || undefined,
        interviewDifficulty:
          form.reviewType === "INTERVIEW" ? form.interviewDifficulty ?? 3 : undefined,
      });
      close(true);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "评价发布失败");
    } finally {
      setBusy(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs text-white outline-none placeholder:text-white/25 focus:border-purple-400/60";

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 p-4">
      <form onSubmit={submit} className="mx-auto my-4 max-w-md">
        <GlassCard className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-white">发布真实评价</h2>
              <p className="mt-1 text-[10px] text-white/35">评价默认匿名，审核通过后展示</p>
            </div>
            <button type="button" onClick={() => close(false)} aria-label="关闭">
              <X className="text-white/45" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <select
              className={inputClass}
              value={form.reviewType}
              onChange={(event) => update("reviewType", event.target.value as CreateReviewInput["reviewType"])}
            >
              <option value="INTERNSHIP">实习经历</option>
              <option value="INTERVIEW">面试评价</option>
              <option value="WORK">工作体验</option>
            </select>
            <select
              className={inputClass}
              value={form.experienceType}
              onChange={(event) =>
                update("experienceType", event.target.value as CreateReviewInput["experienceType"])
              }
            >
              <option value="INTERN">实习</option>
              <option value="FULL_TIME">正式</option>
            </select>
          </div>
          <div className="mt-2 space-y-2">
            <input
              className={inputClass}
              required
              minLength={2}
              maxLength={160}
              placeholder="评价标题"
              value={form.title}
              onChange={(event) => update("title", event.target.value)}
            />
            <input
              className={inputClass}
              maxLength={1000}
              placeholder="岗位 / 部门（例如：产品经理实习）"
              value={position}
              onChange={(event) => setPosition(event.target.value)}
            />
            <textarea
              className={`${inputClass} min-h-24 resize-none`}
              required
              minLength={20}
              maxLength={10000}
              placeholder="详细描述面试、实习或工作体验（至少 20 字）"
              value={form.content}
              onChange={(event) => update("content", event.target.value)}
            />
            <textarea
              className={`${inputClass} min-h-16 resize-none`}
              placeholder="优点"
              value={form.advantage}
              onChange={(event) => update("advantage", event.target.value)}
            />
            <textarea
              className={`${inputClass} min-h-16 resize-none`}
              placeholder="需要改进 / 缺点"
              value={form.disadvantage}
              onChange={(event) => update("disadvantage", event.target.value)}
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                className={inputClass}
                type="number"
                min={0}
                max={1000000}
                placeholder="税前月薪（元）"
                value={form.salary ?? ""}
                onChange={(event) => update("salary", Number(event.target.value))}
              />
              {form.reviewType === "INTERVIEW" && (
                <select
                  className={inputClass}
                  value={form.interviewDifficulty ?? 3}
                  onChange={(event) => update("interviewDifficulty", Number(event.target.value))}
                >
                  {[1, 2, 3, 4, 5].map((value) => (
                    <option key={value} value={value}>面试难度 {value}/5</option>
                  ))}
                </select>
              )}
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {([
              ["workEnvironmentScore", "工作体验"],
              ["managementScore", "管理沟通"],
              ["salaryBenefitScore", "薪资福利"],
              ["growthScore", "成长空间"],
            ] as const).map(([key, label]) => (
              <label key={key} className="rounded-xl bg-white/5 p-2 text-[10px] text-white/45">
                <span>{label}</span>
                <select
                  className="ml-2 rounded bg-transparent font-bold text-white"
                  value={form[key]}
                  onChange={(event) => update(key, Number(event.target.value))}
                >
                  {[1, 2, 3, 4, 5].map((value) => (
                    <option key={value} value={value}>{value} 分</option>
                  ))}
                </select>
              </label>
            ))}
          </div>
          {error && <p className="mt-3 rounded-xl bg-red-400/10 p-3 text-xs text-red-300">{error}</p>}
          <div className="mt-4 flex justify-end gap-2">
            <ActionButton secondary onClick={() => close(false)}>取消</ActionButton>
            <ActionButton type="submit" disabled={busy}>
              {busy ? "提交中…" : "提交评价"}
            </ActionButton>
          </div>
        </GlassCard>
      </form>
    </div>
  );
}

function AiAssistantView({ back }: { back: () => void }) {
  const [message, setMessage] = useState("腾讯产品经理实习怎么样？");
  const [conversationId, setConversationId] = useState<string>();
  const [answer, setAnswer] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!message.trim() || busy) return;
    setBusy(true);
    setError("");
    try {
      const response = await aiApi.chat(message.trim(), conversationId);
      setAnswer(response.data.answer);
      setConversationId(response.data.conversationId);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "AI 助手暂时无法回答");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <button onClick={back} className="flex items-center gap-1 text-xs font-bold text-purple-300">
        <ArrowLeft size={15} /> 返回首页
      </button>
      <GlassCard className="p-5">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-purple-400/15 p-3"><Sparkles className="text-purple-200" /></div>
          <div>
            <h2 className="text-lg font-extrabold">AI 求职助手</h2>
            <p className="mt-1 text-xs text-white/40">基于站内企业资料与已审核评价分析</p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {["腾讯产品经理实习怎么样？", "字节跳动研发工作体验如何？", "华为面试难不难？"].map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setMessage(item)}
              className="rounded-full bg-white/5 px-3 py-1.5 text-[10px] text-white/55"
            >
              {item}
            </button>
          ))}
        </div>
      </GlassCard>
      {answer && (
        <GlassCard className="p-4">
          <p className="whitespace-pre-wrap text-xs leading-6 text-white/70">{answer}</p>
        </GlassCard>
      )}
      <form onSubmit={submit} className="relative">
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          maxLength={4000}
          className="min-h-24 w-full resize-none rounded-2xl border border-white/10 bg-white/5 p-4 pr-14 text-sm text-white outline-none placeholder:text-white/25 focus:border-purple-400/50"
          placeholder="输入公司、岗位或面试问题…"
        />
        <button
          type="submit"
          disabled={busy || !message.trim()}
          className="absolute bottom-3 right-3 rounded-xl bg-purple-500 p-2 text-white disabled:opacity-40"
          aria-label="发送"
        >
          <Send size={17} />
        </button>
      </form>
      {busy && <LoadingCard text="正在分析站内企业与评价…" />}
      {error && <p className="rounded-xl bg-red-400/10 p-3 text-xs text-red-300">{error}</p>}
    </div>
  );
}

function CompanyDetailView({
  id,
  back,
  requireLogin,
}: {
  id: string;
  back: () => void;
  requireLogin: () => boolean;
}) {
  const [company, setCompany] = useState<CompanyDetail | null>(null);
  const [statistics, setStatistics] = useState<CompanyStatistics | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [meta, setMeta] = useState<PageMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [favorite, setFavorite] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    Promise.all([companyApi.detail(id), companyApi.statistics(id), reviewApi.list(id)])
      .then(([detail, stats, reviewPage]) => {
        setCompany(detail.data);
        setStatistics(stats.data);
        setReviews(reviewPage.data);
        setMeta(reviewPage.meta);
      })
      .catch((reason) => setError(reason instanceof Error ? reason.message : "企业详情加载失败"))
      .finally(() => setLoading(false));
  }, [id]);

  async function loadMore() {
    if (!meta?.hasMore || loadingMore) return;
    setLoadingMore(true);
    try {
      const response = await reviewApi.list(id, meta.page + 1);
      setReviews((value) => [...value, ...response.data]);
      setMeta(response.meta);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "评价加载失败");
    } finally {
      setLoadingMore(false);
    }
  }

  async function toggleFavorite() {
    if (!requireLogin()) return;
    try {
      const response = favorite ? await companyApi.unfavorite(id) : await companyApi.favorite(id);
      setFavorite(Boolean((response.data as { favorited?: boolean }).favorited));
    } catch (reason) {
      if (reason instanceof ApiError && reason.code === "COMPANY_ALREADY_FAVORITED") {
        setFavorite(true);
      } else {
        setError(reason instanceof Error ? reason.message : "收藏操作失败");
      }
    }
  }

  if (loading) return <LoadingCard text="正在加载企业详情和评分…" />;

  return (
    <div className="space-y-4">
      <button onClick={back} className="flex items-center gap-1 text-xs font-bold text-purple-300">
        <ArrowLeft size={15} /> 返回企业列表
      </button>
      {error && <p className="rounded-xl bg-red-400/10 p-3 text-xs text-red-300">{error}</p>}
      {notice && <p className="rounded-xl bg-emerald-400/10 p-3 text-xs text-emerald-200">{notice}</p>}
      {company && (
        <GlassCard className="p-5">
          <div className="flex items-start gap-3">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-2xl text-xl font-black text-white"
              style={{ background: "linear-gradient(135deg,#1a1050,#7C6EFA)" }}
            >
              {company.name.slice(0, 1)}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-extrabold text-white">{company.name}</h2>
              <p className="mt-1 text-xs text-white/40">
                {company.industry?.name ?? "行业未设置"} · {company.city ?? "城市未设置"}
              </p>
              <div className="mt-2">
                <Rating value={company.averageScore} count={company.reviewCount} />
              </div>
            </div>
            <button onClick={toggleFavorite} aria-label="收藏企业">
              <Bookmark
                size={21}
                className={favorite ? "text-purple-300" : "text-white/30"}
                fill={favorite ? "currentColor" : "none"}
              />
            </button>
          </div>
          <p className="mt-4 text-xs leading-relaxed text-white/60">
            {company.description || "该企业暂未补充介绍。"}
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2 text-[10px] text-white/45">
            <p className="rounded-lg bg-white/5 p-2">规模：{company.companySize ?? "未披露"}</p>
            <p className="rounded-lg bg-white/5 p-2">融资：{company.financingInfo ?? "未披露"}</p>
            <p className="col-span-2 rounded-lg bg-white/5 p-2">地址：{company.address ?? "未披露"}</p>
          </div>
          {company.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {company.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-purple-400/10 px-2 py-1 text-[9px] text-purple-200">
                  {tag}
                </span>
              ))}
            </div>
          )}
          {company.website && (
            <a
              href={company.website}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-block text-[10px] font-bold text-purple-300"
            >
              访问企业官网
            </a>
          )}
        </GlassCard>
      )}
      {statistics && (
        <GlassCard className="p-4">
          <h3 className="mb-3 text-sm font-extrabold text-white">评分统计</h3>
          <ScoreGrid statistics={statistics} />
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-white/5 p-3">
              <p className="text-[10px] text-white/35">薪资范围</p>
              <p className="mt-1 text-sm font-extrabold text-white">
                {statistics.salaryRange.min && statistics.salaryRange.max
                  ? `¥${Math.round(statistics.salaryRange.min / 1000)}k–${Math.round(statistics.salaryRange.max / 1000)}k`
                  : "样本不足"}
              </p>
            </div>
            <div className="rounded-xl bg-white/5 p-3">
              <p className="text-[10px] text-white/35">面试难度</p>
              <p className="mt-1 text-sm font-extrabold text-white">
                {statistics.interviewDifficulty
                  ? `${statistics.interviewDifficulty.toFixed(1)}/5`
                  : "样本不足"}
              </p>
            </div>
          </div>
        </GlassCard>
      )}
      <div className="flex items-end justify-between">
        <div>
          <h3 className="text-base font-extrabold text-white">员工评价</h3>
          <p className="mt-1 text-[10px] text-white/30">仅展示已审核通过的真实评价</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/35">{meta?.total ?? 0} 条</span>
          <ActionButton
            onClick={() => {
              if (requireLogin()) setShowReviewForm(true);
            }}
          >
            发布评价
          </ActionButton>
        </div>
      </div>
      {reviews.map((review) => (
        <ReviewCard key={review.id} review={review} requireLogin={requireLogin} />
      ))}
      {!reviews.length && <EmptyCard text="暂无已审核评价" />}
      {meta?.hasMore && (
        <div className="text-center">
          <ActionButton onClick={loadMore} disabled={loadingMore} secondary>
            {loadingMore ? "加载中…" : "加载更多评价"}
          </ActionButton>
        </div>
      )}
      {showReviewForm && (
        <ReviewForm
          companyId={id}
          close={(submitted) => {
            setShowReviewForm(false);
            if (submitted) setNotice("评价已提交，审核通过后会展示在企业页面。");
          }}
        />
      )}
    </div>
  );
}

export default function App() {
  const { user, ready, logout } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [meta, setMeta] = useState<PageMeta | null>(null);
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [industryId, setIndustryId] = useState("");
  const [searchText, setSearchText] = useState("");
  const [search, setSearch] = useState("");
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(() => {
    const match = window.location.pathname.match(/^\/companies\/([0-9a-f-]+)$/i);
    return match?.[1] ?? null;
  });
  const [aiOpen, setAiOpen] = useState(() => window.location.pathname === "/ai");
  const [homeCategory, setHomeCategory] = useState<HomeCategoryType>("RECOMMEND");
  const [showAuth, setShowAuth] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    companyApi.list({ page: 1, pageSize: 20, search, industryId })
      .then((response) => {
        setCompanies(response.data);
        setMeta(response.meta);
        setIndustries((current) => {
          const map = new Map(current.map((item) => [item.id, item]));
          response.data.forEach((company) => {
            if (company.industry) map.set(company.industry.id, company.industry);
          });
          return [...map.values()];
        });
      })
      .catch((reason) => setError(reason instanceof Error ? reason.message : "企业列表加载失败"))
      .finally(() => setLoading(false));
  }, [industryId, search]);

  useEffect(() => {
    const handlePopState = () => {
      const companyMatch = window.location.pathname.match(/^\/companies\/([0-9a-f-]+)$/i);
      setSelectedCompanyId(companyMatch?.[1] ?? null);
      setAiOpen(window.location.pathname === "/ai");
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const openCompany = (id: string) => {
    setAiOpen(false);
    setSelectedCompanyId(id);
    window.history.pushState({}, "", `/companies/${id}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openAi = () => {
    setSelectedCompanyId(null);
    setAiOpen(true);
    window.history.pushState({}, "", "/ai");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goHome = () => {
    setSelectedCompanyId(null);
    setAiOpen(false);
    window.history.pushState({}, "", "/");
  };

  async function submitSearch(event: React.FormEvent) {
    event.preventDefault();
    const value = searchText.trim();
    setSearch(value);
    if (!value) return;
    try {
      const response = await companyApi.list({ page: 1, pageSize: 20, search: value });
      const exact = response.data.find(
        (company) => company.name.toLocaleLowerCase() === value.toLocaleLowerCase(),
      );
      if (exact || response.data.length === 1) openCompany((exact ?? response.data[0]).id);
    } catch {
      // The list request below will display the existing API error state.
    }
  }

  const requireLogin = () => {
    if (user) return true;
    setShowAuth(true);
    return false;
  };

  const title = useMemo(
    () => (aiOpen ? "AI 求职助手" : selectedCompanyId ? "企业详情" : "发现值得信赖的企业"),
    [aiOpen, selectedCompanyId],
  );

  return (
    <div
      className="min-h-screen text-white"
      style={{ background: "#06081A", fontFamily: "'Plus Jakarta Sans','Inter',sans-serif" }}
    >
      <StarField />
      <div className="relative z-10 mx-auto max-w-md px-4 pb-10 pt-6">
        <header className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl"
              style={{
                background: "linear-gradient(135deg,#7C6EFA,#B490F5)",
                boxShadow: "0 4px 18px rgba(124,110,250,.5)",
              }}
            >
              <Sparkles size={18} />
            </div>
            <div>
              <h1 className="text-base font-extrabold">JobCheck</h1>
              <p className="text-[10px] text-white/30">{title}</p>
            </div>
          </div>
          {ready && user ? (
            <div className="flex items-center gap-2">
              <span className="max-w-24 truncate text-xs font-bold text-purple-200">
                <User size={12} className="mr-1 inline" />{user.nickname}
              </span>
              <button onClick={logout} aria-label="退出登录"><LogOut size={17} className="text-white/35" /></button>
            </div>
          ) : (
            <button
              onClick={() => setShowAuth(true)}
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-purple-200"
            >
              <LogIn size={14} /> 登录
            </button>
          )}
        </header>

        {aiOpen ? (
          <AiAssistantView back={goHome} />
        ) : selectedCompanyId ? (
          <CompanyDetailView
            id={selectedCompanyId}
            back={goHome}
            requireLogin={requireLogin}
          />
        ) : (
          <main className="space-y-4">
            <HomeCategories
              active={homeCategory}
              onChange={setHomeCategory}
              onOpenCompany={openCompany}
              onOpenAi={openAi}
            />
            {homeCategory === "RECOMMEND" && (
              <>
            <form
              onSubmit={submitSearch}
              className="relative"
            >
              <Search className="absolute left-3 top-3 text-white/25" size={17} />
              <input
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                placeholder="搜索企业名称"
                className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-10 pr-20 text-sm text-white outline-none placeholder:text-white/25 focus:border-purple-400/50"
              />
              <button
                type="submit"
                className="absolute right-2 top-2 rounded-xl bg-purple-500/80 px-3 py-1.5 text-xs font-bold"
              >
                搜索
              </button>
            </form>
            <nav className="flex gap-2 overflow-x-auto pb-1" aria-label="行业分类">
              <button
                onClick={() => setIndustryId("")}
                className="shrink-0 rounded-full px-3 py-1.5 text-[11px] font-bold"
                style={{
                  background: !industryId ? "linear-gradient(135deg,#7C6EFA,#B490F5)" : "rgba(255,255,255,.07)",
                  color: !industryId ? "white" : "rgba(255,255,255,.45)",
                }}
              >
                全部
              </button>
              {industries.map((industry) => (
                <button
                  key={industry.id}
                  onClick={() => setIndustryId(industry.id)}
                  className="shrink-0 rounded-full px-3 py-1.5 text-[11px] font-bold"
                  style={{
                    background: industryId === industry.id
                      ? "linear-gradient(135deg,#7C6EFA,#B490F5)"
                      : "rgba(255,255,255,.07)",
                    color: industryId === industry.id ? "white" : "rgba(255,255,255,.45)",
                  }}
                >
                  {industry.name}
                </button>
              ))}
            </nav>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-extrabold">企业列表</h2>
              <span className="text-xs text-white/30">共 {meta?.total ?? 0} 家</span>
            </div>
            {error && <p className="rounded-xl bg-red-400/10 p-3 text-xs text-red-300">{error}</p>}
            {loading ? (
              <LoadingCard />
            ) : companies.length ? (
              <div className="space-y-3">
                {companies.map((company) => (
                  <CompanyCard
                    key={company.id}
                    company={company}
                    open={() => openCompany(company.id)}
                  />
                ))}
              </div>
            ) : (
              <EmptyCard text="没有找到符合条件的企业" />
            )}
              </>
            )}
          </main>
        )}
      </div>
      {showAuth && <AuthDialog close={() => setShowAuth(false)} />}
    </div>
  );
}
