"use client";

import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Chip,
  Button,
  Stack,
  InputAdornment,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useState, useCallback, memo, useRef } from "react";
import ProductCard from "./ProductCard";
import { SquarePlus } from "lucide-react";
import axios from "axios";
import NoData from "./mini-component/NoData";
import ConfirmDialog from "./mini-component/ConfirmDialog";

const MemoProductCard = memo(ProductCard);

interface IVendorData {
  vendorsData: any[];
  refreshVendors: () => void;
}

export default function VendorList({
  vendorsData,
  refreshVendors,
}: IVendorData) {
  /* ---------------- STATE ---------------- */
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"add" | "edit">("add");
  const [editingVendor, setEditingVendor] = useState<any>(null);
  const [openDelete, setOpenDelete] = useState(false);

  const [vendorName, setVendorName] = useState("");
  const [logo, setLogo] = useState("");
  const [productInput, setProductInput] = useState("");
  const [productList, setProductList] = useState<string[]>([]);

  const vendorNameRef = useRef<HTMLInputElement | null>(null);
  const logoRef = useRef<HTMLInputElement>(null);
  const productRef = useRef<HTMLInputElement>(null);

  /* ---------------- HELPERS ---------------- */
  const resetDialog = () => {
    setOpen(false);
    setMode("add");
    setEditingVendor(null);
    setVendorName("");
    setLogo("");
    setProductInput("");
    setProductList([]);
    setOpenDelete(false);
  };

  const openAddDialog = () => {
    setMode("add");
    setOpen(true);
  };

  const openEditDialog = useCallback((vendor: any) => {
    setMode("edit");
    setEditingVendor(vendor);
    setVendorName(vendor.vendorName);
    setLogo(vendor.logo || "");
    setProductList(vendor.productList || []);
    setOpen(true);
  }, []);

  /* ---------------- PRODUCT LIST ---------------- */
  const handleAddProduct = () => {
    if (!productInput.trim()) return;
    setProductList((prev) => [...prev, productInput.trim()]);
    setProductInput("");
  };

  const handleDeleteProduct = (product: string) => {
    setProductList((prev) => prev.filter((p) => p !== product));
  };

  /* ---------------- API CALLS ---------------- */
  const handleAddVendor = async () => {
    await axios.post("/api/vendor/add", {
      vendorName,
      logo,
      productList,
    });

    await refreshVendors();
    resetDialog();
  };

  const handleUpdateVendor = async () => {
    await axios.patch("/api/vendor/update", {
      vendorId: editingVendor._id,
      vendorName,
      logo,
      productList,
    });

    await refreshVendors();
    resetDialog();
  };

  const handleDeleteVendor = async () => {
    await axios.delete("/api/vendor/delete", {
      data: { vendorId: editingVendor._id },
    });

    await refreshVendors();
    resetDialog();
  };

  /* ---------------- UI ---------------- */
  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* ===== VENDOR GRID ===== */}
      {vendorsData?.length ? (
        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            px: { xs: 1.5, sm: 3 },
            display: "grid",
            gap: { xs: "6px", md: "12px" },
            gridTemplateColumns: {
              xs: "repeat(3, minmax(110px, 1fr))",
              sm: "repeat(4, minmax(140px, 1fr))",
              md: "repeat(5, minmax(160px, 1fr))",
              lg: "repeat(6, minmax(180px, 1fr))",
            },
            mt: 2,
            pb: "110px",
          }}
        >
          {vendorsData.map((vendor) => (
            <MemoProductCard
              key={vendor._id}
              vendor={vendor}
              onEditVendor={openEditDialog}
            />
          ))}
        </Box>
      ) : (
        <NoData title="No Vendor Added" />
      )}

      {/* ===== ADD BUTTON ===== */}
      <Box
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          width: "100%",
          p: 2,
          background: "#fff",
          boxShadow: "0 -6px 12px rgba(0,0,0,0.15)",
        }}
      >
        <button
          onClick={openAddDialog}
          className="w-full h-12 rounded-xl text-white font-semibold bg-red-700 hover:bg-red-800 cursor-pointer"
        >
          Add Vendor
        </button>
      </Box>

      {/* ===== ADD / EDIT DIALOG ===== */}
      <Dialog
        open={open}
        onClose={resetDialog}
        fullWidth
        maxWidth="sm"
        TransitionProps={{
          onEntered: () => vendorNameRef.current?.focus(),
        }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          {mode === "edit" ? "Edit Vendor" : "Add Vendor"}
          <IconButton
            sx={{ position: "absolute", right: 8, top: 8 }}
            onClick={resetDialog}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        {/* 🔴 FORM START */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            mode === "edit" ? handleUpdateVendor() : handleAddVendor();
          }}
        >
          <DialogContent dividers>
            {/* VENDOR NAME */}
            <TextField
              label="Vendor Name"
              fullWidth
              size="small"
              inputRef={vendorNameRef}
              value={vendorName}
              onChange={(e) => setVendorName(e.target.value)}
              sx={{ mb: 1 }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  logoRef.current?.focus();
                }
              }}
            />

            {/* LOGO URL */}
            <TextField
              label="Logo URL"
              fullWidth
              size="small"
              inputRef={logoRef}
              value={logo}
              onChange={(e) => setLogo(e.target.value)}
              sx={{ mb: 1 }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  productRef.current?.focus();
                }
              }}
            />

            {/* PRODUCT INPUT */}
            <TextField
              label="Add Product"
              fullWidth
              size="small"
              inputRef={productRef}
              value={productInput}
              onChange={(e) => setProductInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddProduct();
                  productRef.current?.focus();
                }
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton type="button" onClick={handleAddProduct}>
                      <SquarePlus />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {/* PRODUCT LIST */}
            {productList.length > 0 && (
              <Stack direction="row" flexWrap="wrap" spacing={1} mt={1}>
                {productList.map((p) => (
                  <Chip
                    key={p}
                    label={p}
                    onDelete={() => handleDeleteProduct(p)}
                    color="error"
                    variant="outlined"
                    style={{ marginTop: 2 }}
                  />
                ))}
              </Stack>
            )}
          </DialogContent>

          {/* ACTIONS */}
          <DialogActions sx={{ p: 2, flexDirection: "column", gap: 1 }}>
            <Button
              fullWidth
              type="submit"
              variant="contained"
              sx={{ backgroundColor: "#c62828" }}
              disabled={!vendorName || productList.length === 0}
            >
              {mode === "edit" ? "Update Vendor" : "Add Vendor"}
            </Button>

            {mode === "edit" && (
              <Button
                fullWidth
                color="error"
                variant="outlined"
                type="button"
                onClick={() => setOpenDelete(true)}
              >
                Delete Vendor
              </Button>
            )}
          </DialogActions>
        </form>
        {/* 🔴 FORM END */}
      </Dialog>

      {/* Delete All Dialog */}
      <ConfirmDialog
        open={openDelete}
        title="Delete Vendor"
        description="Do you really want to delete?"
        confirmText="Delete"
        cancelText="Cancel"
        onClose={() => {
          setOpenDelete(false);
        }}
        onConfirm={handleDeleteVendor}
      />
    </Box>
  );
}
