import { motion } from "framer-motion";
import {
  Briefcase,
  Store,
  User,
  Check,
  X,
} from "lucide-react";
import { businessModel, cases } from "@/data/content";
import femaleCaseImg from "@/assets/images/Professional_hairstyle_photo_o_2026-07-29T12-12-01.png";
import maleCaseImg from "@/assets/images/Professional_hairstyle_photo_o_2026-07-29T12-12-29.png";

// 显式图标映射
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Store,
  User,
};

const caseImages = [femaleCaseImg, maleCaseImg];

export default function BusinessModel() {
  const B2bIcon = iconMap[businessModel.b2b.icon];
  const B2cIcon = iconMap[businessModel.b2c.icon];

  return (
    <section id="business" className="relative py-20 md:py-28 overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[400px] bg-[var(--neon-purple)] opacity-5 blur-[120px] rounded-full" />

      <div className="container relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card mb-4">
            <Briefcase className="w-4 h-4 text-[var(--neon-cyan)]" />
            <span className="text-sm text-[var(--muted-foreground)]">商业模式</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            <span className="text-white">B端赋能 + C端体验</span>
            <span className="text-gradient">分层盈利</span>
          </h2>
          <p className="text-base md:text-lg text-[var(--muted-foreground)] max-w-2xl mx-auto">
            免费+付费分层模式，用户接受门槛低，盈利逻辑清晰
          </p>
        </motion.div>

        {/* B2B + B2C cards */}
        <div className="grid lg:grid-cols-2 gap-6 mb-12">
          {/* B2B */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
            className="glass-card rounded-2xl p-6 md:p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-[var(--neon-purple)]/15 flex items-center justify-center">
                {B2bIcon && <B2bIcon className="w-6 h-6 text-[var(--neon-purple)]" />}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{businessModel.b2b.title}</h3>
                <p className="text-xs text-[var(--muted-foreground)]">美发门店 · 连锁品牌 · 培训机构</p>
              </div>
            </div>
            <div className="space-y-3">
              {businessModel.b2b.items.map((item, i) => (
                <div key={item.title} className="flex items-start gap-3 p-3 rounded-xl bg-white/5">
                  <div className="w-8 h-8 rounded-lg bg-[var(--neon-purple)]/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-[var(--neon-purple)]">{i + 1}</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-white mb-0.5">{item.title}</h4>
                    <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* B2C */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
            className="glass-card rounded-2xl p-6 md:p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-[var(--neon-cyan)]/15 flex items-center justify-center">
                {B2cIcon && <B2cIcon className="w-6 h-6 text-[var(--neon-cyan)]" />}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{businessModel.b2c.title}</h3>
                <p className="text-xs text-[var(--muted-foreground)]">消费者 · 追求个性化发型</p>
              </div>
            </div>
            <div className="space-y-3">
              {businessModel.b2c.items.map((item, i) => (
                <div key={item.title} className="flex items-start gap-3 p-3 rounded-xl bg-white/5">
                  <div className="w-8 h-8 rounded-lg bg-[var(--neon-cyan)]/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-[var(--neon-cyan)]">{i + 1}</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-white mb-0.5">{item.title}</h4>
                    <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Pricing Table */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="glass-card rounded-2xl p-6 md:p-8 mb-12"
        >
          <h3 className="text-base font-semibold text-white mb-5 text-center">免费 vs 付费功能对比</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-sm font-medium text-[var(--muted-foreground)]">功能模块</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-white">
                    <div>免费基础服务</div>
                    <div className="text-xs text-[var(--muted-foreground)] mt-0.5">¥0</div>
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gradient">
                    <div>付费增值服务</div>
                    <div className="text-xs text-[var(--neon-cyan)] mt-0.5">¥3-5/次</div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {businessModel.pricingTable.map((row, i) => (
                  <tr key={row.feature} className={i % 2 === 0 ? "" : "bg-white/[0.02]"}>
                    <td className="py-3 px-4 text-sm text-white">{row.feature}</td>
                    <td className="py-3 px-4 text-center">
                      {row.free ? (
                        <Check className="w-4 h-4 text-[var(--success)] mx-auto" />
                      ) : (
                        <X className="w-4 h-4 text-[var(--muted-foreground)] mx-auto" />
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {row.paid ? (
                        <Check className="w-4 h-4 text-[var(--neon-purple)] mx-auto" />
                      ) : (
                        <X className="w-4 h-4 text-[var(--muted-foreground)] mx-auto" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Case studies */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
        >
          <h3 className="text-base font-semibold text-white mb-5 text-center">模拟案例展示</h3>
          <div className="grid md:grid-cols-2 gap-6">
            {cases.map((c, i) => (
              <motion.div
                key={c.age}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className="glass-card glass-card-hover rounded-2xl p-6"
              >
                <div className="flex items-start gap-4">
                  {/* Avatar - real photo */}
                  <div
                    className={`w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0 border ${
                      c.gender === "女生"
                        ? "border-[var(--neon-pink)]/30"
                        : "border-[var(--neon-cyan)]/30"
                    }`}
                  >
                    <img
                      src={caseImages[i]}
                      alt={`${c.gender}发型推荐案例 — ${c.recommendation}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-base font-semibold text-white">
                        {c.age}
                        {c.gender}
                      </span>
                      <span className="text-xs text-[var(--muted-foreground)]">· {c.scene}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/5 text-[var(--muted-foreground)]">
                        {c.faceShape}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/5 text-[var(--muted-foreground)]">
                        {c.hairType}
                      </span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-2xl font-bold text-gradient">{c.score}</div>
                    <div className="text-[10px] text-[var(--muted-foreground)]">匹配度</div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-white/5">
                  <div className="text-xs text-[var(--muted-foreground)] mb-1">推荐发型</div>
                  <div className="text-sm font-medium text-white mb-2">{c.recommendation}</div>
                  <p className="text-xs text-[var(--muted-foreground)] leading-relaxed mb-3">
                    {c.reason}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {c.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded-full text-[10px] bg-[var(--neon-purple)]/10 text-[var(--neon-purple)]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
