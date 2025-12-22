import connectDB from "@/lib/db";
import Vendor from "@/models/vendor.model";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../../auth";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const vendorId = searchParams.get("_id");

    // SINGLE VENDOR
    if (vendorId) {
      const vendor = await Vendor.findOne({
        _id: vendorId,
        userId: session.user.id,
      }).lean();

      if (!vendor) {
        return NextResponse.json(
          { message: "Vendor not found" },
          { status: 404 }
        );
      }

      // sory accordian by sno
      vendor.orderList?.forEach((order: any) => {
        order.accordian?.sort((a: any, b: any) => (a.sno ?? 0) - (b.sno ?? 0));
      });

      return NextResponse.json({ vendor }, { status: 200 });
    }

    // ALL VENDORS
    const vendors = await Vendor.find({
      userId: session.user.id,
    })
      .collation({ locale: "en", strength: 2 })
      .sort({ vendorName: 1 })
      .lean();

    // SORT ALL ACCORDIANS
    vendors.forEach((vendor: any) => {
      vendor.orderList?.forEach((order: any) => {
        order.accordian?.sort((a: any, b: any) => (a.sno ?? 0) - (b.sno ?? 0));
      });
    });

    return NextResponse.json({ vendors }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Get vendor data failed", error: error.message },
      { status: 500 }
    );
  }
}
