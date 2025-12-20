"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Typography,
  IconButton,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Autocomplete,
} from "@mui/material";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import EditIcon from "@mui/icons-material/Edit";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import PrintIcon from "@mui/icons-material/Print";
import { SquarePen, SquarePlus, Trash, Trash2 } from "lucide-react";
import axios from "axios";
import ConfirmDialog from "./mini-component/ConfirmDialog";
import CellInput from "./mini-component/CellInput";

interface OrderRow {
  _id?: string;
  sno: number;
  orderedProductName: string;
  orderQty: string;
  stock: string;
  isEditable: boolean;
  isNewRow: boolean;
}
type ActionType = "delete" | "copy" | "deleteRow" | "copySelected" | null;

const SingleOrderAccordion = ({ order, vendor, refreshVendors }: any) => {
  console.log({ vendor, order });
  const [rows, setRows] = useState<OrderRow[]>([]);
  const [selectedRow, setSelectedRow] = useState<OrderRow | null>(null);

  const [actionType, setActionType] = useState<ActionType>(null);
  const [triggeredData, setTriggerData] = useState<{
    vendorId: string;
    orderId: string;
  } | null>(null);

  const [isEditingName, setIsEditingName] = useState(false);
  const [orderName, setOrderName] = useState(order?.orderListName || "");
  const [showAllRows, setShowAllRows] = useState(false);
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(new Set());

  const orderQtyRefs = useRef<Array<HTMLInputElement | null>>([]);
  const stockRefs = useRef<Array<HTMLInputElement | null>>([]);

  const updateRow = useCallback(
    (index: number, field: keyof OrderRow, value: string) => {
      setRows((prev) => {
        const next = [...prev];
        next[index] = { ...next[index], [field]: value };
        return next;
      });
    },
    []
  );

  const handleEditToggle = (index: number) => {
    setRows((prev) =>
      prev.map((row, i) => ({
        ...row,
        isEditable: i === index ? true : false,
      }))
    );
  };

  const handleSaveRow = async (row: OrderRow) => {
    if (!row.orderedProductName) return;

    await axios.post("/api/order-row/add", {
      vendorId: vendor._id,
      orderId: order.orderId,
      row,
    });

    await refreshVendors();
  };

  /* ---------- Update ROW ---------- */
  const handleUpdateRow = async (row: OrderRow) => {
    if (!row._id) return;

    await axios.patch("/api/order-row/update", {
      vendorId: vendor._id,
      orderId: order.orderId,
      rowId: row._id,
      data: {
        orderedProductName: row.orderedProductName,
        orderQty: row.orderQty,
        stock: row.stock,
        isEditable: false,
        isNewRow: false,
      },
    });

    await refreshVendors();
  };

  /* ---------- DELETE ROW ---------- */
  const handleDeleteRow = async () => {
    if (selectedRow && !selectedRow._id) return;

    await axios.delete("/api/order-row/delete", {
      data: {
        vendorId: vendor._id,
        orderId: order.orderId,
        rowId: selectedRow?._id,
      },
    });

    await refreshVendors();
    setSelectedRow(null);
    setActionType(null);
  };

  // Save Order Name
  const saveOrderName = async () => {
    try {
      await axios.patch("/api/order/edit-name", {
        vendorId: vendor._id,
        orderId: order.orderId,
        orderName,
      });

      await refreshVendors();
      setIsEditingName(false);
    } catch (err) {
      console.error("Edit order name failed", err);
    }
  };

  const deleteAccordian = async () => {
    console.log("triggeredData: ", triggeredData);
    if (!triggeredData) return;

    try {
      await axios.delete("/api/order/delete-single", {
        data: {
          vendorId: triggeredData.vendorId,
          orderId: triggeredData.orderId,
        },
      });

      await refreshVendors();
    } finally {
      setActionType(null);
      setTriggerData(null);
    }
  };

  const handleCopyClick = () => {
    if (selectedRowIds.size > 0) {
      setActionType("copySelected");
    } else {
      setActionType("copy");
    }

    setTriggerData({
      vendorId: vendor._id,
      orderId: order.orderId,
    });
  };

  const copyAccordian = async () => {
    if (!triggeredData) return;

    try {
      await axios.post("/api/order/copy", {
        vendorId: triggeredData.vendorId,
        orderId: triggeredData.orderId,
      });

      await refreshVendors();
    } catch (err) {
      console.error("Copy failed", err);
    } finally {
      setActionType(null);
      setTriggerData(null);
    }
  };

  const toggleRowSelect = (rowId?: string) => {
    if (!rowId) return;

    setSelectedRowIds((prev) => {
      const next = new Set(prev);
      if (next.has(rowId)) next.delete(rowId);
      else next.add(rowId);
      return next;
    });
  };

  const copySelectedRows = async () => {
    if (!triggeredData || selectedRowIds.size === 0) return;

    await axios.post("/api/order/copy-selected", {
      vendorId: triggeredData.vendorId,
      orderId: triggeredData.orderId,
      rowIds: Array.from(selectedRowIds),
    });

    setSelectedRowIds(new Set());
    await refreshVendors();
    setActionType(null);
  };

  const handlePrint = async () => {
    const res = await axios.post(
      "/api/order/print",
      { vendorId: vendor._id, orderId: order.orderId },
      { responseType: "blob" }
    );

    const blob = new Blob([res.data], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const pdfWindow = window.open(url, "_blank");
    if (!pdfWindow) {
      alert("Popup blocked");
    }
  };

const formattedProductList = useMemo(
  () =>
    (vendor?.productList || []).map((str: string) =>
      str
        .split(" ")
        .map(
          (word) =>
            word.charAt(0).toUpperCase() +
            word.slice(1).toLowerCase()
        )
        .join(" ")
    ),
  [vendor?.productList]
);


  useEffect(() => {
    if (!order?.accordian) return;

    // shallow copy for safe editing
    setRows(
      order.accordian.map((orderedProduct: any) => ({ ...orderedProduct }))
    );
  }, [order]);

  useEffect(() => {
    setOrderName(order?.orderListName || "");
  }, [order]);

  return (
    <>
      <Accordion
        defaultExpanded
        sx={{
          borderRadius: "14px",
          backgroundColor: "#fafafa",
          marginBottom: "10px",
          boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
          "&:before": { display: "none" },
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon sx={{ color: "#fff" }} />}
          sx={{
            background: "linear-gradient(135deg, #8f1212 0%, #c62828 100%)",
            borderRadius: "14px",
            color: "#fff",
            px: { xs: 1.5, sm: 2 },
          }}
        >
          <Box
            sx={{
              width: "100%",
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 1,
            }}
          >
            {/* Left */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {!isEditingName ? (
                <>
                  <Typography
                    fontWeight={700}
                    fontSize={{ xs: 14, sm: 16 }}
                    sx={{ textTransform: "capitalize" }}
                  >
                    {order?.orderListName || "Order Name"}
                  </Typography>

                  <IconButton
                    size="small"
                    sx={{ color: "#ffe082" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsEditingName(true);
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </>
              ) : (
                <>
                  <TextField
                    size="small"
                    value={orderName}
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => setOrderName(e.target.value)}
                    sx={{
                      background: "#fff",
                      borderRadius: "6px",
                      maxWidth: { xs: 120, md: 160 },
                    }}
                  />

                  <IconButton
                    size="small"
                    sx={{ color: "#fff" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      saveOrderName();
                    }}
                  >
                    <SquarePlus size={18} />
                  </IconButton>
                </>
              )}
            </Box>
            {/* Right */}
            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              <IconButton
                size="medium"
                sx={{ color: "#ffca28" }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopyClick();
                }}
              >
                <ContentCopyIcon fontSize="medium" />
              </IconButton>
              <IconButton
                size="medium"
                sx={{ color: "#FFF3E0" }}
                onClick={(e) => {
                  e.stopPropagation();
                  setActionType("delete");
                  setTriggerData({
                    vendorId: vendor._id,
                    orderId: order?.orderId,
                  });
                }}
              >
                <Trash2 fontSize="medium" />
              </IconButton>
            </Box>
          </Box>
        </AccordionSummary>

        <AccordionDetails
          sx={{
            p: 0,
            overflow: "hidden",
          }}
        >
          {/* TABLE WRAPPER */}
          <Box
            sx={{
              maxHeight: showAllRows ? "unset" : 240,
              overflowY: showAllRows ? "auto" : "auto",
              overflowX: "auto",
            }}
          >
            <Table
              size="small"
              sx={{
                tableLayout: "fixed",
                width: "100%",
                minWidth: 600,
                "& .MuiTableCell-root": {
                  p: "4px",
                },
              }}
            >
              <TableHead>
                <TableRow
                  sx={{
                    backgroundColor: "#f5f5f5",
                    "& th": {
                      fontWeight: 700,
                      fontSize: 13,
                    },
                  }}
                >
                  <TableCell align="center" sx={{ width: 40 }}>
                    S.No
                  </TableCell>
                  <TableCell sx={{ width: { xs: 120, md: 320 } }}>
                    Product
                  </TableCell>
                  <TableCell
                    sx={{ width: { xs: 80, md: 120 }, textAlign: "center" }}
                  >
                    Order
                  </TableCell>
                  <TableCell
                    sx={{ width: { xs: 80, md: 120 }, textAlign: "center" }}
                  >
                    Stock
                  </TableCell>
                  <TableCell align="center" sx={{ width: 110 }}>
                    Action
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {rows.map((row, index) => (
                  <TableRow
                    key={row._id ?? index}
                    sx={{
                      backgroundColor: selectedRowIds.has(row._id || "")
                        ? "#2e7d3059"
                        : "transparent",
                      "&:hover": {
                        backgroundColor: selectedRowIds.has(row._id || "")
                          ? "#2e7d3059"
                          : "rgba(0,0,0,0.04)",
                      },
                    }}
                  >
                    {/* S.NO */}
                    <TableCell align="center">{index + 1}</TableCell>

                    {/* PRODUCT */}
                    <TableCell>
                      <Autocomplete
                        size="small"
                        options={formattedProductList}
                        value={row.orderedProductName || null}
                        disabled={!row.isEditable}
                        onChange={(_, val) => {
                          updateRow(index, "orderedProductName", val || "");
                          setTimeout(() => {
                            orderQtyRefs.current[index]?.focus();
                          }, 0);
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            fullWidth
                            variant="outlined"
                            sx={{
                              "& .MuiInputBase-input": {
                                textTransform: "capitalize",
                              },
                              "& .MuiInputBase-input.Mui-disabled": {
                                WebkitTextFillColor: "#000",
                                opacity: 0.7,
                              },
                            }}
                          />
                        )}
                      />
                    </TableCell>

                    {/* ORDER */}
                    <TableCell>
                      <CellInput
                        value={row.orderQty}
                        disabled={!row.isEditable}
                        ref={(el) => {
                          orderQtyRefs.current[index] = el;
                        }}
                        onCommit={(val) => updateRow(index, "orderQty", val)}
                        onEnter={(val) => {
                          updateRow(index, "orderQty", val);
                          stockRefs.current[index]?.focus();
                        }}
                      />
                    </TableCell>

                    {/* STOCK */}
                    <TableCell>
                      <CellInput
                        value={row.stock}
                        disabled={!row.isEditable}
                        ref={(el) => {
                          stockRefs.current[index] = el;
                        }}
                        onCommit={(val) => updateRow(index, "stock", val)}
                        onEnter={(val) => {
                          const updatedRow = {
                            ...row,
                            stock: val,
                          };

                          if (row.isNewRow) {
                            handleSaveRow(updatedRow);
                          } else {
                            handleUpdateRow(updatedRow);
                          }
                        }}
                      />
                    </TableCell>

                    {/* ACTION */}
                    <TableCell align="center">
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          gap: 0.5,
                        }}
                      >
                        {/* ADD */}
                        {row.isNewRow && row.isEditable && (
                          <IconButton
                            size="small"
                            sx={{ color: "#2e7d32" }}
                            onClick={() => handleSaveRow(row)}
                          >
                            <SquarePlus size={18} />
                          </IconButton>
                        )}

                        {/* EDIT */}
                        {!row.isNewRow && !row.isEditable && (
                          <IconButton
                            size="small"
                            sx={{ color: "#1565c0" }}
                            onClick={() => handleEditToggle(index)}
                          >
                            <SquarePen size={18} />
                          </IconButton>
                        )}

                        {/* UPDATE */}
                        {!row.isNewRow && row.isEditable && (
                          <IconButton
                            size="small"
                            sx={{ color: "#2e7d32" }}
                            onClick={() => handleUpdateRow(row)}
                          >
                            <SquarePlus size={18} />
                          </IconButton>
                        )}

                        {/* DELETE */}
                        {order?.accordian.length > 1 &&
                          !row.isNewRow &&
                          !row.isEditable && (
                            <IconButton
                              size="small"
                              sx={{ color: "#c62828" }}
                              onClick={() => {
                                setSelectedRow(row);
                                setActionType("deleteRow");
                              }}
                            >
                              <Trash size={18} />
                            </IconButton>
                          )}
                        {/* CHECKBOX */}
                        {row._id && !row.isNewRow && !row.isEditable && (
                          <IconButton
                            size="small"
                            onClick={() => toggleRowSelect(row._id)}
                            sx={{
                              color: selectedRowIds.has(row._id)
                                ? "#2e7d32"
                                : "#37474f",
                              "&:hover": {
                                color: selectedRowIds.has(row._id)
                                  ? "#1b5e20"
                                  : "#000",
                                backgroundColor: "rgba(0,0,0,0.06)",
                              },
                            }}
                          >
                            {selectedRowIds.has(row._id) ? (
                              <CheckBoxIcon fontSize="small" />
                            ) : (
                              <CheckBoxOutlineBlankIcon fontSize="small" />
                            )}
                          </IconButton>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>

          {/* FOOTER */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              gap: 1,
              px: 1,
              py: 0.5,
              borderTop: "1px solid #eee",
              background: "#fafafa",
            }}
          >
            {Array.from(selectedRowIds).length > 0 && (
              <Typography
                variant="h6"
                color="crimson"
                sx={{
                  width: 30,
                  height: 30,
                  fontSize: "16px",
                  fontWeight: 600,
                  border: "2px solid",
                  textAlign: "center",
                  lineHeight: "27px",
                }}
              >
                {Array.from(selectedRowIds).length}
              </Typography>
            )}
            {/* EXPAND / COLLAPSE */}
            {rows.length > 4 && (
              <Button
                variant="contained"
                size="small"
                onClick={() => setShowAllRows((p) => !p)}
              >
                {showAllRows ? "Show Less" : "Show More"}
              </Button>
            )}

            {/* PRINT */}
            <Button
              size="small"
              startIcon={<PrintIcon />}
              variant="outlined"
              sx={{
                color: "#8f1212",
                borderColor: "#8f1212",
              }}
              onClick={handlePrint}
            >
              Print
            </Button>
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Delete Dialog For Main Order*/}
      <ConfirmDialog
        open={actionType === "delete"}
        title="Delete Order"
        description="Are you sure you want to delete this order ?"
        confirmText="Delete"
        cancelText="Cancel"
        onClose={() => {
          setActionType(null);
          setTriggerData(null);
        }}
        onConfirm={deleteAccordian}
      />

      {/* Copy Order Dialog */}
      <ConfirmDialog
        open={actionType === "copy"}
        title="Copy Order"
        description="Do you want to duplicate this order ?"
        confirmText="Copy"
        cancelText="Cancel"
        onClose={() => {
          setActionType(null);
          setTriggerData(null);
        }}
        onConfirm={copyAccordian}
      />

      {/* Delete Dialog For Main Order*/}
      <ConfirmDialog
        open={actionType === "deleteRow"}
        title="Delete Order"
        description="Are you sure you want to delete this order ?"
        confirmText="Delete"
        cancelText="Cancel"
        onClose={() => {
          setActionType(null);
          setTriggerData(null);
        }}
        onConfirm={handleDeleteRow}
      />

      {/* Copy Selected Rows */}
      <ConfirmDialog
        open={actionType === "copySelected"}
        title="Copy Selected Rows"
        description="Only selected rows will be copied into a new order."
        confirmText="Copy"
        cancelText="Cancel"
        onClose={() => {
          setActionType(null);
          setTriggerData(null);
        }}
        onConfirm={copySelectedRows}
      />
    </>
  );
};

export default SingleOrderAccordion;
