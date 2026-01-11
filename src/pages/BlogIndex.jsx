import React from "react";
import { Link } from "react-router-dom";
import { POSTS } from "../posts/posts";

export default function BlogIndex() {
  const hasPosts = Array.isArray(POSTS) && POSTS.length > 0;

  return (
    <section className="pt-10">
      <h1 className="text-3xl font-semibold tracking-tight">Blog</h1>
      <p className="mt-3 text-muted dark:text-darkmuted">
        Notes from someone figuring it out in public ✍️
      </p>

      <div
        className="mt-8 rounded-2xl bg-white p-4 shadow-sm
                   dark:bg-darkbg/90 dark:shadow-none
                   sm:p-6"
      >
        {hasPosts ? (
          <div className="space-y-4">
            {POSTS.map((p) => (
              <Link
                key={p.slug}
                to={`/blog/${p.slug}`}
                className="block rounded-xl border border-border bg-white p-5 transition
                           hover:-translate-y-0.5 hover:border-ink/20 hover:shadow
                           dark:border-darkborder dark:bg-darkbg"
              >
                <div className="flex items-baseline justify-between gap-4">
                  <h2 className="text-lg font-semibold">{p.title}</h2>
                  <span className="text-xs text-muted dark:text-darkmuted">
                    {p.date}
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted dark:text-darkmuted">
                  {p.description}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-lg font-medium">
              No posts yet
            </p>
            <p className="mt-2 max-w-[420px] text-sm text-muted dark:text-darkmuted">
              Ironically, still haven't figured out what to figure out...
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
