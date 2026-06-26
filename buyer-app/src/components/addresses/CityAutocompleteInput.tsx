"use client";

import { useEffect, useState } from "react";

type Props = {
  name?: string;
  value?: string;
  defaultValue?: string;
  required?: boolean;
  placeholder?: string;
  className?: string;
  onChange?: (
    event: React.ChangeEvent<HTMLInputElement>
  ) => void;
};

export default function CityAutocompleteInput({
  name = "city",
  value,
  defaultValue,
  required,
  placeholder = "Ej: Bahia Blanca",
  className,
  onChange,
}: Props) {
  const [search, setSearch] = useState(
    value ?? defaultValue ?? ""
  );
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const citySearch = value ?? search;
  const visibleSuggestions =
    isFocused && citySearch.trim().length >= 2 ? suggestions : [];

  useEffect(() => {
    const query = citySearch.trim();

    if (query.length < 2) {
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/georef/cities?search=${encodeURIComponent(query)}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          setSuggestions([]);
          return;
        }

        const result = (await response.json()) as {
          data?: string[];
        };

        setSuggestions(result.data ?? []);
      } catch {
        if (!controller.signal.aborted) {
          setSuggestions([]);
        }
      }
    }, 300);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [citySearch]);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSearch(event.target.value);
    onChange?.(event);
  };

  const handleSuggestionMouseDown = (city: string) => {
    setSearch(city);
    onChange?.({
      target: { name, value: city },
      currentTarget: { name, value: city },
    } as React.ChangeEvent<HTMLInputElement>);
  };

  return (
    <div className="relative">
      <input
        name={name}
        type="text"
        value={value ?? search}
        onChange={handleChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        required={required}
        placeholder={placeholder}
        className={className}
        autoComplete="off"
      />

      {visibleSuggestions.length > 0 ? (
        <div className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg">
          {visibleSuggestions.map((city) => (
            <button
              key={city}
              type="button"
              className="block w-full px-3 py-2 text-left text-sm text-gray-900 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
              onMouseDown={(event) => {
                event.preventDefault();
                handleSuggestionMouseDown(city);
              }}
            >
              {city}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
