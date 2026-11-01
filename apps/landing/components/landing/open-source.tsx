import { Github } from "lucide-react"
import { cn } from "@infinity/ui/lib/utils"
import { GITHUB_URL } from "@/lib/config"
import { InView } from "./motion"
import { Eyebrow, Section } from "./section"
import { button, buttonSize, cardInset } from "./ui"

const CLONE_STEPS = [`git clone ${GITHUB_URL}`, "pnpm install", "pnpm dev"]

export function OpenSource() {
  return (
    <Section id="open-source">
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <InView reveal>
          <Eyebrow>Open source</Eyebrow>
          <h2 className="mt-4 font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Read the code. Run it yourself.
          </h2>
          <p className="mt-4 text-pretty text-muted-foreground">
            Infinity Invoice is MIT licensed and on GitHub. Self-host it on Vercel and Neon for free, or pay us so you never
            have to think about it. Either way, the code is public.
          </p>
          <a href={GITHUB_URL} className={cn(button.outline, buttonSize.lg, "mt-8")}>
            <Github className="size-4" aria-hidden />
            View on GitHub
          </a>
        </InView>

        <InView reveal className={`${cardInset} min-w-0 overflow-hidden`} style={{ transitionDelay: "100ms" }}>
          <div className="flex items-center gap-1.5 border-b border-border/60 px-4 py-3" aria-hidden>
            <span className="size-2.5 rounded-full bg-border" />
            <span className="size-2.5 rounded-full bg-border" />
            <span className="size-2.5 rounded-full bg-border" />
          </div>
          <pre className="overflow-x-auto p-5 font-mono text-[13px] leading-7">
            {CLONE_STEPS.map((step) => (
              <code key={step} className="block">
                <span className="text-muted-foreground select-none">$ </span>
                {step}
              </code>
            ))}
          </pre>
        </InView>
      </div>
    </Section>
  )
}
