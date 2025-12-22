"use client";

import { useState, useRef, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  TextField,
  InputAdornment,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Trash2, Search, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import axios from "axios";

interface NavbarProps {
  searchVal: string;
  setSearchVal: (val: string) => void;
  refreshVendors: () => void;
}

export default function Navbar({
  searchVal,
  setSearchVal,
  refreshVendors,
}: NavbarProps) {
  const [deleteAllDataModal, setDeleteAllDataModal] = useState(false);
  const [finalWarningModal, setFinalWarningModal] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen) {
      const t = setTimeout(() => searchInputRef.current?.focus(), 200);
      return () => clearTimeout(t);
    }
  }, [searchOpen]);

  /** Delete All Data */
  const deleteAllData = async () => {
    try {
      await axios.delete("/api/vendor/delete-all-data");
      await refreshVendors();
    } catch (err) {
      console.error("Delete all failed", err);
    } finally {
      setFinalWarningModal(false);
      setDeleteAllDataModal(false);
    }
  };

  return (
    <>
      <AppBar
        position="sticky"
        sx={{
          top: 0,
          zIndex: 1200,
          background:
            "linear-gradient(135deg, #ffd84d 0%, #ffc923 40%, #bb1717 100%)",
          boxShadow: "0 6px 18px rgba(0,0,0,0.25)",
        }}
      >
        <Toolbar
          sx={{
            minHeight: { xs: 60, sm: 68 },
            px: 1,
            position: "relative",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Box sx={{ position: "relative" }}>
              <Image src="/logo.png" alt="Logo" width={64} height={64} />
              <Typography
                sx={{
                  position: "absolute",
                  left: "80%",
                  bottom: 6,
                  color: "#bb1717",
                  fontSize: "12px",
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                }}
              >
                आपके ज़रूरतों का साथी ...
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
              display: { xs: "none", md: "flex" },
              pointerEvents: "none",
            }}
          >
            <Image src="/mahadev.png" alt="Mahadev" width={54} height={54} />
          </Box>

          <Box
            sx={{ marginLeft: "auto", display: "flex", alignItems: "center" }}
          >
            <motion.div whileTap={{ scale: 0.9 }}>
              <Button
                onClick={() => {
                  setSearchOpen((p) => !p);
                  setSearchVal("");
                }}
                sx={{ minWidth: 36, height: 34, color: "white" }}
              >
                <Search size={18} />
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="contained"
                startIcon={<Trash2 size={16} />}
                sx={{
                  backgroundColor: "#B71C1C",
                  mx: 0.5,
                  "&:hover": { backgroundColor: "#9a1515" },
                  padding: { md: "6px 14px", xs: "4px 6px" },
                  fontSize: { md: "0.875rem", xs: "12px" },
                }}
                onClick={() => setDeleteAllDataModal(true)}
              >
                Delete All
              </Button>
            </motion.div>

            <motion.div whileTap={{ scale: 0.9 }}>
              <Button
                onClick={() => signOut({ callbackUrl: "/login" })}
                sx={{ minWidth: 36, height: 34, color: "white" }}
              >
                <LogOut size={18} />
              </Button>
            </motion.div>
          </Box>
        </Toolbar>
      </AppBar>

      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 56, opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              overflow: "hidden",
              background:
                "linear-gradient(135deg, #ffd84d 0%, #ffc923 40%, #bb1717 100%)",
            }}
          >
            <Box
              sx={{
                height: "100%",
                display: "flex",
                alignItems: "center",
                px: 2,
              }}
            >
              <TextField
                fullWidth
                size="small"
                placeholder="Search vendor or product..."
                value={searchVal}
                inputRef={searchInputRef}
                onChange={(e) => setSearchVal(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search size={16} color="#B71C1C" />
                    </InputAdornment>
                  ),
                }}
                sx={{ backgroundColor: "#fff", borderRadius: "10px" }}
              />
            </Box>
          </motion.div>
        )}
      </AnimatePresence>

      <Dialog
        open={deleteAllDataModal}
        onClose={() => setDeleteAllDataModal(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Delete All Data</DialogTitle>
        <DialogContent>
          <Typography color="error">
            Are you sure you want to delete all vendors?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            color="error"
            onClick={() => {
              setDeleteAllDataModal(false);
              setFinalWarningModal(true);
            }}
          >
            Yes
          </Button>
          <Button onClick={() => setDeleteAllDataModal(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={finalWarningModal}
        onClose={() => setFinalWarningModal(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle color="error">Final Warning</DialogTitle>
        <DialogContent>
          <Typography color="error">
            Ye data permanently delete ho jayega aur dubara kabhi nahi aayega.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button color="error" onClick={deleteAllData}>
            Delete Permanently
          </Button>
          <Button onClick={() => setFinalWarningModal(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
