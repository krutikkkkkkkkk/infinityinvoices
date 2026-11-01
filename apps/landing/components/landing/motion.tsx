"use client"

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react"

export function useInView<T extends Element>({ once = false, rootMargin = "0px 0px -10% 0px" } = {}) {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting)
        if (entry.isIntersecting && once) observer.disconnect()
      },
      { rootMargin },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [once, rootMargin])

  return [ref, inView] as const
}

/**
 * Marks a block with data-inview so CSS animations inside it only run while visible.
 * With `reveal`, the block also fades up the first time it scrolls into view.
 */
export function InView({
  children,
  className,
  reveal = false,
  style,
}: {
  children: ReactNode
  className?: string
  reveal?: boolean
  style?: CSSProperties
}) {
  const [ref, inView] = useInView<HTMLDivElement>()
  const [seen, setSeen] = useState(false)
  if (inView && !seen) setSeen(true)

  return (
    <div
      ref={ref}
      data-inview={reveal ? String(seen) : String(inView)}
      data-reveal={reveal ? "" : undefined}
      className={className}
      style={style}
    >
      {children}
    </div>
  )
}
