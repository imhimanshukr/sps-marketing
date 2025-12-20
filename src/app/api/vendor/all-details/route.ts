import Vendor from "@/models/vendor.model";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../../auth";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const vendorId = searchParams.get("_id");

    // Single vendor
    if (vendorId) {
      const vendor = await Vendor.findOne({
        _id: vendorId,
        userId: session.user.id,
      });

      if (!vendor) {
        return NextResponse.json(
          { message: "Vendor not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({ vendor }, { status: 200 });
    }

    const vendors = await Vendor.find({
      userId: session.user.id,
    }).sort({ createdAt: -1 });

    return NextResponse.json({ vendors }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Get vendor data failed", error: error.message },
      { status: 500 }
    );
  }
}
