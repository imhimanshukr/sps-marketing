import Vendor from "@/models/vendor.model";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { vendorId, orderId } = await req.json();

    if (!vendorId || !orderId) {
      return NextResponse.json(
        { message: "vendorId and orderId required" },
        { status: 400 }
      );
    }

    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return NextResponse.json(
        { message: "Vendor not found" },
        { status: 404 }
      );
    }

    // find original accordion
    const originalOrder = vendor.orderList.find(
      (g: any) => String(g.orderId) === String(orderId)
    );

    if (!originalOrder) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    // new orderId
    const newOrderId = new mongoose.Types.ObjectId().toString();

    // copy rows
    const copiedAccordian = originalOrder.accordian.map(
      (row: any, index: number) => ({
        sno: index + 1,
        orderedProductName: row.orderedProductName,
        orderQty: row.orderQty,
        stock: row.stock,
        isEditable: row.orderedProductName ? false : true,
        isNewRow: row.orderedProductName ? false : true,
      })
    );

    const copiedOrder = {
      orderId: newOrderId,
      orderListName: `${originalOrder.orderListName} Copy`,
      accordian: copiedAccordian,
    };

    vendor.orderList.push(copiedOrder);
    await vendor.save({ validateBeforeSave: false });

    return NextResponse.json(
      {
        message: "Order copied successfully",
        orderId: newOrderId,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("COPY ORDER ERROR 👉", error);

    return NextResponse.json(
      {
        message: "Copy order failed",
        error: error?.message,
      },
      { status: 500 }
    );
  }
}
