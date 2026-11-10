"use client";

import * as React from "react";

import { Input } from "@/components/ui/input";
import { formatPhoneInput } from "@/lib/phone";

type PhoneInputProps = Omit<React.ComponentProps<"input">, "type" | "value" | "onChange"> & {
  value: string;
  onValueChange: (value: string) => void;
};

/** Tel input that formats US numbers as "(704) 555-0123" while typing, keeping the caret in place. */
function PhoneInput({ value, onValueChange, ...props }: PhoneInputProps) {
  const ref = React.useRef<HTMLInputElement>(null);
  const caretDigits = React.useRef<number | null>(null);
  // Bumped on every edit so the caret is restored even when the formatted value is unchanged.
  const [caretTick, setCaretTick] = React.useState(0);

  React.useLayoutEffect(() => {
    const input = ref.current;
    const wanted = caretDigits.current;
    if (!input || wanted === null || document.activeElement !== input) return;
    caretDigits.current = null;
    // Put the caret after the same number of digits it followed before formatting.
    let position = 0;
    let seen = 0;
    while (position < value.length && seen < wanted) {
      if (/\d/.test(value[position])) seen += 1;
      position += 1;
    }
    input.setSelectionRange(position, position);
  }, [value, caretTick]);

  return (
    <Input
      ref={ref}
      type="tel"
      inputMode="tel"
      autoComplete="tel"
      placeholder="(704) 555-0123"
      // Complete US number, or an international one starting with "+".
      pattern="\(\d{3}\) \d{3}-\d{4}|\+[\d\s\(\)\.\-]{7,}"
      title="Enter a 10-digit phone number, e.g. (704) 555-0123"
      {...props}
      value={value}
      onChange={(event) => {
        let raw = event.target.value;
        const caret = event.target.selectionStart ?? raw.length;
        let digitsBefore = raw.slice(0, caret).replace(/\D/g, "").length;
        // Backspacing over formatting ("(", ")", " ", "-") would otherwise be a
        // no-op once reformatted; delete the digit before it instead.
        const inputType = (event.nativeEvent as InputEvent).inputType;
        if (
          inputType === "deleteContentBackward" &&
          raw.length < value.length &&
          raw.replace(/\D/g, "") === value.replace(/\D/g, "") &&
          digitsBefore > 0
        ) {
          let seen = 0;
          const index = [...raw].findIndex((char) => /\d/.test(char) && ++seen === digitsBefore);
          raw = raw.slice(0, index) + raw.slice(index + 1);
          digitsBefore -= 1;
        }
        caretDigits.current = digitsBefore;
        onValueChange(formatPhoneInput(raw));
        setCaretTick((tick) => tick + 1);
      }}
    />
  );
}

export { PhoneInput };
