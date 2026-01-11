import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import "katex/dist/katex.min.css";
import { marked } from "marked";
import katex from "katex";
import { POSTS } from "../posts/posts";

marked.use({
  renderer: {
    text(token) {
      // In newer marked versions, `token` is often an object like { text: "..." }
      const raw = typeof token === "string" ? token : token?.text ?? "";

      // Block math: $$...$$
      const block = /\$\$([\s\S]+?)\$\$/g;
      // Inline math: $...$
      const inline = /\$(.+?)\$/g;

      // Render block math
      const withBlock = raw.replace(block, (_, expr) => {
        try {
          return katex.renderToString(expr, { displayMode: true, throwOnError: false });
        } catch {
          return `$$${expr}$$`;
        }
      });

      // Render inline math
      const withInline = withBlock.replace(inline, (_, expr) => {
        try {
          return katex.renderToString(expr, { displayMode: false, throwOnError: false });
        } catch {
          return `$${expr}$`;
        }
      });

      return withInline;
    },
  },
});


export default function BlogPost() {
  const { slug } = useParams();
  const meta = useMemo(() => POSTS.find((p) => p.slug === slug), [slug]);

  const [html, setHtml] = useState("");

  useEffect(() => {
  if (!meta) return;

  meta
    .loader()
    .then((mod) => {
      const md = mod.default;          // raw markdown text
      setHtml(marked.parse(md));
    })
    .catch(() => setHtml("<p>Could not load post.</p>"));
  }, [meta]);


  if (!meta) {
    return (
      <section className="pt-10">
        <p className="text-muted dark:text-darkmuted">Post not found.</p>
        <Link className="mt-4 inline-block text-accent" to="/blog">
          ← Back to blog
        </Link>
      </section>
    );
  }
    return (
    <article className="pt-10">
        <Link className="text-sm text-accent" to="/blog">
        ← Back to blog
        </Link>

        <div
        className="mx-auto mt-6 max-w-[1100px] rounded-2xl bg-white p-6 shadow-sm
                    dark:bg-darkbg/90 dark:shadow-none backdrop-blur-sm
                    sm:p-8"
        >
        <h1 className="text-3xl font-semibold tracking-tight">
            {meta.title}
        </h1>

        <p className="mt-2 text-sm text-muted dark:text-darkmuted">
            {meta.date}
        </p>

        <div
            className="prose prose-slate mt-8 max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: html }}
        />
        </div>
    </article>
    );
}
