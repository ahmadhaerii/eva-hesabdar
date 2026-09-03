"use client";

import * as React from "react";
import { ChevronDownIcon, CheckIcon } from "lucide-react";

import { cn } from "@/utils/tailwind";

type Product = {
  id: number;
  name: string;
};

type CategoryWithProducts = {
  id: number;
  name: string;
  products: Product[];
};

type ProductComboboxProps = {
  value?: number | null;
  onValueChange?: (value: number | null) => void;
  items: CategoryWithProducts[];
  placeholder?: string;
  label?: string;
  disabled?: boolean;
};

export function ProductCombobox({
  value,
  onValueChange,
  items,
  placeholder = "انتخاب محصول...",
  label = "انتخاب محصول",
  disabled = false,
}: ProductComboboxProps) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  const selectedProduct = React.useMemo(() => {
    for (const category of items) {
      const product = category.products.find((product) => product.id === value);

      if (product) {
        return product;
      }
    }

    return null;
  }, [items, value]);

  const filteredItems = React.useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return items;
    }

    return items
      .map((category) => ({
        ...category,
        products: category.products.filter((product) =>
          product.name.toLowerCase().includes(query),
        ),
      }))
      .filter((category) => category.products.length > 0);
  }, [items, search]);

  React.useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, []);

  function handleOpen() {
    if (disabled) return;

    setOpen(true);

    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  }

  function handleSelect(product: Product) {
    onValueChange?.(product.id);
    setSearch("");
    setOpen(false);
  }

  return (
    <div ref={rootRef} className="relative w-full" dir="rtl">
      {/* Input */}
      <label htmlFor="myCombo" className="text-sm font-medium">
        {label}
      </label>
      <div
        className={cn(
          "flex h-9 w-full items-center rounded-lg border border-input bg-background",
          "transition-colors",
          "focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/20",
          disabled && "cursor-not-allowed opacity-50",
        )}
      >
        <input
          id="myCombo"

          ref={inputRef}
          value={open ? search : (selectedProduct?.name ?? "")}
          disabled={disabled}
          placeholder={placeholder}
          onMouseDown={(event) => {
            if (!open) {
              event.preventDefault();
              setOpen(true);

              requestAnimationFrame(() => {
                inputRef.current?.focus();
              });
            }
          }}
          onChange={(event) => {
            setSearch(event.target.value);
            setOpen(true);
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setOpen(false);
              setSearch("");
              inputRef.current?.blur();
            }
          }}
          className="h-full min-w-0 flex-1 bg-transparent px-3 text-xs outline-none placeholder:text-muted-foreground"
        />

        <button
          type="button"
          tabIndex={-1}
          disabled={disabled}
          onMouseDown={(event) => {
            event.preventDefault();
          }}
          onClick={() => {
            if (open) {
              setOpen(false);
            } else {
              handleOpen();
            }
          }}
          className="flex h-full w-9 shrink-0 items-center justify-center text-muted-foreground"
        >
          <ChevronDownIcon
            className={cn("size-4 transition-transform", open && "rotate-180")}
          />
        </button>
      </div>

      {/* Dropdown */}
      {open && (
        <div
          className={cn(
            "absolute inset-x-0 top-full z-[100]",
            "mt-1 overflow-hidden rounded-lg",
            "border border-border bg-popover text-popover-foreground",
            "shadow-lg",
          )}
        >
          <div className="max-h-64 overflow-y-auto p-1">
            {filteredItems.length === 0 ? (
              <div className="py-6 text-center text-xs text-muted-foreground">
                محصولی پیدا نشد
              </div>
            ) : (
              filteredItems.map((category) => (
                <div key={category.id}>
                  {/* Category */}
                  <div className="px-2 py-1.5 text-xs text-muted-foreground">
                    {category.name}
                  </div>

                  {/* Products */}
                  {category.products.map((product) => {
                    const selected = product.id === value;

                    return (
                      <button
                        key={product.id}
                        type="button"
                        onMouseDown={(event) => {
                          event.preventDefault();
                        }}
                        onClick={() => handleSelect(product)}
                        className={cn(
                          "flex w-full items-center gap-2 rounded-md px-2 py-1.5",
                          "text-right text-xs",
                          "transition-colors",
                          "hover:bg-accent hover:text-accent-foreground",
                          selected && "bg-accent/60 text-accent-foreground",
                        )}
                      >
                        <span className="min-w-0 flex-1 truncate">
                          {product.name}
                        </span>

                        {selected && (
                          <CheckIcon className="size-3.5 shrink-0" />
                        )}
                      </button>
                    );
                  })}

                  {/* Separator */}
                  <div className="my-1 h-px bg-border last:hidden" />
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
