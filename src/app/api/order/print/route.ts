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
      return NextResponse.json({ message: "Vendor not found" }, { status: 404 });
    }

    const order = vendor.orderList.find((o: any) => o.orderId === orderId);
    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    /* ================= ROWS ================= */
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

    /* ================= PDF CONFIG ================= */
    const pageWidth = 72;
    const BASE_PAGE_HEIGHT = 280;

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: [pageWidth, BASE_PAGE_HEIGHT],
      hotfixes: ["px_scaling"],
    });

    const pageHeight = pdf.internal.pageSize.getHeight();
    const pageWidthActual = pdf.internal.pageSize.getWidth();

    /* ================= HEADER ================= */
    let currentY = 6;

    try {
      const logoPath = path.join(process.cwd(), "public/logo.png");
      const logoImg = await loadImage(logoPath);
      const canvas = createCanvas(logoImg.width, logoImg.height);
      const ctx = canvas.getContext("2d");
      ctx.drawImage(logoImg, 0, 0);
      const logoBase64 = canvas.toDataURL("image/png");

      pdf.addImage(logoBase64, "PNG", 4, currentY, 12, 12);
    } catch {}

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(12);
    pdf.text(vendor.vendorName.toUpperCase(), pageWidthActual / 2, currentY + 6, {
      align: "center",
    });

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.text("7979769612, 8863811908", pageWidthActual / 2, currentY + 12, {
      align: "center",
    });
    pdf.text("Thathopur, Baheri", pageWidthActual / 2, currentY + 16, {
      align: "center",
    });

    currentY += 22;

    /* ================= TABLE ================= */
    autoTable(pdf, {
      startY: currentY,
      head: [["S.N", "Product", "Qty"]],
      body: rows,
      theme: "plain",

      margin: { left: 2, right: 2 },

      styles: {
        font: "helvetica",
        fontSize: 9,
        cellPadding: 0.8,
        textColor: [0, 0, 0],
        lineColor: [0, 0, 0],
        lineWidth: 0.1,
      },

      headStyles: {
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
        fontStyle: "bold",
        lineWidth: 0.1,
      },

      columnStyles: {
        0: { cellWidth: 7, halign: "center" },
        1: { cellWidth: "auto" },
        2: { cellWidth: 14, halign: "center" },
      },

      pageBreak: "auto",
    });

    /* ================= FOOTER (LAST PAGE ONLY) ================= */
    const lastTableY = (pdf as any).lastAutoTable.finalY;
    const footerY = lastTableY + 6;

    if (footerY + 6 > pageHeight) {
      pdf.addPage();
    }

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9);
    pdf.text(
      "SPS - Aapke Zaruraton Ka Saathi",
      pageWidthActual / 2,
      footerY,
      { align: "center" }
    );

    /* ================= RESPONSE ================= */
    const pdfBuffer = Buffer.from(pdf.output("arraybuffer"));

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="bill.pdf"`,
      },
    });
  } catch (err) {
    console.error("PRINT ERROR:", err);
    return NextResponse.json({ message: "Print failed" }, { status: 500 });
  }
}
