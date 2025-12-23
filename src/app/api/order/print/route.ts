import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Vendor from "@/models/vendor.model";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { createCanvas, loadImage } from "canvas";
import path from "path";

export const dynamic = "force-dynamic";

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

    const order = vendor.orderList.find((o: any) => o.orderId === orderId);
    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    /* ================= ROWS DATA ================= */
    const rows = order.accordian
      .filter(
        (r: any) =>
          String(r.orderedProductName || "").trim() ||
          String(r.orderQty || "").trim()
      )
      .map((r: any, index: number) => [
        index + 1,
        String(r.orderedProductName || ""),
        String(r.orderQty || ""),
      ]);

    /* ================= MINIMAL HEIGHT CALCULATION ================= */
    const estimatedHeight = 15 + rows.length * 6.5 + 8;
    const pageWidth = 72;

    /* ================= PDF CONFIGURATION ================= */
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: [pageWidth, estimatedHeight],
      hotfixes: ["px_scaling"],
    });

    const actualWidth = pdf.internal.pageSize.getWidth();

    /* ================= LOGO ================= */
    try {
      const logoPath = path.join(process.cwd(), "public/logo.png");
      const logoImg = await loadImage(logoPath);
      const canvas = createCanvas(logoImg.width, logoImg.height);
      const ctx = canvas.getContext("2d");
      ctx.drawImage(logoImg, 0, 0);
      const logoBase64 = canvas.toDataURL("image/png");
      pdf.addImage(logoBase64, "PNG", 4, 1, 12, 12);
    } catch (e) {
      console.log("Logo not found, skipping...");
    }

    /* ================= HEADER ================= */
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(12);
    pdf.text(vendor.vendorName.toUpperCase(), actualWidth / 2, 6, {
      align: "center",
    });

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.text("7979769612, 8863811908", actualWidth / 2, 10, {
      align: "center",
    });
    pdf.text("Thathopur, Baheri", actualWidth / 2, 14, { align: "center" });

    /* ================= TABLE ================= */
    autoTable(pdf, {
      startY: 18,
      head: [["S.N", "Product", "Qty"]],
      body: rows,
      theme: "plain",
      margin: { left: 2, right: 2 },
      styles: {
        font: "helvetica",
        fontSize: 9,
        cellPadding: 0.8,
        // सुनिश्चित करें कि यहाँ वैल्यू [0, 0, 0] लिखी हुई है
        textColor: [0, 0, 0], 
        lineColor: [0, 0, 0], 
        lineWidth: 0.1 // यहाँ कॉमा हटा दिया है
      },
      headStyles: {
        // सुनिश्चित करें कि यहाँ वैल्यू [255, 255, 255] लिखी हुई है
        fillColor: [255, 255, 255], 
        textColor: [0, 0, 0],
        fontStyle: "bold",
        lineWidth: 0.1 // यहाँ कॉमा हटा दिया है
      },
      columnStyles: {
        0: { cellWidth: 7, halign: "center" },
        1: { cellWidth: "auto" },
        2: { cellWidth: 12, halign: "center" } // यहाँ कॉमा हटा दिया है
      },
    });

    /* ================= FOOTER (COMPACT) ================= */
    const finalY = (pdf as any).lastAutoTable.finalY + 6;

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9);
    pdf.text("SPS - Aapke Zaruraton Ka Saathi", actualWidth / 2, finalY, {
      align: "center",
    });

    /* ================= RESPONSE ================= */
    const pdfBuffer = Buffer.from(pdf.output("arraybuffer"));

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="bill.pdf"` // यहाँ कॉमा हटा दिया है
      },
    });
  } catch (err) {
    console.error("PRINT ERROR:", err);
    return NextResponse.json({ message: "Print failed" }, { status: 500 });
  }
}
