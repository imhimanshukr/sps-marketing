import connectDB from "@/lib/db";
import Vendor from "@/models/vendor.model";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../../auth";

export async function PATCH(req: NextRequest) {
  try {
    await connectDB();

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { vendorId, orderId, rows } = await req.json();

    if (!vendorId || !orderId || !Array.isArray(rows)) {
      return NextResponse.json(
        { message: "vendorId, orderId, rows required" },
        { status: 400 }
      );
    }

    // 1️⃣ Vendor fetch
    const vendor = await Vendor.findOne({
      _id: vendorId,
      userId: session.user.id,
    });

    if (!vendor) {
      return NextResponse.json({ message: "Vendor not found" }, { status: 404 });
    }

    // 2️⃣ Find order
    const order = vendor.orderList.find(
      (o: any) => String(o.orderId) === String(orderId)
    );

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    // 3️⃣ Map rowId → row
    const rowMap = new Map(
      order.accordian.map((r: any) => [String(r._id), r])
    );

    // 4️⃣ Build NEW ordered accordian
    const reorderedAccordian = rows.map((r: any, index: number) => ({
      ...rowMap.get(String(r.rowId)),
      sno: index + 1,
    }));

    // 5️⃣ Keep NEW ROW at end (if exists)
    const newRow = order.accordian.find((r: any) => r.isNewRow);
    if (newRow) {
      reorderedAccordian.push({
        ...newRow,
        sno: reorderedAccordian.length + 1,
      });
    }

    // 6️⃣ Replace whole accordian
    order.accordian = reorderedAccordian;

    await vendor.save({ validateBeforeSave: false });

    return NextResponse.json(
      { message: "Order reordered successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("REORDER ERROR 👉", error);
    return NextResponse.json(
      { message: "Reorder failed", error: error.message },
      { status: 500 }
    );
  }
}
