import connectDB from "@/lib/db";
import Vendor from "@/models/vendor.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { vendorId, orderId, row } = await req.json();

    const vendor = await Vendor.findOne({
      _id: vendorId,
      "orderList.orderId": orderId,
    });

    if (!vendor) {
      return NextResponse.json({ message: "Vendor not found" }, { status: 404 });
    }

    const order = vendor.orderList.find(
      (o: any) => String(o.orderId) === String(orderId)
    );

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    const nextSno = order.accordian.length + 1;

    // 1️⃣ Update current editable row
    await Vendor.updateOne(
      {
        _id: vendorId,
        "orderList.orderId": orderId,
        "orderList.accordian._id": row._id,
      },
      {
        $set: {
          "orderList.$[o].accordian.$[r].orderedProductName":
            row.orderedProductName,
          "orderList.$[o].accordian.$[r].orderQty": row.orderQty,
          "orderList.$[o].accordian.$[r].stock": row.stock,
          "orderList.$[o].accordian.$[r].isEditable": false,
          "orderList.$[o].accordian.$[r].isNewRow": false,
        },
      },
      {
        arrayFilters: [{ "o.orderId": orderId }, { "r._id": row._id }],
      }
    );

    // 2️⃣ Push new empty row WITH sno
    await Vendor.updateOne(
      { _id: vendorId, "orderList.orderId": orderId },
      {
        $push: {
          "orderList.$.accordian": {
            sno: nextSno + 1,
            orderedProductName: "",
            orderQty: "",
            stock: "",
            isEditable: true,
            isNewRow: true,
          },
        },
      }
    );

    return NextResponse.json({ message: "Row added" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Add row failed", error: error.message },
      { status: 500 }
    );
  }
}
