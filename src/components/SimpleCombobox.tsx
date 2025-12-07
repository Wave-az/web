import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "./ui/command";

export type SimpleOption = { label: string; value: string };

export interface SimpleComboboxProps {
  value: string;
  onChange: (value: string) => void;
  options: SimpleOption[];
  placeholder: string;
  className?: string;
}

export function SimpleCombobox({
  value,
  onChange,
  options,
  placeholder,
  className,
}: SimpleComboboxProps) {
  const [open, setOpen] = useState(false);

  const selectedLabel =
    options.find((opt) => opt.value === value)?.label ?? "";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "h-9 justify-between rounded-full bg-white text-sm shadow-sm",
            className
          )}
        >
          {selectedLabel || (
            <span className="text-gray-400">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder={placeholder} className="text-sm" />
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup className="max-h-56 overflow-y-auto">
            {options.map((opt) => (
              <CommandItem
                key={opt.value}
                value={opt.label}
                onSelect={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === opt.value ? "opacity-100" : "opacity-0"
                  )}
                />
                {opt.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}