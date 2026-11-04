import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { Check, ChevronDown, Sparkles } from "lucide-react";
import styles from "./ModelSelection.module.css";

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
    <div className={styles.container} ref={rootRef}>
      <div
        ref={triggerRef}
        role="combobox"
        tabIndex={disabled ? -1 : 0}
        className={styles.trigger}
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
        <span className={styles.icon} aria-hidden="true">
          <Sparkles size={13} strokeWidth={2.5} />
        </span>

        <span className={cx(styles.value, !selected && styles.placeholder)}>
          {disabled ? emptyLabel : (selected?.name ?? placeholder)}
        </span>

        <ChevronDown size={16} className={styles.chevron} aria-hidden="true" />
      </div>

      {open && (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          aria-label="AI models"
          className={cx(
            styles.list,
            dropUp && styles.up,
            alignEnd && styles.end,
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
                className={cx(
                  styles.option,
                  index === activeIndex && styles.active,
                  isSelected && styles.selected,
                )}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => choose(item)}
              >
                <span className={styles.optionText}>
                  <span className={styles.optionName}>
                    {item.name}
                    {item.badge && (
                      <span className={styles.badge}>{item.badge}</span>
                    )}
                  </span>
                  {item.description && (
                    <span className={styles.optionDescription}>
                      {item.description}
                    </span>
                  )}
                </span>

                <Check
                  size={16}
                  strokeWidth={2.75}
                  className={styles.check}
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
