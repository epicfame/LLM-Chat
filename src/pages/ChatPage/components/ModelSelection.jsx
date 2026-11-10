import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { Check, ChevronDown, Sparkles } from "lucide-react";

const normalize = (option) =>
  typeof option === "string"
    ? { id: option, name: option }
    : {
        id: option.id,
        name: option.name ?? option.id,
        description: option.description,
        badge: option.badge,
      };

const cx = (...classes) => classes.filter(Boolean).join(" ");

/**
 * options: string[] | { id, name, description?, badge? }[]
 * onChange receives an event-like object, so existing `e.target.value` handlers keep working.
 */
export function ModelSelection({
  options = [],
  value,
  onChange,
  placeholder = "Select model",
  emptyLabel = "No models available",
  align = "auto", // "auto" | "start" | "end": which edge of the trigger the panel lines up with
}) {
  const items = options.map(normalize);
  const disabled = items.length === 0;

  const [internalValue, setInternalValue] = useState(items[0]?.id);
  const selectedId = value ?? internalValue;
  const selected = items.find((item) => item.id === selectedId);

  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [dropUp, setDropUp] = useState(false);
  const [alignEnd, setAlignEnd] = useState(align === "end");

  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const listRef = useRef(null);
  const typeahead = useRef({ text: "", timer: null });

  const baseId = useId();
  const listId = `${baseId}-list`;
  const optionId = (index) => `${baseId}-option-${index}`;

  const selectedIndex = Math.max(
    0,
    items.findIndex((item) => item.id === selectedId),
  );

  const openList = (index = selectedIndex) => {
    if (disabled) return;
    setActiveIndex(index);
    setOpen(true);
  };

  const closeList = (returnFocus = true) => {
    setOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  };

  const choose = (item) => {
    if (value === undefined) setInternalValue(item.id);
    if (item.id !== selectedId) {
      onChange?.({
        target: { value: item.id },
        currentTarget: { value: item.id },
        option: item,
      });
    }
    closeList();
  };

  // Close when clicking outside
  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  // Keep the panel inside the viewport:
  // - open upward when there is not enough room below (e.g. inside a bottom chat composer)
  // - line it up with the trigger's right edge when it would overflow on the right (e.g. top-right header)
  useLayoutEffect(() => {
    if (!open) return;
    const EDGE = 8;

    const updatePlacement = () => {
      if (!triggerRef.current || !listRef.current) return;
      const rect = triggerRef.current.getBoundingClientRect();
      const { offsetWidth: listWidth, offsetHeight: listHeight } =
        listRef.current;

      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      setDropUp(spaceBelow < listHeight + 16 && spaceAbove > spaceBelow);

      if (align === "start" || align === "end") {
        setAlignEnd(align === "end");
      } else {
        const overflowsRight = rect.left + listWidth > window.innerWidth - EDGE;
        const fitsLeft = rect.right - listWidth >= EDGE;
        setAlignEnd(
          overflowsRight &&
            (fitsLeft || rect.left > window.innerWidth - rect.right),
        );
      }
    };

    updatePlacement();
    window.addEventListener("resize", updatePlacement);
    return () => window.removeEventListener("resize", updatePlacement);
  }, [open, align]);

  // Keep the highlighted option visible
  useEffect(() => {
    if (!open || activeIndex < 0) return;
    listRef.current?.children[activeIndex]?.scrollIntoView({
      block: "nearest",
    });
  }, [open, activeIndex]);

  const handleTypeahead = (key) => {
    const state = typeahead.current;
    clearTimeout(state.timer);
    state.text += key.toLowerCase();
    state.timer = setTimeout(() => {
      state.text = "";
    }, 500);

    const index = items.findIndex((item) =>
      item.name.toLowerCase().startsWith(state.text),
    );
    if (index < 0) return;
    if (open) setActiveIndex(index);
    else openList(index);
  };

  const handleKeyDown = (event) => {
    if (disabled) return;
    const { key } = event;

    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(key)) {
        event.preventDefault();
        openList();
      } else if (
        key.length === 1 &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.altKey
      ) {
        handleTypeahead(key);
      }
      return;
    }

    switch (key) {
      case "ArrowDown":
        event.preventDefault();
        setActiveIndex((index) => Math.min(items.length - 1, index + 1));
        break;
      case "ArrowUp":
        event.preventDefault();
        setActiveIndex((index) => Math.max(0, index - 1));
        break;
      case "Home":
        event.preventDefault();
        setActiveIndex(0);
        break;
      case "End":
        event.preventDefault();
        setActiveIndex(items.length - 1);
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        if (items[activeIndex]) choose(items[activeIndex]);
        break;
      case "Escape":
        event.preventDefault();
        closeList();
        break;
      case "Tab":
        setOpen(false);
        break;
      default:
        if (
          key.length === 1 &&
          !event.ctrlKey &&
          !event.metaKey &&
          !event.altKey
        ) {
          handleTypeahead(key);
        }
    }
  };

  return (
    <div className="relative inline-flex" ref={rootRef}>
      <div
        ref={triggerRef}
        role="combobox"
        tabIndex={disabled ? -1 : 0}
        className="group inline-flex h-[38px] min-w-[170px] max-w-[280px] cursor-pointer items-center gap-2 rounded-full border border-border bg-surface pr-3 pl-[7px] text-sm leading-none font-bold text-text shadow-[0_1px_2px_rgba(59,36,22,0.06)] outline-none select-none transition-[border-color,background-color,box-shadow,transform] duration-150 hover:border-secondary hover:bg-[color-mix(in_srgb,var(--color-secondary)_6%,var(--color-surface))] active:scale-98 focus-visible:border-primary focus-visible:shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-primary)_18%,transparent)] aria-expanded:border-primary aria-expanded:shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-primary)_18%,transparent)] aria-disabled:transform-none aria-disabled:cursor-not-allowed aria-disabled:opacity-50 aria-disabled:shadow-none aria-disabled:hover:border-border aria-disabled:hover:bg-surface motion-reduce:transition-none"
        aria-label="Select AI model"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={
          open && activeIndex >= 0 ? optionId(activeIndex) : undefined
        }
        aria-disabled={disabled || undefined}
        onClick={() => (open ? closeList() : openList())}
        onKeyDown={handleKeyDown}
      >
        <span className="grid size-6 flex-none place-items-center rounded-full bg-linear-[135deg,var(--color-primary),var(--color-secondary)] text-white" aria-hidden="true">
          <Sparkles size={13} strokeWidth={2.5} />
        </span>

        <span className={cx("min-w-0 flex-1 truncate text-left", !selected && "font-semibold text-text-muted")}>
          {disabled ? emptyLabel : (selected?.name ?? placeholder)}
        </span>

        <ChevronDown size={16} className="flex-none text-text-muted transition-[transform,color] duration-200 group-hover:text-secondary group-aria-expanded:rotate-180 group-aria-expanded:text-primary motion-reduce:transition-none" aria-hidden="true" />
      </div>

      {open && (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          aria-label="AI models"
          className={cx(
            "absolute z-50 m-0 box-border max-h-80 w-max min-w-[max(100%,240px)] max-w-[min(360px,calc(100vw-32px))] list-none overflow-y-auto overscroll-contain rounded-lg border border-border bg-surface p-1.5 shadow-[0_14px_34px_-10px_rgba(59,36,22,0.22),0_2px_6px_rgba(59,36,22,0.06)] [scrollbar-width:thin] [scrollbar-color:color-mix(in_srgb,var(--color-secondary)_35%,transparent)_transparent] motion-reduce:animate-none",
            dropUp ? "bottom-[calc(100%+8px)] animate-list-in-up" : "top-[calc(100%+8px)] animate-list-in",
            alignEnd ? "right-0" : "left-0",
            dropUp ? (alignEnd ? "origin-bottom-right" : "origin-bottom-left") : (alignEnd ? "origin-top-right" : "origin-top-left"),
          )}
        >
          {items.map((item, index) => {
            const isSelected = item.id === selectedId;
            return (
              <li
                key={item.id}
                id={optionId(index)}
                role="option"
                aria-selected={isSelected}
                className="group flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-[9px] text-text transition-colors duration-150 [&+li]:mt-0.5 data-[active=true]:bg-secondary/12 aria-selected:bg-primary/9 aria-selected:data-[active=true]:bg-primary/15 motion-reduce:transition-none"
                data-active={index === activeIndex}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => choose(item)}
              >
                <span className="flex min-w-0 flex-1 flex-col gap-[3px]">
                  <span className="flex items-center gap-1.5 text-sm leading-[1.25] font-bold group-aria-selected:text-[color-mix(in_srgb,var(--color-primary)_72%,#3b2416)]">
                    {item.name}
                    {item.badge && (
                      <span className="rounded-full bg-lemon/25 px-[7px] py-0.5 text-[10px] font-extrabold tracking-[0.03em] text-[color-mix(in_srgb,var(--color-lemon)_45%,#3b2416)] uppercase">{item.badge}</span>
                    )}
                  </span>
                  {item.description && (
                    <span className="text-xs leading-[1.35] font-medium text-text-muted">
                      {item.description}
                    </span>
                  )}
                </span>

                <Check
                  size={16}
                  strokeWidth={2.75}
                  className="flex-none scale-60 text-primary opacity-0 transition-[opacity,transform] duration-150 group-aria-selected:scale-100 group-aria-selected:opacity-100 motion-reduce:transition-none"
                  aria-hidden="true"
                />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
