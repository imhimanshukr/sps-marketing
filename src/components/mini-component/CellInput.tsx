"use client";

import { memo, useState, useEffect, forwardRef } from "react";
import { TextField } from "@mui/material";

interface CellInputProps {
  value: string;
  disabled: boolean;
  onCommit: (val: string) => void;
  onEnter?: (val: string) => void;
}

/* 🔥 Mobile detect (safe & simple) */
const isMobile =
  typeof window !== "undefined" &&
  /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

const CellInput = memo(
  forwardRef<HTMLInputElement, CellInputProps>(function CellInput(
    { value, disabled, onCommit, onEnter },
    ref
  ) {
    const [localValue, setLocalValue] = useState(value);

    useEffect(() => {
      setLocalValue(value);
    }, [value]);

    return (
      <TextField
        size="small"
        fullWidth
        value={localValue}
        disabled={disabled}
        inputRef={ref}
        type={isMobile ? "number" : "text"}
        inputMode="numeric"
        onChange={(e) => setLocalValue(e.target.value)}
        onBlur={() => onCommit(localValue)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            onCommit(localValue);
            onEnter?.(localValue);
          }
        }}
        sx={{
          "& .MuiInputBase-input.Mui-disabled": {
            WebkitTextFillColor: "#000",
            opacity: 0.7,
            pointerEvents: "none",
          },
        }}
      />
    );
  })
);

export default CellInput;
