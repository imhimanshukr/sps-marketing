"use client";

import React from "react";
import { TableRow } from "@mui/material";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type SortableRowRenderProps = {
  setActivatorNodeRef: (element: HTMLElement | null) => void;
  listeners?: Record<string, any>;
  disabled?: boolean;
};

const SortableTableRow = ({
  id,
  disabled,
  children,
}: {
  id: string;
  disabled?: boolean;
  children:
    | React.ReactNode
    | ((props: SortableRowRenderProps) => React.ReactNode);
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
  };

  return (
    <TableRow ref={setNodeRef} style={style} {...attributes}>
      {typeof children === "function"
        ? children({
            setActivatorNodeRef,
            listeners,
            disabled,
          })
        : children}
    </TableRow>
  );
};

export default SortableTableRow;
