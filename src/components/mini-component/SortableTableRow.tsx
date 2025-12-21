"use client";

import React from "react";
import { TableRow } from "@mui/material";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const SortableTableRow = ({
  id,
  disabled,
  isMobile = false,
  children,
}: {
  id: string;
  disabled?: boolean;
  isMobile?: boolean;
  children: any;
}) => {
  const {
    setNodeRef,
    setActivatorNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    background: isDragging ? "#f5f5f5" : "inherit",
    cursor: isDragging
      ? "grabbing"
      : !isMobile && !disabled
      ? "grab"
      : "default",
  };

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...(!isMobile && !disabled ? listeners : {})} // 👈 desktop row drag
    >
      {typeof children === "function"
        ? children({ setActivatorNodeRef, listeners, disabled })
        : children}
    </TableRow>
  );
};

export default SortableTableRow;
