"use client";

import { useEffect, useId, useRef, useState } from "react";
import { MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { AddressSuggestion } from "@/lib/estimator/types";
import { cn } from "@/lib/utils";

const DEBOUNCE_MS = 280;
const MIN_CHARS = 3;

function newSessionToken() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}-session`;
}

/**
 * Venue-address field with Google Places suggestions (fetched through our own
 * `/api/places/autocomplete`, so no Google key is exposed). Typing calls
 * `onTextChange`; picking a suggestion calls `onSelect`. If suggestions are
 * unavailable it degrades to a plain text field.
 */
export function AddressAutocomplete({
  id,
  value,
  onTextChange,
  onSelect,
  onUnavailable,
  required,
  placeholder,
  "aria-describedby": describedBy,
}: {
  id?: string;
  value: string;
  onTextChange: (text: string) => void;
  onSelect: (suggestion: AddressSuggestion) => void;
  /** Called once if suggestions can't be served (unconfigured, rate limited). */
  onUnavailable?: () => void;
  required?: boolean;
  placeholder?: string;
  "aria-describedby"?: string;
}) {
  const listId = useId();
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [disabled, setDisabled] = useState(false);
  // Only query after the user actually types (not when a value is restored or picked).
  const [query, setQuery] = useState("");
  const sessionToken = useRef("");
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Kept in a ref so a new callback identity doesn't cancel an in-flight lookup.
  const onUnavailableRef = useRef(onUnavailable);
  useEffect(() => {
    onUnavailableRef.current = onUnavailable;
  }, [onUnavailable]);

  useEffect(() => {
    if (disabled || query.trim().length < MIN_CHARS) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      if (!sessionToken.current) sessionToken.current = newSessionToken();
      try {
        const response = await fetch("/api/places/autocomplete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ input: query, sessionToken: sessionToken.current }),
          signal: controller.signal,
        });
        const payload = (await response.json().catch(() => ({}))) as {
          suggestions?: AddressSuggestion[];
        };
        if (!response.ok) {
          // Not configured / rate limited / Google down: fall back to free text.
          if (response.status === 503 || response.status === 429) {
            setDisabled(true);
            onUnavailableRef.current?.();
          }
          setSuggestions([]);
          setOpen(false);
          return;
        }
        const next = payload.suggestions ?? [];
        setSuggestions(next);
        setActive(-1);
        setOpen(next.length > 0);
      } catch {
        // Aborted or offline; leave the field usable.
      }
    }, DEBOUNCE_MS);
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [query, disabled]);

  function pick(suggestion: AddressSuggestion) {
    sessionToken.current = "";
    setQuery("");
    setSuggestions([]);
    setOpen(false);
    setActive(-1);
    onSelect(suggestion);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || suggestions.length === 0) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((i) => (i + 1) % suggestions.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (event.key === "Enter" && active >= 0) {
      event.preventDefault();
      pick(suggestions[active]);
    } else if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
    }
  }

  const showList = open && suggestions.length > 0;

  return (
    <div className="relative">
      <Input
        id={id}
        required={required}
        placeholder={placeholder}
        value={value}
        autoComplete="off"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={showList}
        aria-controls={listId}
        aria-activedescendant={showList && active >= 0 ? `${listId}-${active}` : undefined}
        aria-describedby={describedBy}
        onChange={(e) => {
          onTextChange(e.target.value);
          setQuery(e.target.value);
          if (e.target.value.trim().length < MIN_CHARS) {
            setSuggestions([]);
            setOpen(false);
          }
        }}
        onKeyDown={onKeyDown}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        onBlur={() => {
          blurTimer.current = setTimeout(() => setOpen(false), 120);
        }}
      />
      <ul
        id={listId}
        role="listbox"
        className={cn(
          "absolute inset-x-0 top-full z-30 mt-1 overflow-hidden rounded-xl border border-ink/10 bg-card py-1 shadow-lg",
          !showList && "hidden",
        )}
      >
        {suggestions.map((suggestion, index) => (
          <li
            key={suggestion.placeId}
            id={`${listId}-${index}`}
            role="option"
            aria-selected={index === active}
            className={cn(
              "flex cursor-pointer items-start gap-3 px-3 py-2.5 text-sm",
              index === active ? "bg-secondary" : "hover:bg-secondary/60",
            )}
            onMouseEnter={() => setActive(index)}
            // mousedown fires before the input's blur, so the pick isn't lost.
            onMouseDown={(e) => {
              e.preventDefault();
              if (blurTimer.current) clearTimeout(blurTimer.current);
              pick(suggestion);
            }}
          >
            <MapPin className="mt-0.5 size-4 shrink-0 text-fig" aria-hidden />
            <span className="min-w-0">
              <span className="block truncate text-ink">{suggestion.mainText}</span>
              {suggestion.secondaryText ? (
                <span className="block truncate text-xs text-ink/55">
                  {suggestion.secondaryText}
                </span>
              ) : null}
            </span>
          </li>
        ))}
        <li aria-hidden className="px-3 pt-1 pb-1.5 text-right text-[10px] text-ink/40">
          Powered by Google
        </li>
      </ul>
    </div>
  );
}
