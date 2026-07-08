"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type TagOption = {
  href: string;
  label: string;
};

type TagFilterSelectProps = {
  allHref: string;
  options: TagOption[];
};

const ALL_VALUE = "__all_articles__";

export default function TagFilterSelect({
  allHref,
  options,
}: TagFilterSelectProps) {
  return (
    <div className="mb-8 grid gap-2 sm:max-w-sm">
      <label className="text-muted-foreground text-sm font-medium">
        Filter by tag
      </label>

      <Select
        defaultValue={ALL_VALUE}
        onValueChange={value => {
          if (!value) return;
          window.location.href = value === ALL_VALUE ? allHref : String(value);
        }}
      >
        <SelectTrigger
          className="h-10 w-full rounded-xl border-neutral-300 bg-white/80 px-3 text-sm shadow-xs dark:border-neutral-700 dark:bg-neutral-900/80"
          aria-label="Filter articles by tag"
        >
          <SelectValue placeholder="All articles" />
        </SelectTrigger>
        <SelectContent
          align="start"
          className="border-neutral-300/80 bg-white/95 backdrop-blur-md dark:border-neutral-700/80 dark:bg-neutral-950/90"
        >
          <SelectItem value={ALL_VALUE}>All articles</SelectItem>
          {options.map(option => (
            <SelectItem key={option.href} value={option.href}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
