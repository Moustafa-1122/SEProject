"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";

type NumericInputProps = Omit<
  React.ComponentProps<typeof Input>,
  "onChange" | "value" | "type" | "inputMode" | "maxLength"
> & {
  value: string;
  onValueChange: (value: string) => void;
  /** أقصى عدد أرقام (افتراضي 9 حتى ما نتخطى حد الـ integer بقاعدة البيانات) */
  maxDigits?: number;
};

/**
 * Input بيقبل أرقام فقط (بدون سالب، فاصلة، أحرف، أو مسافات).
 * بينضف القيمة أثناء الكتابة وأثناء الـ paste.
 * القيمة بتضل string، فاستعمل Number(value) عند الإرسال.
 */
export function NumericInput({
  value,
  onValueChange,
  maxDigits = 11,
  ...props
}: NumericInputProps) {
  return (
    <Input
      {...props}
      type="text"
      inputMode="numeric"
      autoComplete="off"
      value={value}
      onChange={(e) =>
        onValueChange(e.target.value.replace(/\D/g, "").slice(0, maxDigits))
      }
    />
  );
}

/** true إذا القيمة عدد صحيح موجب (أكبر من 0) */
export function isPositiveInteger(value: string) {
  return /^\d+$/.test(value) && Number(value) > 0;
}
