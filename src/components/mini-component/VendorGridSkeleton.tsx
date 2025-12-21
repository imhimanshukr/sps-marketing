"use client";

import { Box, Skeleton } from "@mui/material";
import VendorCardSkeleton from "./VendorCardSkeleton";

export default function VendorGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <>
      {/* ===== GRID SKELETON ===== */}
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
          pb: "160px", // 👈 real layout jaisa hi
        }}
      >
        {Array.from({ length: count }).map((_, i) => (
          <VendorCardSkeleton key={i} />
        ))}
      </Box>

      {/* ===== ADD VENDOR BUTTON SKELETON ===== */}
      <Box
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          width: "100%",
          p: 2,
          background: "#fff",
        }}
      >
        <Skeleton variant="rounded" height={48} sx={{ borderRadius: "12px" }} />
      </Box>
    </>
  );
}
