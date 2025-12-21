"use client";

import { Box } from "@mui/material";
import VendorCardSkeleton from "./VendorCardSkeleton";

export default function VendorGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <Box
      sx={{
        flex: 1,
        overflowY: "auto",
        px: { xs: 1.5, sm: 3 },
        display: "grid",
        gap: { xs: "6px", md: "12px" },
        gridTemplateColumns: {
          xs: "repeat(3, minmax(108px, 1fr))",
          sm: "repeat(4, minmax(140px, 1fr))",
          md: "repeat(5, minmax(160px, 1fr))",
          lg: "repeat(6, minmax(180px, 1fr))",
        },
        mt: 2,
        pb: "160px",
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <VendorCardSkeleton key={i} />
      ))}
    </Box>
  );
}
