"use client";

import { Card, Box, Typography, Avatar, IconButton } from "@mui/material";
import { motion } from "framer-motion";
import { Package, Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef } from "react";

interface IProps {
  vendor: any;
  onEditVendor: (v: any) => void;
}

export default function ProductCard({ vendor, onEditVendor }: IProps) {
  const router = useRouter();
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  /* ---------------- LONG PRESS (MOBILE) ---------------- */
  const handleTouchStart = () => {
    longPressTimer.current = setTimeout(() => {
      onEditVendor(vendor);
    }, 500);
  };

  const clearLongPress = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  return (
    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.95 }}>
      <Card
        onClick={() => router.push(`/?vendorId=${vendor._id}`)}
        onTouchStart={handleTouchStart}
        onTouchEnd={clearLongPress}
        onTouchMove={clearLongPress}
        sx={{
          height: { xs: 108, md: 140 },
          borderRadius: "16px",
          px: { xs: 1, md: 1.5 },
          py: { xs: 1, md: 1.5 },
          background: "linear-gradient(145deg, #ffc923 0%, #8f1212 100%)",
          boxShadow: "0 8px 18px rgba(0,0,0,0.25)",
          color: "#fff",
          cursor: "pointer",
          position: "relative",
        }}
      >
        {/* 🔴 DESKTOP ONLY EDIT ICON */}
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onEditVendor(vendor);
          }}
          sx={{
            display: { xs: "none", md: "flex" }, // ❌ mobile pe hide
            position: "absolute",
            bottom: 6,
            left: 6,
            bgcolor: "rgba(0,0,0,0.45)",
            color: "#fff",
            borderRadius: "8px",
            opacity: 0,
            transition: "0.2s ease",
            "&:hover": {
              bgcolor: "rgba(0,0,0,0.7)",
            },
            ".MuiCard-root:hover &": {
              opacity: 1,
            },
          }}
        >
          <Pencil size={18} />
        </IconButton>

        {/* ---------------- CONTENT ---------------- */}
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Avatar
            src={vendor.logo}
            variant="square"
            sx={{
              width: { xs: 40, md: 48 },
              height: { xs: 40, md: 48 },
              borderRadius: "8px",
              fontWeight: 700,
              bgcolor: "#c62828",
            }}
          >
            {vendor.vendorName?.charAt(0).toUpperCase()}
          </Avatar>

          <Box sx={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <Package size={18} />
            {vendor?.productList?.length}
          </Box>
        </Box>

        <Box
          sx={{
            textAlign: "center",
            height: "50px",
            overflow: "hidden",
            mt: 1,
          }}
        >
          <Typography
            sx={{
              fontSize: { xs: "13px", md: "18px" },
              fontWeight: 800,
              textShadow: "0 0 6px rgba(255,255,255,0.25)",
              wordBreak: "break-word",
              textTransform: "capitalize",
            }}
          >
            {vendor?.vendorName}
          </Typography>
        </Box>
      </Card>
    </motion.div>
  );
}
