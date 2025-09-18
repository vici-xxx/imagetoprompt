import Link from "next/link";
import Image from "next/image";
import { Button } from "@saasfly/ui/button";
import * as Icons from "@saasfly/ui/icons";

export default function ImagePromptLanding({ params }: { params: { lang: string } }) {
  const lang = params.lang === "zh" ? "zh" : "en";
  const t = lang === "zh" ? {
    title: "AI 驱动的图像提示工具",
    subtitle: "将您的图像转换为详细的提示词以优化生成。",
    tryNow: "立即体验",
    tutorials: "教程",
    sectionTools: "AI 图像提示工具",
    sectionInspiration: "灵感库",
    sectionFaq: "常见问题",
    cards: {
      img2prompt: { title: "Image to Prompt 图像提示", desc: "将您的图像转换为详细的提示词以优化生成。", cta: "生成提示" },
      promptGen: { title: "Image Prompt Generator 图像提示生成器", desc: "将想法转化为详细、AI 优化的提示。", cta: "生成提示" },
      imgGen: { title: "AI Image Generator AI 图像生成器", desc: "根据提示词创建令人惊叹的图像。", cta: "生成图像" },
      describe: { title: "AI Describe Image AI 描述图像", desc: "通过 AI 描述和问答来理解图像。", cta: "生成描述" },
    },
  } : {
    title: "AI Powered Image Prompt Tools",
    subtitle: "Transform your image into detailed prompts to optimize generation.",
    tryNow: "Try it now",
    tutorials: "Tutorials",
    sectionTools: "AI Powered Image Prompt Tools",
    sectionInspiration: "Inspiration from Image Prompt",
    sectionFaq: "Frequently Asked Questions",
    cards: {
      img2prompt: { title: "Image to Prompt", desc: "Transform your image into detailed prompts to optimize generation.", cta: "Generate Prompt" },
      promptGen: { title: "Image Prompt Generator", desc: "Turn ideas into detailed, AI-optimized prompts.", cta: "Generate Prompt" },
      imgGen: { title: "AI Image Generator", desc: "Create stunning images from your prompts.", cta: "Generate Image" },
      describe: { title: "AI Describe Image", desc: "Understand images with AI descriptions and Q&A.", cta: "Generate Description" },
    },
  };
  return (
    <main className="min-h-screen">
      <section className="container py-20">
        <div className="grid grid-cols-1 gap-10 xl:grid-cols-2 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-semibold leading-tight">{t.title}</h1>
            <p className="mt-6 text-neutral-500 dark:text-neutral-400 max-w-2xl">{t.subtitle}</p>
            <div className="mt-8 flex gap-4">
              <Link href="#tools"><Button>{t.tryNow}</Button></Link>
              <Link href="#tutorials"><Button variant="outline">{t.tutorials}</Button></Link>
              <div className="ml-auto">
                <div className="flex items-center gap-2 text-sm">
                  <span>{lang === "zh" ? "语言" : "Language"}:</span>
                  <Link href={`/en/imageprompt`} className={lang === "en" ? "underline" : "opacity-70 hover:opacity-100"}>EN</Link>
                  <span>/</span>
                  <Link href={`/zh/imageprompt`} className={lang === "zh" ? "underline" : "opacity-70 hover:opacity-100"}>中文</Link>
                </div>
              </div>
            </div>
          </div>
          <div className="relative h-[280px] md:h-[360px] rounded-xl border bg-muted/30" />
        </div>
      </section>

      <section id="tools" className="container py-16">
        <h2 className="text-3xl font-semibold">{t.sectionTools}</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {[
            {title:t.cards.img2prompt.title,desc:t.cards.img2prompt.desc,cta:t.cards.img2prompt.cta, href:`/${lang}/imageprompt/generator`},
            {title:t.cards.promptGen.title,desc:t.cards.promptGen.desc,cta:t.cards.promptGen.cta},
            {title:t.cards.imgGen.title,desc:t.cards.imgGen.desc,cta:t.cards.imgGen.cta},
            {title:t.cards.describe.title,desc:t.cards.describe.desc,cta:t.cards.describe.cta},
          ].map((card)=> (
            <div key={card.title} className="rounded-xl border p-6 bg-background/50">
              <h3 className="text-xl font-semibold">{card.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{card.desc}</p>
              <div className="mt-4">
                {card.href ? (
                  <Link href={card.href}><Button size="sm">{card.cta}</Button></Link>
                ) : (
                  <Button size="sm">{card.cta}</Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="inspiration" className="container py-16">
        <h2 className="text-3xl font-semibold">{t.sectionInspiration}</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({length:6}).map((_,i)=> (
            <div key={i} className="aspect-[4/3] rounded-xl border overflow-hidden bg-muted/30" />
          ))}
        </div>
      </section>

      <section id="faq" className="container py-16">
        <h2 className="text-3xl font-semibold">{t.sectionFaq}</h2>
        <div className="mt-6 space-y-4">
          {[
            {q:"What is an Image Prompt?",a:"A set of instructions guiding AI to create specific images."},
            {q:"Is ImagePrompt.org free to use?",a:"Core features are free with optional upgrades."},
            {q:"How is privacy handled?",a:"Images are processed in real-time and not stored."},
          ].map((item)=> (
            <div key={item.q} className="rounded-xl border p-5">
              <div className="font-medium">{item.q}</div>
              <div className="mt-1 text-sm text-muted-foreground">{item.a}</div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}


