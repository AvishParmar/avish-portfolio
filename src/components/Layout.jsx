import React from "react";
import { Link } from "react-router-dom";
import { Sun, Moon } from "lucide-react";
import NetworkBackground from "./NetworkBackground";

export default function Layout({ dark, toggleDark, children }) {
  return (
    <div className="min-h-screen text-ink dark:text-darkink">
      <NetworkBackground isDark={dark} />
      <header className="mx-auto flex w-full max-w-[720px] items-center justify-between px-6 py-6">
        <nav className="flex items-center gap-4 text-sm font-medium text-muted dark:text-darkmuted">
          <Link className="hover:text-ink dark:hover:text-darkink" to="/">
            Home
          </Link>
          <Link className="hover:text-ink dark:hover:text-darkink" to="/blog">
            Blog
          </Link>
        </nav>

        <button
          onClick={toggleDark}
          aria-label="Toggle dark mode"
          className="rounded-xl border border-border bg-white p-2 text-muted shadow-sm transition
                     hover:-translate-y-0.5 hover:text-ink hover:shadow
                     dark:border-darkborder dark:bg-darkbg dark:text-darkmuted
                     dark:hover:text-darkink
                     focus:outline-none focus:ring-4 focus:ring-accent/20"
        >
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </header>

      <main className="mx-auto w-full max-w-[720px] px-6 pb-20">{children}</main>
    </div>
  );
}
