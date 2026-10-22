import type { ReactNode } from "react"
import { LEGAL_UPDATED } from "@/lib/config"
import { SiteFooter } from "./site-footer"
import { SiteHeader } from "./site-header"
import { card } from "./ui"

type Section = { id: string; title: string; body: ReactNode }

export function LegalPage({ title, intro, sections }: { title: string; intro: string; sections: Section[] }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-3xl">
          <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">Last updated {LEGAL_UPDATED}</p>
          <p className="mt-6 text-pretty text-muted-foreground">{intro}</p>
        </div>

        <div className="mx-auto mt-10 grid max-w-3xl gap-8 lg:max-w-none lg:grid-cols-[14rem_1fr] lg:gap-12">
          <nav aria-label="On this page" className="lg:sticky lg:top-20 lg:self-start">
            <ol className="hidden space-y-1 text-sm lg:block">
              {sections.map((s, i) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="flex gap-2 rounded-md px-2 py-1 text-muted-foreground hover:bg-muted hover:text-foreground">
                    <span className="w-5 shrink-0 tabular-nums">{i + 1}.</span>
                    {s.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <article className={`${card} divide-y divide-border/60 px-5 sm:px-8`}>
            {sections.map((s, i) => (
              <section key={s.id} id={s.id} className="scroll-mt-20 py-7 sm:py-8">
                <h2 className="text-lg font-semibold">
                  <span className="mr-2 text-muted-foreground tabular-nums">{i + 1}.</span>
                  {s.title}
                </h2>
                <div className="mt-3 space-y-3 text-sm leading-relaxed text-pretty text-muted-foreground [&_li]:ml-5 [&_li]:list-disc [&_strong]:font-medium [&_strong]:text-foreground [&_ul]:space-y-1.5">
                  {s.body}
                </div>
              </section>
            ))}
          </article>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
