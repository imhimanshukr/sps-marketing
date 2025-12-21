"use client";

import { Avatar, Box, Button, IconButton, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SingleOrderAccordion from "./SingleOrder";
import { useState } from "react";
import axios from "axios";
import NoData from "./mini-component/NoData";
import ConfirmDialog from "./mini-component/ConfirmDialog";
import OrderListSkeleton from "./mini-component/OrderListSkeleton";

const OrderList = ({ vendor, goBack, refreshVendors, fetching }: any) => {
  const [openDelete, setOpenDelete] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const vendorId = vendor?._id;

  /* ADD NEW ORDER */
  const handleNewOrder = async () => {
    if (!vendorId) return;
    try {
      setLoading(true);
      await axios.post("/api/order/add", {
        _id: vendorId,
      });

      await refreshVendors();
    } catch (error) {
      console.log(error);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  // Delete all Order
  const deleteAllOrder = async () => {
    try {
      setLoading(true);
      setOpenDelete(false);
      await axios.delete("/api/order/delete-all", {
        data: { _id: vendor._id },
      });
      await refreshVendors();
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Box sx={{ position: "relative", px: { xs: 1, sm: 2 }, mt: 1, pb: 8 }}>
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
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              px: { xs: 1, sm: 2 },
              gap: 1,
              flexWrap: "wrap",
            }}
          >
            <IconButton
              onClick={goBack}
              size="small"
              sx={{
                backgroundColor: "#c62828",
                color: "#fff",
                borderRadius: "10px",
                "&:hover": { backgroundColor: "#8f1212" },
              }}
            >
              <ArrowBackIcon fontSize="small" />
            </IconButton>

            <Button
              size="small"
              variant="contained"
              sx={{
                backgroundColor: "#c62828",
                fontSize: { xs: "11px", sm: "13px" },
                height: 30,
                borderRadius: "10px",
                px: 1.5,
                "&:hover": { backgroundColor: "#8f1212" },
              }}
              onClick={() => setOpenDelete(true)}
              disabled={vendor?.orderList?.length === 0}
            >
              Delete All Orders
            </Button>
          </Box>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
              px: 1,
            }}
          >
            <Avatar
              src={vendor.logo}
              variant="square"
              sx={{
                width: { xs: 44, md: 56 },
                height: { xs: 44, md: 56 },
                borderRadius: "10px",
                bgcolor: "#c62828",
              }}
            >
              {vendor.vendorName?.charAt(0).toUpperCase()}
            </Avatar>

            <Typography
              sx={{
                fontSize: { xs: "15px", md: "20px" },
                fontWeight: 900,
                color: "#c62828",
                textAlign: "center",
                lineHeight: 1.2,
                wordBreak: "break-word",
                textTransform: "capitalize",
              }}
            >
              {vendor.vendorName}
            </Typography>
          </Box>
        </Box>

        {loading || fetching ? (
          <OrderListSkeleton accordions={3} />
        ) : vendor?.orderList?.length > 0 ? (
          vendor.orderList.map((order: any, index: number) => (
            <SingleOrderAccordion
              key={index}
              order={order}
              orderIndex={index}
              vendor={vendor}
              refreshVendors={refreshVendors}
              fetching={fetching}
            />
          ))
        ) : (
          <NoData title="No Any Order Yet" />
        )}

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
          <Button
            variant="contained"
            fullWidth
            sx={{
              height: 40,
              fontSize: 14,
              borderRadius: "14px",
              backgroundColor: "#c62828",
              "&:hover": { backgroundColor: "#8f1212" },
            }}
            onClick={handleNewOrder}
          >
            ➕ Add New Order
          </Button>
        </Box>

        <ConfirmDialog
          open={openDelete}
          title="Delete All Order"
          description="Do you really want to delete ?"
          confirmText="Delete"
          cancelText="Cancel"
          onClose={() => {
            setOpenDelete(false);
          }}
          onConfirm={deleteAllOrder}
        />
      </Box>
    </>
  );
};

export default OrderList;
