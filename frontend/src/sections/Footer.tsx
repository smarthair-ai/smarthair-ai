import { motion } from "framer-motion";
import {
  Scissors,
  Shield,
  Lock,
  Trash2,
  FileText,
  Mail,
  Github,
  Twitter,
  Linkedin,
  ArrowUp,
  Heart,
} from "lucide-react";

const footerLinks = [
  {
    title: "产品",
    links: [
      { label: "功能演示", href: "#features" },
      { label: "Demo 体验", href: "#demo" },
      { label: "技术架构", href: "#architecture" },
      { label: "预约演示", href: "#contact" },
    ],
  },
  {
    title: "资源",
    links: [
      { label: "技术白皮书", href: "#" },
      { label: "发型数据库", href: "#" },
      { label: "API 文档", href: "#" },
      { label: "更新日志", href: "#" },
    ],
  },
  {
    title: "法律",
    links: [
      { label: "隐私政策", href: "#" },
      { label: "用户协议", href: "#" },
      { label: "数据安全", href: "#" },
      { label: "Cookie 政策", href: "#" },
    ],
  },
];

const socials = [
  { icon: Github, href: "#", label: "GitHub" },
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
  { icon: Mail, href: "#", label: "Email" },
];

export default function Footer() {
  const scrollTo = (href: string) => {
    if (href === "#") return;
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative border-t border-white/5 overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[200px] bg-[var(--neon-purple)] opacity-5 blur-[100px] rounded-full" />

      {/* Privacy badge strip */}
      <div className="container relative z-10 pt-12 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="glass-card rounded-2xl p-5 md:p-6 mb-12"
        >
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="w-12 h-12 rounded-xl bg-[var(--success)]/15 flex items-center justify-center">
                <Shield className="w-6 h-6 text-[var(--success)]" />
              </div>
              <div>
                <div className="text-base font-semibold text-white">隐私保护承诺</div>
                <div className="text-xs text-[var(--muted-foreground)]">您的数据安全是我们的第一优先级</div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1 w-full">
              <div className="flex items-center gap-2 p-3 rounded-xl bg-white/5">
                <Lock className="w-4 h-4 text-[var(--neon-cyan)] flex-shrink-0" />
                <div>
                  <div className="text-xs font-medium text-white">加密存储</div>
                  <div className="text-[10px] text-[var(--muted-foreground)]">数据全程加密</div>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-xl bg-white/5">
                <Trash2 className="w-4 h-4 text-[var(--neon-cyan)] flex-shrink-0" />
                <div>
                  <div className="text-xs font-medium text-white">定期清除</div>
                  <div className="text-[10px] text-[var(--muted-foreground)]">不长期留存</div>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-xl bg-white/5">
                <Shield className="w-4 h-4 text-[var(--neon-cyan)] flex-shrink-0" />
                <div>
                  <div className="text-xs font-medium text-white">不存储人脸</div>
                  <div className="text-[10px] text-[var(--muted-foreground)]">仅用于实时分析</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Main footer */}
      <div className="container relative z-10 pb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[var(--neon-purple)] to-[var(--neon-cyan)] flex items-center justify-center">
                <Scissors className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-base font-bold text-white">SmartHair AI</span>
                <span className="text-[10px] text-[var(--neon-cyan)] tracking-widest">智能发型设计系统</span>
              </div>
            </div>
            <p className="text-sm text-[var(--muted-foreground)] leading-relaxed max-w-xs mb-4">
              基于计算机视觉与大语言模型，融合 AR 虚拟试戴技术，重新定义理发沟通方式。
              AI精准推荐 + AR真实预览 + 施工参数落地。
            </p>
            <div className="flex gap-2">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="w-9 h-9 rounded-lg glass-card glass-card-hover flex items-center justify-center text-[var(--muted-foreground)] hover:text-white transition-colors"
                >
                  <s.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {footerLinks.map((group) => (
            <div key={group.title}>
              <h4 className="text-sm font-semibold text-white mb-4">{group.title}</h4>
              <ul className="space-y-2.5">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <button
                      onClick={() => scrollTo(link.href)}
                      className="text-sm text-[var(--muted-foreground)] hover:text-white transition-colors text-left"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">联系我们</h4>
            <ul className="space-y-2.5">
              <li className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
                <Mail className="w-3.5 h-3.5" />
                <span>business@smarthair.ai</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
                <FileText className="w-3.5 h-3.5" />
                <span>技术白皮书</span>
              </li>
            </ul>
            <button
              onClick={() => scrollTo("#contact")}
              className="mt-4 px-4 py-2 rounded-lg bg-gradient-to-r from-[var(--neon-purple)] to-[var(--neon-cyan)] text-white text-sm font-medium hover:shadow-[0_0_20px_oklch(0.65_0.25_300/0.3)] transition-shadow"
            >
              免费获取部署方案
            </button>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-xs text-[var(--muted-foreground)] flex items-center gap-1.5">
            <span>© 2026 SmartHair AI</span>
            <span>·</span>
            <span>基于 AI + AR 技术研究</span>
            <span>·</span>
            <span className="flex items-center gap-1">
              Made with <Heart className="w-3 h-3 text-[var(--neon-pink)] fill-current" />
            </span>
          </div>
          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass-card glass-card-hover text-xs text-[var(--muted-foreground)] hover:text-white transition-colors"
          >
            <ArrowUp className="w-3.5 h-3.5" />
            回到顶部
          </button>
        </div>
      </div>
    </footer>
  );
}
