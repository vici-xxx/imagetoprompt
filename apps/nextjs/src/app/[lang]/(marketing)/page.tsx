import Link from "next/link";
import { Button } from "@saasfly/ui/button";
import type { Locale } from "~/config/i18n-config";
import { getDictionary } from "~/lib/get-dictionary";

export default async function IndexPage({
  params: { lang },
}: {
  params: { lang: Locale };
}) {
  const dict = await getDictionary(lang);
  return (
    <>
      <section className="container py-20">
        <h1 className="text-4xl md:text-5xl font-semibold leading-tight">
          Create Better AI Art with <span className="text-primary">Image Prompt</span>
        </h1>
        <p className="mt-6 text-neutral-500 dark:text-neutral-400 max-w-2xl">
          Inspire ideas, enhance image prompts, and create masterpieces with an all-in-one toolkit.
        </p>
        <div className="mt-8 flex gap-4">
          <Link href={`/${lang}/imageprompt/generator`}><Button>{dict.marketing.get_started}</Button></Link>
          <Link href="#imageprompt-faq"><Button variant="outline">FAQ</Button></Link>
        </div>
      </section>

      <section id="imageprompt-tools" className="container py-16">
        <h2 className="text-3xl font-semibold">AI 图片提示工具</h2>
        <p className="mt-2 text-neutral-500 dark:text-neutral-400">覆盖从灵感到生成的完整流程，保持 Saasfly 的配色与样式。</p>
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            {title:"图片转提示词",desc:"上传图片，一键生成高质量提示词，提升二次生成效果。",cta:"开始使用"},
            {title:"提示词增强器",desc:"将你的想法扩写为更具描述性与风格化的提示词。",cta:"立即增强"},
            {title:"AI 图片生成",desc:"用优化后的提示词快速生成精美图片。",cta:"生成图片"},
            {title:"AI 图像描述",desc:"自动识别并详细描述图像内容，支持问答。",cta:"生成描述"},
          ].map((card)=> (
            <div key={card.title} className="rounded-xl border p-6 bg-background/50">
              <h3 className="text-xl font-semibold">{card.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{card.desc}</p>
              <div className="mt-4">
                <Link href={`/${lang}/imageprompt/generator`}>
                  <Button size="sm">{card.cta}</Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="inspiration" className="container py-16">
        <h2 className="text-3xl font-semibold">灵感画廊</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({length:6}).map((_,i)=> (
            <div key={i} className="aspect-[4/3] rounded-xl border overflow-hidden bg-muted/30" />
          ))}
        </div>
      </section>

      <section id="imageprompt-faq" className="container pb-24">
        <h2 className="text-3xl font-semibold">常见问题</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {[
            {q:"什么是提示词（Image Prompt）？",a:"它是一组指令，帮助 AI 按你的期望生成图片。"},
            {q:"是否免费？",a:"核心功能免费，可按需升级更多配额。"},
            {q:"如何保护隐私？",a:"图像实时处理，不做持久化存储。"},
            {q:"如何写好提示词？",a:"清晰描述主体、场景、风格、光线与细节。"},
          ].map((item)=> (
            <div key={item.q} className="rounded-xl border p-5 bg-background/50">
              <div className="font-medium">{item.q}</div>
              <div className="mt-1 text-sm text-muted-foreground">{item.a}</div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
