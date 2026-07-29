import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Store,
  User,
  Mail,
  Phone,
  MessageSquare,
  CheckCircle2,
  Send,
  Loader2,
} from "lucide-react";

type FormState = {
  name: string;
  company: string;
  phone: string;
  email: string;
  storeType: string;
  message: string;
};

const initialForm: FormState = {
  name: "",
  company: "",
  phone: "",
  email: "",
  storeType: "single",
  message: "",
};

const storeTypes = [
  { value: "single", label: "单店理发店" },
  { value: "chain", label: "连锁美发品牌" },
  { value: "training", label: "美发培训机构" },
  { value: "other", label: "其他" },
];

export default function ContactForm() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (
    field: keyof FormState,
    value: string
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone) return;
    setSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 1500);
  };

  const handleReset = () => {
    setForm(initialForm);
    setSubmitted(false);
  };

  return (
    <section id="contact" className="relative py-20 md:py-28 overflow-hidden">
      <div className="absolute top-1/3 left-1/3 w-[600px] h-[500px] bg-[var(--neon-purple)] opacity-5 blur-[130px] rounded-full" />

      <div className="container relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left: Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="flex flex-col gap-5"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card w-fit">
              <Store className="w-4 h-4 text-[var(--neon-cyan)]" />
              <span className="text-sm text-[var(--muted-foreground)]">商家合作咨询</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
              <span className="text-white">让 AI 赋能</span>
              <br />
              <span className="text-gradient">你的美发门店</span>
            </h2>
            <p className="text-base md:text-lg text-[var(--muted-foreground)] leading-relaxed">
              填写下方表单，我们的商务团队将在 24 小时内与您联系，
              提供专属的 SmartHair AI 部署方案与报价。
            </p>

            {/* Benefits */}
            <div className="grid sm:grid-cols-2 gap-3 mt-2">
              {[
                { icon: "🚀", title: "快速部署", desc: "镜面设备即装即用" },
                { icon: "💰", title: "低门槛投入", desc: "免费基础+增值分成" },
                { icon: "📈", title: "提升翻台率", desc: "减少沟通耗时" },
                { icon: "🎯", title: "差异化竞争", desc: "科技引流新客" },
              ].map((item) => (
                <div
                  key={item.title}
                  className="glass-card rounded-xl p-4 flex items-start gap-3"
                >
                  <span className="text-2xl flex-shrink-0">{item.icon}</span>
                  <div>
                    <div className="text-sm font-medium text-white">{item.title}</div>
                    <div className="text-xs text-[var(--muted-foreground)] mt-0.5">
                      {item.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right: Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="glass-card rounded-2xl p-6 md:p-8"
          >
            <AnimatePresence mode="wait">
              {!submitted ? (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onSubmit={handleSubmit}
                  className="space-y-4"
                >
                  <div className="grid sm:grid-cols-2 gap-4">
                    {/* Name */}
                    <div>
                      <label className="text-xs text-[var(--muted-foreground)] mb-1.5 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5" />
                        姓名 <span className="text-[var(--neon-pink)]">*</span>
                      </label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        placeholder="请输入您的姓名"
                        required
                        className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--neon-purple)]/50 focus:ring-1 focus:ring-[var(--neon-purple)]/30 transition-all"
                      />
                    </div>
                    {/* Company */}
                    <div>
                      <label className="text-xs text-[var(--muted-foreground)] mb-1.5 flex items-center gap-1.5">
                        <Store className="w-3.5 h-3.5" />
                        门店/品牌名称
                      </label>
                      <input
                        type="text"
                        value={form.company}
                        onChange={(e) => handleChange("company", e.target.value)}
                        placeholder="请输入门店或品牌名称"
                        className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--neon-purple)]/50 focus:ring-1 focus:ring-[var(--neon-purple)]/30 transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    {/* Phone */}
                    <div>
                      <label className="text-xs text-[var(--muted-foreground)] mb-1.5 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5" />
                        联系电话 <span className="text-[var(--neon-pink)]">*</span>
                      </label>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => handleChange("phone", e.target.value)}
                        placeholder="请输入手机号码"
                        required
                        className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--neon-purple)]/50 focus:ring-1 focus:ring-[var(--neon-purple)]/30 transition-all"
                      />
                    </div>
                    {/* Email */}
                    <div>
                      <label className="text-xs text-[var(--muted-foreground)] mb-1.5 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5" />
                        邮箱
                      </label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        placeholder="请输入邮箱地址"
                        className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--neon-purple)]/50 focus:ring-1 focus:ring-[var(--neon-purple)]/30 transition-all"
                      />
                    </div>
                  </div>

                  {/* Store type */}
                  <div>
                    <label className="text-xs text-[var(--muted-foreground)] mb-1.5 block">
                      门店类型
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {storeTypes.map((type) => (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => handleChange("storeType", type.value)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            form.storeType === type.value
                              ? "bg-gradient-to-r from-[var(--neon-purple)] to-[var(--neon-cyan)] text-white"
                              : "bg-white/5 text-[var(--muted-foreground)] hover:bg-white/10"
                          }`}
                        >
                          {type.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="text-xs text-[var(--muted-foreground)] mb-1.5 flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5" />
                      留言
                    </label>
                    <textarea
                      value={form.message}
                      onChange={(e) => handleChange("message", e.target.value)}
                      placeholder="请描述您的需求或问题..."
                      rows={3}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--neon-purple)]/50 focus:ring-1 focus:ring-[var(--neon-purple)]/30 transition-all resize-none"
                    />
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={submitting || !form.name || !form.phone}
                    className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                      !submitting && form.name && form.phone
                        ? "neon-button bg-gradient-to-r from-[var(--neon-purple)] to-[var(--neon-cyan)] text-white hover:shadow-[0_0_30px_oklch(0.65_0.25_300/0.4)]"
                        : "bg-white/5 text-[var(--muted-foreground)] cursor-not-allowed"
                    }`}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>提交中...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>提交咨询</span>
                      </>
                    )}
                  </button>

                  <p className="text-[10px] text-[var(--muted-foreground)] text-center">
                    提交即表示同意我们的隐私政策，您的信息将被严格保密
                  </p>
                </motion.form>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-12 text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                    className="w-16 h-16 rounded-full bg-[var(--success)]/15 flex items-center justify-center mb-4"
                  >
                    <CheckCircle2 className="w-8 h-8 text-[var(--success)]" />
                  </motion.div>
                  <h3 className="text-lg font-bold text-white mb-2">提交成功！</h3>
                  <p className="text-sm text-[var(--muted-foreground)] max-w-xs mb-6">
                    感谢您的咨询，我们的商务团队将在 24 小时内通过电话与您联系。
                  </p>
                  <button
                    onClick={handleReset}
                    className="px-5 py-2 rounded-xl glass-card glass-card-hover text-sm text-white font-medium"
                  >
                    再次提交
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
