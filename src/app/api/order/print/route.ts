import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Vendor from "@/models/vendor.model";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { createCanvas, loadImage } from "canvas";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { vendorId, orderId } = await req.json();

    const vendor: any = await Vendor.findById(vendorId).lean();
    if (!vendor) {
      return NextResponse.json(
        { message: "Vendor not found" },
        { status: 404 }
      );
    }

    const order: any = vendor.orderList.find(
      (o: any) => o.orderId === orderId
    );
    if (!order) {
      return NextResponse.json(
        { message: "Order not found" },
        { status: 404 }
      );
    }

    /* ---------------- ROWS ---------------- */
    const rows = order.accordian
      .filter((r: any) => r.orderedProductName && r.orderQty)
      .map((r: any, i: number) => [
        i + 1,
        r.orderedProductName,
        r.orderQty,
      ]);

    /* ---------------- PAGE HEIGHT ---------------- */
    const baseHeight = 45;
    const rowHeight = 7.5;
    const minHeight = 90;

    const pageHeight = Math.max(
      minHeight,
      baseHeight + rows.length * rowHeight
    );

    /* ---------------- PDF INIT ---------------- */
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: [80, pageHeight], // 🔥 80mm thermal
    });

    const pageWidth = pdf.internal.pageSize.getWidth();

    /* ---------------- LOGO ---------------- */
    const logoPath = path.join(process.cwd(), "public/logo.png");
    const logoImg = await loadImage(logoPath);

    const canvas = createCanvas(logoImg.width, logoImg.height);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(logoImg, 0, 0);

    const logoBase64 = canvas.toDataURL("image/png");
    pdf.addImage(logoBase64, "PNG", 4, 2, 16, 16);

    /* ---------------- HEADER ---------------- */
    const vendorName = (vendor.vendorName || "").toUpperCase();

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(13);
    pdf.setTextColor(0, 0, 0);

    pdf.text(
      vendorName,
      (pageWidth - pdf.getTextWidth(vendorName)) / 2,
      10
    );

    const mobile = "7979769612, 8863811908";
    const address = "Thathopur, Baheri";

    pdf.setFontSize(9);
    pdf.text(mobile, (pageWidth - pdf.getTextWidth(mobile)) / 2, 15);
    pdf.text(address, (pageWidth - pdf.getTextWidth(address)) / 2, 19);

    /* ---------------- TABLE ---------------- */
    const startY = 25;
    const CHUNK = 15;

    for (let i = 0; i < rows.length; i += CHUNK) {
      autoTable(pdf, {
        startY:
          i === 0
            ? startY
            : ((pdf as any).lastAutoTable?.finalY || startY) + 6,

        head: [["S.No", "Product", "Quantity"]],
        body: rows.slice(i, i + CHUNK),
        theme: "grid",
        margin: { left: 4, right: 4 },

        styles: {
          textColor: [0, 0, 0],
          lineColor: [0, 0, 0],
          lineWidth: 0.3,
          font: "helvetica",
          fontSize: 9,
          cellPadding: 1.5,
          valign: "middle",
          overflow: "linebreak",
        },

        headStyles: {
          fillColor: [255, 255, 255],
          textColor: [0, 0, 0],
          fontStyle: "bold",
        },

        columnStyles: {
          0: { cellWidth: 10 },
          1: { cellWidth: 38 },
          2: { cellWidth: 22 },
        },
      });
    }

    /* ---------------- FOOTER ---------------- */
    const footer = "SPS - Aapke Zaruraton Ka Saathi";
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9);

    pdf.text(
      footer,
      (pageWidth - pdf.getTextWidth(footer)) / 2,
      pageHeight - 2
    );

    /* ---------------- RESPONSE ---------------- */
    const pdfBuffer = Buffer.from(pdf.output("arraybuffer"));

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${vendor.vendorName}.pdf"`,
      },
    });
  } catch (err) {
    console.error("EPOS Print Error:", err);
    return NextResponse.json(
      { message: "Print failed" },
      { status: 500 }
    );
  }
}
