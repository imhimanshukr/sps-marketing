"use client";

import { Box, Skeleton } from "@mui/material";

export default function OrderListSkeleton({
  accordions = 2,
}: {
  accordions?: number;
}) {
  return (
    <>
      {/* ===== HEADER SKELETON ===== */}
      <Box
        sx={{
          position: "sticky",
          top: { md: "38px", xs: "34px" },
          zIndex: 1100,
          backgroundColor: "#fff",
          pb: 1,
          mb: 1.5,
          boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
        }}
      >
        {/* top buttons */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            px: 2,
            mb: 1,
          }}
        >
          <Skeleton variant="rounded" width={36} height={30} />
          <Skeleton variant="rounded" width={120} height={30} />
        </Box>

        {/* vendor info */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 1,
          }}
        >
          <Skeleton variant="rounded" width={56} height={56} />
          <Skeleton width={140} height={26} />
        </Box>
      </Box>

      {/* ===== ACCORDION SKELETONS ===== */}
      <Box sx={{ px: { xs: 1, sm: 2 }, pb: "120px" }}>
        {Array.from({ length: accordions }).map((_, i) => (
          <Box
            key={i}
            sx={{
              mb: 1.5,
              borderRadius: "14px",
              overflow: "hidden",
              boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
            }}
          >
            {/* accordion header */}
            <Skeleton variant="rectangular" height={52} />

            {/* table rows */}
            <Box sx={{ p: 1 }}>
              <Skeleton height={32} sx={{ mb: 1 }} />
              <Skeleton height={32} sx={{ mb: 1 }} />
              <Skeleton height={32} />
            </Box>
          </Box>
        ))}
      </Box>

      {/* ===== ADD NEW ORDER BUTTON SKELETON ===== */}
      <Box
        sx={{
          position: "fixed",
          bottom: 12,
          left: 0,
          right: 0,
          px: 2,
          zIndex: 1200,
        }}
      >
        <Skeleton variant="rounded" height={40} sx={{ borderRadius: "14px" }} />
      </Box>
    </>
  );
}
