import connectDB from "@/lib/db";
import Vendor from "@/models/vendor.model";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest) {
  try {
    await connectDB();

    const { vendorId, orderId, rowId, data } = await req.json();

    if (!vendorId || !orderId || !rowId || !data) {
      return NextResponse.json(
        { message: "vendorId, orderId, rowId and data are required" },
        { status: 400 }
      );
    }

    /**
     * ❗ IMPORTANT RULE
     * ❌ Kabhi bhi pura row overwrite mat karo
     * ✅ Sirf specific fields update karo
     * 👉 warna sno jaise fields delete ho jaate hain
     */

    const vendor = await Vendor.findOneAndUpdate(
      {
        _id: vendorId,
        "orderList.orderId": orderId,
        "orderList.accordian._id": rowId,
      },
      {
        $set: {
          "orderList.$[o].accordian.$[r].orderedProductName":
            data.orderedProductName,
          "orderList.$[o].accordian.$[r].orderQty": data.orderQty,
          "orderList.$[o].accordian.$[r].stock": data.stock,
          "orderList.$[o].accordian.$[r].isEditable": false,
          "orderList.$[o].accordian.$[r].isNewRow": false,
        },
      },
      {
        arrayFilters: [{ "o.orderId": orderId }, { "r._id": rowId }],
        new: true,
      }
    );

    if (!vendor) {
      return NextResponse.json(
        { message: "Vendor / Order / Row not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Order row updated successfully", vendor },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("UPDATE ROW ERROR 👉", error);

    return NextResponse.json(
      { message: "Update row failed", error: error.message },
      { status: 500 }
    );
  }
}
