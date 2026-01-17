import connectDB from "@/lib/db";
import Vendor from "@/models/vendor.model";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { auth } from "../../../../../auth";

/* =======================
   Types (same as schema)
======================= */

interface IOrderRow {
  sno: number;
  orderedProductName: string;
  orderQty?: string;
  stock?: string;
  isEditable: boolean;
  isNewRow: boolean;
}

interface IOrderGroup {
  orderId: string;
  orderListName: string;
  accordian: IOrderRow[];
}

interface IVendor {
  userId: mongoose.Types.ObjectId;
  vendorName: string;
  logo?: string;
  productList: string[];
  orderList: IOrderGroup[];
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { vendorId } = await req.json();
    if (!vendorId) {
      return NextResponse.json(
        { message: "VendorId is required" },
        { status: 400 }
      );
    }

    /* Fetch original vendor */
    const vendor = (await Vendor.findOne({
      _id: vendorId,
      userId: session.user.id,
    }).lean()) as IVendor | null;

    if (!vendor) {
      return NextResponse.json(
        { message: "Vendor not found" },
        { status: 404 }
      );
    }

    /* Handle Copy N logic */
    const baseName = vendor.vendorName.replace(/ Copy \d+$/, "");

    const existingVendors = await Vendor.find({
      userId: session.user.id,
      vendorName: { $regex: `^${baseName}( Copy \\d+)?$`, $options: "i" },
    }).select("vendorName");

    let maxCopy = 0;
    existingVendors.forEach((v: { vendorName: string }) => {
      const match = v.vendorName.match(/Copy (\d+)/);
      if (match) {
        maxCopy = Math.max(maxCopy, Number(match[1]));
      }
    });

    const newVendorName = `${baseName} Copy ${maxCopy + 1}`;

    /* Deep clone vendor */
    const newVendor = new Vendor({
      userId: session.user.id,
      vendorName: newVendorName,
      logo: vendor.logo,
      productList: vendor.productList,
      orderList: vendor.orderList.map((order: IOrderGroup) => ({
        orderListName: order.orderListName,
        accordian: order.accordian.map((row: IOrderRow) => ({
          sno: row.sno,
          orderedProductName: row.orderedProductName,
          orderQty: row.orderQty,
          stock: row.stock,
          isEditable: row.isEditable,
          isNewRow: row.isNewRow,
        })),
      })),
    });

    await newVendor.save();

    return NextResponse.json(
      {
        message: "Vendor copied successfully",
        vendorId: newVendor._id,
        vendorName: newVendor.vendorName,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: "Vendor copy failed", error: error.message },
      { status: 500 }
    );
  }
}
