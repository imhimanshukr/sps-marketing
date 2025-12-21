import connectDB from "@/lib/db";
import Vendor from "@/models/vendor.model";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest) {
  try {
    await connectDB();

    const { vendorId, orderId, rowId } = await req.json();

    const vendor = await Vendor.findOneAndUpdate(
      { _id: vendorId, "orderList.orderId": orderId },
      {
        $pull: {
          "orderList.$.accordian": { _id: rowId },
        },
      },
      { new: true }
    );

    return NextResponse.json(
      { message: "Order row deleted", vendor },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json(
      { message: "Delete row failed", err },
      { status: 500 }
    );
  }
}
