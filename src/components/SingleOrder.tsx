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
  TextField,
  Autocomplete,
} from "@mui/material";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import EditIcon from "@mui/icons-material/Edit";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import PrintIcon from "@mui/icons-material/Print";
import DragHandleIcon from '@mui/icons-material/DragHandle';
import useMediaQuery from "@mui/material/useMediaQuery";
import { SquarePen, SquarePlus, Trash, Trash2 } from "lucide-react";
import axios from "axios";
import ConfirmDialog from "./mini-component/ConfirmDialog";
import CellInput from "./mini-component/CellInput";
import SortableTableRow from "./mini-component/SortableTableRow";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  TouchSensor,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import Loader from "./mini-component/Loader";

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
  const [showAllRows, setShowAllRows] = useState(false);
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(new Set());
  const [orderNameDraft, setOrderNameDraft] = useState("");
  const [loading, setLoading] = useState<boolean>(false);

  const orderQtyRefs = useRef<Array<HTMLInputElement | null>>([]);
  const stockRefs = useRef<Array<HTMLInputElement | null>>([]);

  const isMobile = useMediaQuery("(max-width:768px)");

  /* DND SENSOR */
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 2 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 5,
        tolerance: 5,
      },
    })
  );

  const sortableIds = useMemo(
    () => rows.filter((r) => !r.isNewRow && !r.isEditable).map((r) => r._id!),
    [rows]
  );

  const reorderTimer = useRef<NodeJS.Timeout | null>(null);

  const syncReorderToDB = (updatedRows: OrderRow[]) => {
    if (reorderTimer.current) clearTimeout(reorderTimer.current);

    reorderTimer.current = setTimeout(async () => {
      try {
        const payload = updatedRows
          .filter((r) => !r.isNewRow && !r.isEditable)
          .map((r) => ({
            rowId: r._id,
          }));

        await axios.patch("/api/order-row/reorder", {
          vendorId: vendor._id,
          orderId: order.orderId,
          rows: payload,
        });
      } catch (err) {
        console.error("Reorder sync failed", err);
      }
    }, 300);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeRow = rows.find((r) => r._id === active.id);
    const overRow = rows.find((r) => r._id === over.id);

    if (
      !activeRow ||
      !overRow ||
      activeRow.isNewRow ||
      activeRow.isEditable ||
      overRow.isNewRow ||
      overRow.isEditable
    ) {
      return;
    }

    const oldIndex = rows.indexOf(activeRow);
    const newIndex = rows.indexOf(overRow);

    const reordered = arrayMove(rows, oldIndex, newIndex);
    setRows(reordered);
    syncReorderToDB(reordered);
  };

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
    try {
      setLoading(true);

      await axios.post("/api/order-row/add", {
        vendorId: vendor._id,
        orderId: order.orderId,
        row,
      });

      await refreshVendors();
    } catch (error) {
      console.log(error);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  /* Update ROW */
  const handleUpdateRow = async (row: OrderRow) => {
    if (!row._id) return;
    try {
      setLoading(true);

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
    } catch (error) {
      console.log(error);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  /* DELETE ROW */
  const handleDeleteRow = async () => {
    if (selectedRow && !selectedRow._id) return;
    try {
      setLoading(true);

      await axios.delete("/api/order-row/delete", {
        data: {
          vendorId: vendor._id,
          orderId: order.orderId,
          rowId: selectedRow?._id,
        },
      });

      await refreshVendors();
    } catch (error) {
      console.log(error);
      setLoading(false);
    } finally {
      setSelectedRow(null);
      setActionType(null);
      setLoading(false);
    }
  };

  /* Save Order Name */
  const saveOrderName = async () => {
    try {
      setLoading(true);
      await axios.patch("/api/order/edit-name", {
        vendorId: vendor._id,
        orderId: order.orderId,
        orderName: orderNameDraft,
      });

      await refreshVendors();
      setIsEditingName(false);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
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
    } catch (error) {
      console.log(error);
      setLoading(false);
    } finally {
      setActionType(null);
      setTriggerData(null);
      setLoading(false);
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
      setLoading(true);
      await axios.post("/api/order/copy", {
        vendorId: triggeredData.vendorId,
        orderId: triggeredData.orderId,
      });

      await refreshVendors();
    } catch (err) {
      console.error("Copy failed", err);
      setLoading(false);
    } finally {
      setActionType(null);
      setTriggerData(null);
      setLoading(false);
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
    try {
      setLoading(true);

      await axios.post("/api/order/copy-selected", {
        vendorId: triggeredData.vendorId,
        orderId: triggeredData.orderId,
        rowIds: Array.from(selectedRowIds),
      });

      setSelectedRowIds(new Set());
      await refreshVendors();
    } catch (error) {
      console.log(error);
      setLoading(false);
    } finally {
      setActionType(null);
      setLoading(false);
    }
  };

  const handlePrint = async () => {
    try {
      setLoading(true);

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
    } catch (error) {
      console.log(error);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const formattedProductList = useMemo(
    () =>
      (vendor?.productList || []).map((str: string) =>
        str
          .split(" ")
          .map(
            (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
          )
          .join(" ")
      ),
    [vendor?.productList]
  );

  useEffect(() => {
    if (!order?.accordian) return;
    setRows(
      order.accordian.map((orderedProduct: any) => ({ ...orderedProduct }))
    );
  }, [order]);

  useEffect(() => {
    if (!isEditingName) {
      setOrderNameDraft(order?.orderListName || "");
    }
  }, [order, isEditingName]);

  return (
    <>
      <Loader open={loading} />
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
                    value={orderNameDraft}
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => setOrderNameDraft(e.target.value)}
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
          <Box
            sx={{
              maxHeight: showAllRows ? "unset" : 240,
              overflowY: showAllRows ? "auto" : "auto",
              overflowX: "auto",
            }}
          >
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
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
                  <SortableTableRow id="head" disabled>
                    <TableCell align="center" sx={{ width: 40 }}>
                      S.No
                    </TableCell>
                    <TableCell sx={{ width: { xs: 120, md: 320 } }}>
                      Product
                    </TableCell>
                    <TableCell
                      sx={{ width: { xs: 80, md: 120 }, textAlign: "center" }}
                    >
                      Stock
                    </TableCell>
                    <TableCell
                      sx={{ width: { xs: 80, md: 120 }, textAlign: "center" }}
                    >
                      Order
                    </TableCell>
                    <TableCell align="center" sx={{ width: 110 }}>
                      Action
                    </TableCell>
                  </SortableTableRow>
                </TableHead>

                <SortableContext
                  items={sortableIds}
                  strategy={verticalListSortingStrategy}
                >
                  <TableBody>
                    {rows.map((row, index) => (
                      <SortableTableRow
                        key={row._id ?? index}
                        id={row._id ?? `row-${index}`}
                        disabled={row.isNewRow || row.isEditable}
                        isMobile={isMobile}
                      >
                        {({ setActivatorNodeRef, listeners, disabled }) => (
                          <>
                            <TableCell align="center">{index + 1}</TableCell>

                            <TableCell>
                              <Autocomplete
                                size="small"
                                options={formattedProductList}
                                value={row.orderedProductName || null}
                                disabled={!row.isEditable}
                                onChange={(_, val) => {
                                  updateRow(
                                    index,
                                    "orderedProductName",
                                    val || ""
                                  );
                                  setTimeout(() => {
                                    stockRefs.current[index]?.focus();
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
                                        pointerEvents: isMobile
                                          ? "none"
                                          : "default",
                                      },
                                    }}
                                  />
                                )}
                              />
                            </TableCell>

                            <TableCell>
                              <CellInput
                                value={row.stock}
                                disabled={!row.isEditable}
                                ref={(el) => {
                                  stockRefs.current[index] = el;
                                }}
                                onCommit={(val) =>
                                  updateRow(index, "stock", val)
                                }
                                onEnter={(val) => {
                                  updateRow(index, "stock", val);
                                  orderQtyRefs.current[index]?.focus();
                                }}
                              />
                            </TableCell>

                            <TableCell>
                              <CellInput
                                value={row.orderQty}
                                disabled={!row.isEditable}
                                ref={(el) => {
                                  orderQtyRefs.current[index] = el;
                                }}
                                onCommit={(val) =>
                                  updateRow(index, "orderQty", val)
                                }
                                onEnter={(val) => {
                                  const updatedRow = {
                                    ...row,
                                    orderQty: val,
                                  };

                                  if (row.isNewRow) {
                                    handleSaveRow(updatedRow);
                                  } else {
                                    handleUpdateRow(updatedRow);
                                  }
                                }}
                              />
                            </TableCell>

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
                                    <SquarePen size={22} />
                                  </IconButton>
                                )}

                                {/* UPDATE */}
                                {!row.isNewRow && row.isEditable && (
                                  <IconButton
                                    size="small"
                                    sx={{ color: "#2e7d32" }}
                                    onClick={() => handleUpdateRow(row)}
                                  >
                                    <SquarePlus size={22} />
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
                                      <Trash size={22} />
                                    </IconButton>
                                  )}
                                {/* CHECKBOX */}
                                {row._id &&
                                  !row.isNewRow &&
                                  !row.isEditable && (
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
                                        <CheckBoxIcon fontSize="medium" />
                                      ) : (
                                        <CheckBoxOutlineBlankIcon fontSize="medium" />
                                      )}
                                    </IconButton>
                                  )}
                                {/* Drag */}
                                {isMobile && !disabled && (
                                  <IconButton
                                    ref={setActivatorNodeRef}
                                    {...listeners}
                                    size="medium"
                                    sx={{
                                      cursor: "grab",
                                      width: 40,
                                      height: 40,
                                      ml: 0.5,
                                      bgcolor: "rgba(0,0,0,0.08)",
                                    }}
                                  >
                                    <DragHandleIcon />
                                  </IconButton>
                                )}
                              </Box>
                            </TableCell>
                          </>
                        )}
                      </SortableTableRow>
                    ))}
                  </TableBody>
                </SortableContext>
              </Table>
            </DndContext>
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
