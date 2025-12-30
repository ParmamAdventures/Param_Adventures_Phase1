import { useState, useEffect } from "react";
import { format, parseISO, isValid } from "date-fns";

type Props = {
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  min?: string;
};

export default function FormattedDateInput({ value, onChange, className, placeholder, min }: Props) {
  const [inputType, setInputType] = useState<"text" | "date">("text");

  const formatDate = (isoString: string) => {
    if (!isoString) return "";
    const date = parseISO(isoString);
    if (!isValid(date)) return isoString;
    return format(date, "dd/MM/yyyy");
  };

  const handleFocus = () => {
    setInputType("date");
  };

  const handleBlur = () => {
    setInputType("text");
  };

  return (
    <div className="relative w-full">
      <input
        type={inputType}
        className={className}
        value={inputType === "date" ? value : formatDate(value)}
        onChange={(e) => onChange(e.target.value)}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder || "dd/mm/yyyy"}
        min={min}
      />
    </div>
  );
}
