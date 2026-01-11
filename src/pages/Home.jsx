import React, { useRef } from "react";
import { Github, Linkedin, Instagram, Twitter, Mail } from "lucide-react";

const LINKS = {
  email: "mailto:your.email@example.com",
  resume: "/resume.pdf",
  linkedin: "https://www.linkedin.com/in/YOUR_HANDLE",
  github: "https://github.com/YOUR_HANDLE",
  instagram: "https://instagram.com/YOUR_HANDLE",
  twitter: "https://x.com/YOUR_HANDLE",
};

function IconLink({ href, label, children }) {
  return (
    <a
      href={href}
      aria-label={label}
      target="_blank"
      rel="noreferrer"
      className="group inline-flex items-center justify-center rounded-xl border border-border bg-white p-2.5 text-muted shadow-sm transition
                 hover:-translate-y-0.5 hover:border-ink/20 hover:text-ink hover:shadow
                 dark:border-darkborder dark:bg-darkbg dark:text-darkmuted
                 dark:hover:text-darkink
                 focus:outline-none focus:ring-4 focus:ring-accent/15"
    >
      {children}
    </a>
  );
}

export default function Home() {
  return (
    <section className="pt-16">
      <div className="mb-10 h-px w-16 bg-border dark:bg-darkborder" />

      <h1 className="text-5xl font-semibold tracking-tight sm:text-6xl">
        Avish Parmar
      </h1>

      <p className="mt-4 max-w-[60ch] text-base leading-relaxed text-muted dark:text-darkmuted sm:text-lg">
            I build things that think about things.      </p>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <a
          href={LINKS.email}
          className="inline-flex items-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-sm font-medium text-white shadow-sm transition
                     hover:-translate-y-0.5 hover:shadow
                     focus:outline-none focus:ring-4 focus:ring-accent/20"
        >
          <Mail size={16} />
          Get in touch
        </a>

        <a
          href={LINKS.resume}
          className="inline-flex items-center rounded-xl border border-border bg-white px-4 py-2.5 text-sm font-medium text-ink shadow-sm transition
                     hover:-translate-y-0.5 hover:border-ink/20 hover:shadow
                     dark:border-darkborder dark:bg-darkbg dark:text-darkink
                     focus:outline-none focus:ring-4 focus:ring-accent/15"
        >
          Resume
        </a>
      </div>

      <div className="mt-10 flex flex-wrap items-center gap-3">
        <IconLink href={LINKS.linkedin} label="LinkedIn">
          <Linkedin size={18} />
        </IconLink>
        <IconLink href={LINKS.github} label="GitHub">
          <Github size={18} />
        </IconLink>
        <IconLink href={LINKS.instagram} label="Instagram">
          <Instagram size={18} />
        </IconLink>
        <IconLink href={LINKS.twitter} label="Twitter / X">
          <Twitter size={18} />
        </IconLink>
      </div>
    </section>
  );
}
