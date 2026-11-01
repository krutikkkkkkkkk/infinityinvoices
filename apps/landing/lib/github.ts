import { GITHUB_URL } from "./config"

const REPO = new URL(GITHUB_URL).pathname.slice(1)

/** Stargazer count for the public repo, refreshed hourly. Null if GitHub can't be reached. */
export async function getGithubStars(): Promise<number | null> {
  try {
    const res = await fetch(`https://api.github.com/repos/${REPO}`, {
      headers: { Accept: "application/vnd.github+json" },
      next: { revalidate: 3600 },
    })
    if (!res.ok) return null
    const data: { stargazers_count?: number } = await res.json()
    return typeof data.stargazers_count === "number" ? data.stargazers_count : null
  } catch {
    return null
  }
}

/** "842", "1.2k", "12k" */
export function formatStars(count: number): string {
  if (count < 1000) return String(count)
  const k = count / 1000
  return `${k < 10 ? k.toFixed(1).replace(/\.0$/, "") : Math.round(k)}k`
}
