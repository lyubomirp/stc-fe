"use client";
import React, { useCallback, useState } from "react";
import RuleTooltip from "@/app/components/RuleTooltip";
import { lookupRule } from "@/app/data/rules";
import type { TipState } from "@/app/types/TipState";

// hrefs arrive as /wh40k10ed/..., so only the origin is missing.
const ORIGIN = "https://wahapedia.ru";

const linkify = (html: string) =>
  html.replace(
    /<a\b([^>]*?)href="(\/[^"]*)"([^>]*)>/gi,
    (_m, before, href, after) =>
      `<a${before}href="${ORIGIN}${href}"${after} target="_blank" rel="noopener noreferrer">`,
  );

// Wahapedia leaves most [SUSTAINED HITS 1] as bare prose, so the brackets are
// the anchor. Only wrap what resolves, leaving stray brackets alone.
const markRules = (html: string) =>
  html.replace(/\[([^\][<>]{2,30})\]/g, (match, inner) =>
    lookupRule(inner) ? `<span class="rule-ref">${match}</span>` : match,
  );

const RichText: React.FC<{ html: string; className?: string }> = ({
  html,
  className,
}) => {
  const [tip, setTip] = useState<TipState | null>(null);

  const onClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;

    // Wrappers before .tt: each word is its own .tt span, so closest() would
    // stop at "Rapid" rather than the whole phrase.
    const anchor =
      target.closest<HTMLElement>('[class*="tooltip"], .rule-ref') ??
      target.closest<HTMLElement>(".tt");

    if (!anchor) {
      setTip(null);
      return;
    }

    const rule = lookupRule(anchor.innerText ?? "");
    if (!rule) return;

    e.preventDefault();
    const box = anchor.getBoundingClientRect();
    const accent = getComputedStyle(anchor).getPropertyValue("--accent").trim();
    setTip({ rule, x: box.left + box.width / 2, y: box.top, accent });
  }, []);

  return (
    <>
      <div
        className={`rich ${className ?? ""}`}
        onClick={onClick}
        dangerouslySetInnerHTML={{ __html: markRules(linkify(html)) }}
      />
      <RuleTooltip tip={tip} onClose={() => setTip(null)} />
    </>
  );
};

export default RichText;
