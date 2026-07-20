"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import TopNav from "@/app/components/TopNav";
import DatasheetCard from "@/app/components/datasheets/DatasheetCard";
import DatasheetModal from "@/app/components/datasheets/DatasheetModal";
import { API } from "@/app/data/api";
import type { DatasheetHit } from "@/app/types/DatasheetHit";

// Kept in step with MIN_SEARCH in the API's datasheets controller.
const MIN_QUERY = 3;
const SUGGESTIONS = 8;

interface SearchResult {
  items: DatasheetHit[];
  total: number;
  page: number;
  pageSize: number;
}

const DatasheetSearch: React.FC = () => {
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const [selected, setSelected] = useState<DatasheetHit | null>(null);

  // Debounce the input, and send every new query back to the first page.
  useEffect(() => {
    const t = setTimeout(() => {
      setDebounced(query.trim());
      setPage(1);
    }, 250);

    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    if (debounced.length < MIN_QUERY) {
      setData(null);
      return;
    }

    let ignore = false;
    setLoading(true);

    fetch(
      `${API}/datasheets/search?q=${encodeURIComponent(debounced)}&page=${page}`,
    )
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((res: SearchResult) => {
        if (!ignore) setData(res);
      })
      .catch(() => {
        if (!ignore) setData(null);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [debounced, page]);

  const suggestions = useMemo(
    () =>
      focused && debounced.length >= MIN_QUERY
        ? (data?.items ?? []).slice(0, SUGGESTIONS)
        : [],
    [focused, debounced, data],
  );

  const totalPages = data
    ? Math.max(1, Math.ceil(data.total / data.pageSize))
    : 1;

  const blurTimer = useRef<ReturnType<typeof setTimeout>>();

  return (
    <div className="relative min-h-screen bg-[#08080a] text-white/90">
      <div className="relative z-10 flex min-h-screen flex-col">
        <div className="border-b border-white/[0.07]">
          <TopNav />
        </div>

        <main className="mx-auto w-full max-w-6xl flex-1 px-8 py-10">
          <h1 className="font-amsterdam text-panel-title italic text-white">
            Datasheets
          </h1>
          <p className="mt-1 text-sm text-white/45">
            Search every faction&apos;s units by name.
          </p>

          <div className="relative mt-6 max-w-xl">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => {
                if (blurTimer.current) clearTimeout(blurTimer.current);
                setFocused(true);
              }}
              onBlur={() => {
                blurTimer.current = setTimeout(() => setFocused(false), 120);
              }}
              placeholder={`Type a name (min ${MIN_QUERY} letters)…`}
              className="w-full border border-white/15 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-white/30 focus:border-white/40"
            />

            {suggestions.length > 0 && (
              <ul className="absolute left-0 right-0 top-full z-20 mt-1 max-h-72 overflow-y-auto border border-white/15 bg-black">
                {suggestions.map((s) => (
                  <li key={s.id}>
                    <button
                      type="button"
                      // onMouseDown fires before the input's blur, so the click
                      // is not swallowed by the dropdown closing.
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setQuery(s.name);
                        setFocused(false);
                      }}
                      className="flex w-full items-baseline justify-between gap-3 px-4 py-2.5 text-left transition-colors hover:bg-white/[0.06]"
                    >
                      <span className="truncate text-sm text-white/90">
                        {s.name}
                      </span>
                      <span className="shrink-0 font-mono text-hud text-white/40">
                        {s.factionName}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="mt-8">
            {debounced.length < MIN_QUERY ? (
              <p className="font-mono text-hud text-white/40">
                TYPE AT LEAST {MIN_QUERY} LETTERS TO SEARCH
              </p>
            ) : data && data.total === 0 ? (
              <p className="font-mono text-hud text-white/40">
                NO DATASHEETS MATCH “{debounced}”
              </p>
            ) : data ? (
              <>
                <div className="mb-4 flex items-center justify-between font-mono text-hud text-white/40">
                  <span>
                    {data.total} RESULT{data.total === 1 ? "" : "S"}
                  </span>
                  {loading && <span>SEARCHING…</span>}
                </div>

                <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {data.items.map((hit) => (
                    <DatasheetCard
                      key={hit.id}
                      hit={hit}
                      onOpen={() => setSelected(hit)}
                    />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-center gap-6">
                    <button
                      type="button"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page <= 1}
                      className="border border-white/15 px-4 py-2 font-mono text-hud text-white/70 transition-colors hover:border-white/40 hover:text-white disabled:cursor-not-allowed disabled:border-white/5 disabled:text-white/20"
                    >
                      ← PREV
                    </button>
                    <span className="font-mono text-hud text-white/50">
                      PAGE {page} / {totalPages}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={page >= totalPages}
                      className="border border-white/15 px-4 py-2 font-mono text-hud text-white/70 transition-colors hover:border-white/40 hover:text-white disabled:cursor-not-allowed disabled:border-white/5 disabled:text-white/20"
                    >
                      NEXT →
                    </button>
                  </div>
                )}
              </>
            ) : null}
          </div>
        </main>
      </div>

      {selected && (
        <DatasheetModal hit={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
};

export default DatasheetSearch;
