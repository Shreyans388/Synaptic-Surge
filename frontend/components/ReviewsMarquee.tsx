"use client"

import { cn } from "@/lib/utils"
import { Marquee } from "@/components/ui/marquee"

const reviews = [
  {
    name: "Sarah Chen",
    username: "Growth Lead @SaaSFlow",
    body: "Loomin feels like having a content strategist running 24/7. It spots trends before our team even notices them.",
    img: "https://avatar.vercel.sh/sarah",
  },
  {
    name: "David Kumar",
    username: "Founder @LaunchLabs",
    body: "The voice matching is insane. The posts it drafts sound exactly like how I write on LinkedIn.",
    img: "https://avatar.vercel.sh/david",
  },
  {
    name: "Emily Rodriguez",
    username: "Content Director @BrandScale",
    body: "The biggest win for us is the optimization loop. It doesn’t just generate content — it improves it after publishing.",
    img: "https://avatar.vercel.sh/emily",
  },
  {
    name: "Alex Turner",
    username: "Indie Hacker",
    body: "I scheduled an entire week of posts in 5 minutes. The AI picked the timing and hooks automatically.",
    img: "https://avatar.vercel.sh/alex",
  },
  {
    name: "Michael Park",
    username: "Marketing @CloudForge",
    body: "The sentiment monitoring is wild. Loomin suggested edits to posts that were getting negative comments.",
    img: "https://avatar.vercel.sh/michael",
  },
  {
    name: "Priya Nair",
    username: "Startup Advisor",
    body: "This feels less like a tool and more like a marketing co-pilot.",
    img: "https://avatar.vercel.sh/priya",
  },
]

const firstRow = reviews.slice(0, reviews.length / 2)
const secondRow = reviews.slice(reviews.length / 2)

const ReviewCard = ({
  img,
  name,
  username,
  body,
}: {
  img: string
  name: string
  username: string
  body: string
}) => {
  return (
    <figure
      className={cn(
        "relative w-72 cursor-pointer overflow-hidden rounded-xl border p-4",
        "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border-strong)] transition-colors"
      )}
    >
      <div className="flex items-center gap-3">
        <img
          className="rounded-full"
          width="32"
          height="32"
          alt=""
          src={img}
        />
        <div className="flex flex-col">
          <figcaption className="text-sm font-semibold text-[var(--foreground)]">
            {name}
          </figcaption>
          <p className="text-xs text-[var(--muted-foreground)]">{username}</p>
        </div>
      </div>

      <blockquote className="mt-3 text-sm leading-relaxed text-[var(--muted-foreground)]">
        {body}
      </blockquote>
    </figure>
  )
}

export function ReviewsMarquee() {
  return (
    <section className="relative mx-auto mt-20 w-full max-w-7xl px-6">
      
      <div className="mb-10 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-500">
          Social Proof
        </p>

        <h2 className="mt-3 text-3xl font-extrabold text-[var(--foreground)]">
          Marketers love working with Loomin
        </h2>
      </div>

      <div className="relative flex w-full flex-col items-center justify-center overflow-hidden">

        <Marquee pauseOnHover className="[--duration:22s]">
          {firstRow.map((review) => (
            <ReviewCard key={review.username} {...review} />
          ))}
        </Marquee>

        <Marquee reverse pauseOnHover className="[--duration:22s]">
          {secondRow.map((review) => (
            <ReviewCard key={review.username} {...review} />
          ))}
        </Marquee>

        {/* gradient fade edges */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-[var(--background)]"></div>
        <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-[var(--background)]"></div>
      </div>
    </section>
  )
}