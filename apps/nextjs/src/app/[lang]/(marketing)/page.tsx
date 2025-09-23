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
          {dict.marketing.i2p_title} <span className="text-primary">Image Prompts</span>
        </h1>
        <p className="mt-6 text-neutral-500 dark:text-neutral-400 max-w-2xl" dangerouslySetInnerHTML={{ __html: dict.marketing.i2p_desc }} />
        <div className="mt-8 flex gap-4">
          <Link href={`/${lang}/imageprompt/generator`}><Button>{dict.marketing.get_started}</Button></Link>
          <Link href="#imageprompt-faq"><Button variant="outline">FAQ</Button></Link>
        </div>
      </section>

      <section id="imageprompt-tools" className="container py-16">
        <h2 className="text-3xl font-semibold">{dict.marketing.tools_title}</h2>
        <p className="mt-2 text-neutral-500 dark:text-neutral-400" dangerouslySetInnerHTML={{ __html: dict.marketing.tools_desc }} />
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            {title: dict.marketing.card1_title, desc: dict.marketing.card1_desc, cta: dict.marketing.card1_cta},
            {title: dict.marketing.card2_title, desc: dict.marketing.card2_desc, cta: dict.marketing.card2_cta},
            {title: dict.marketing.card3_title, desc: dict.marketing.card3_desc, cta: dict.marketing.card3_cta},
            {title: dict.marketing.card4_title, desc: dict.marketing.card4_desc, cta: dict.marketing.card4_cta},
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


      <section id="imageprompt-faq" className="container pb-24">
        <h2 className="text-3xl font-semibold">{dict.marketing.faq_title}</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {[
            {q: dict.marketing.faq1_q, a: dict.marketing.faq1_a},
            {q: dict.marketing.faq2_q, a: dict.marketing.faq2_a},
            {q: dict.marketing.faq3_q, a: dict.marketing.faq3_a},
            {q: dict.marketing.faq4_q, a: dict.marketing.faq4_a},
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
