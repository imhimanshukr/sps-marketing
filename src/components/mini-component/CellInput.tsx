import { memo, useState, useEffect, forwardRef } from "react";
import { TextField } from "@mui/material";

interface CellInputProps {
  value: string;
  disabled: boolean;
  onCommit: (val: string) => void;
  onEnter?: (val: string) => void;
}

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
        type="text"
        size="small"
        inputMode="numeric"
        slotProps={{
          htmlInput: {
            pattern: "[0-9]*",
          },
        }}
        fullWidth
        value={localValue}
        disabled={disabled}
        inputRef={ref}
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
          },
        }}
      />
    );
  })
);

export default CellInput;
