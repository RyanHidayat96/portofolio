"use client";

import type { WorkspaceSection } from "@/features/workspace/types";
import type { PaletteAction } from "@/features/workspace/navigation";
import { Command, Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

const paletteListId = "command-palette-options";

export function CommandPalette({
  isOpen,
  actions,
  onClose,
  onSelect
}: Readonly<{
  isOpen: boolean;
  actions: readonly PaletteAction[];
  onClose: () => void;
  onSelect: (section: WorkspaceSection) => void;
}>): React.ReactElement | null {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  const filteredActions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return actions;
    }

    return actions.filter((action) =>
      `${action.label} ${action.description}`.toLowerCase().includes(normalizedQuery)
    );
  }, [actions, query]);
  const clampedActiveIndex =
    filteredActions.length === 0 ? -1 : Math.min(activeIndex, filteredActions.length - 1);
  const activeAction = clampedActiveIndex >= 0 ? filteredActions[clampedActiveIndex] : undefined;
  const activeOptionId =
    activeAction && clampedActiveIndex >= 0
      ? createPaletteOptionId(activeAction.id, clampedActiveIndex)
      : undefined;

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    previousActiveElementRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const focusTimerId = window.setTimeout(() => inputRef.current?.focus(), 0);

    return () => window.clearTimeout(focusTimerId);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const closePalette = (): void => {
    setQuery("");
    setActiveIndex(0);
    onClose();
    window.setTimeout(() => previousActiveElementRef.current?.focus(), 0);
  };

  const moveActiveIndex = (direction: "previous" | "next"): void => {
    if (filteredActions.length === 0) {
      return;
    }

    setActiveIndex((currentIndex) => {
      const safeIndex = Math.min(currentIndex, filteredActions.length - 1);
      if (direction === "next") {
        return (safeIndex + 1) % filteredActions.length;
      }

      return (safeIndex - 1 + filteredActions.length) % filteredActions.length;
    });
  };

  const selectActiveAction = (): void => {
    if (!activeAction) {
      return;
    }

    onSelect(activeAction.section);
    closePalette();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 p-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={closePalette}
    >
      <section
        className="mx-auto mt-20 max-w-2xl border border-[var(--border)] bg-[var(--surface-raised)] shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="command-palette-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <h2 id="command-palette-title" className="sr-only">
          Command palette
        </h2>
        <div className="flex items-center gap-3 border-b border-[var(--border)] p-4">
          <Search aria-hidden="true" className="text-[var(--accent)]" size={20} />
          <input
            ref={inputRef}
            value={query}
            role="combobox"
            aria-controls={paletteListId}
            aria-expanded="true"
            aria-autocomplete="list"
            aria-activedescendant={activeOptionId}
            onChange={(event) => {
              setQuery(event.target.value);
              setActiveIndex(0);
            }}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown") {
                event.preventDefault();
                moveActiveIndex("next");
              }

              if (event.key === "ArrowUp") {
                event.preventDefault();
                moveActiveIndex("previous");
              }

              if (event.key === "Enter") {
                event.preventDefault();
                selectActiveAction();
              }
            }}
            className="min-h-11 flex-1 bg-transparent text-base text-[var(--text-primary)] outline-none placeholder:text-[#6d788a]"
            placeholder="Search actions, labs, profile..."
            aria-label="Search commands"
          />
          <Command aria-hidden="true" className="text-[var(--text-muted)]" size={18} />
        </div>

        <div
          id={paletteListId}
          className="max-h-[420px] overflow-y-auto p-2"
          role="listbox"
          aria-label="Command palette actions"
        >
          {filteredActions.length > 0 ? (
            filteredActions.map((action, index) => {
              const isActive = index === clampedActiveIndex;
              return (
                <button
                  key={action.id}
                  id={createPaletteOptionId(action.id, index)}
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  onClick={() => {
                    onSelect(action.section);
                    closePalette();
                  }}
                  onFocus={() => setActiveIndex(index)}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={`w-full border p-4 text-left ${
                    isActive
                      ? "border-[var(--accent-strong)] bg-[var(--accent-soft)] text-[var(--text-primary)]"
                      : "border-transparent hover:border-[var(--accent-strong)] hover:bg-[var(--accent-soft)]"
                  }`}
                >
                  <span className="block font-semibold">{action.label}</span>
                  <span className="mt-1 block text-sm text-[var(--text-muted)]">
                    {action.description}
                  </span>
                </button>
              );
            })
          ) : (
            <p className="p-4 text-sm text-[var(--text-muted)]">No matching command.</p>
          )}
        </div>
      </section>
    </div>
  );
}

function createPaletteOptionId(actionId: string, index: number): string {
  return `command-palette-option-${index}-${actionId}`;
}
