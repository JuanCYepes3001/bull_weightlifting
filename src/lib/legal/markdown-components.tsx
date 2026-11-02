import type { Components } from "react-markdown";

export const legalMarkdownComponents: Components = {
  h2: ({ children }) => (
    <h2 className="text-lg text-white mt-10 mb-3 first:mt-0">{children}</h2>
  ),
  p: ({ children }) => (
    <p className="font-body text-sm text-white/70 leading-relaxed mb-4">{children}</p>
  ),
  strong: ({ children }) => <strong className="text-white font-semibold">{children}</strong>,
  ul: ({ children }) => (
    <ul className="list-disc pl-5 space-y-1 mb-4 font-body text-sm text-white/70">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal pl-5 space-y-1 mb-4 font-body text-sm text-white/70">{children}</ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  a: ({ children, href }) => (
    <a
      href={href}
      className="text-white underline underline-offset-4 hover:text-crimson transition-colors"
    >
      {children}
    </a>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-crimson/40 pl-4 text-white/50 italic mb-4">
      {children}
    </blockquote>
  ),
};
