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

    const order = vendor.orderList.find(
      (o: any) => o.orderId === orderId
    );
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

    /* ================= DYNAMIC HEIGHT ================= */
    const pageHeight = 30 + rows.length * 7 + 10;

    /* ================= PDF ================= */
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: [80, pageHeight],
      compress: false, 
    });

    const pageWidth = pdf.internal.pageSize.getWidth();

    /* ================= LOGO ================= */
    const logoPath = path.join(process.cwd(), "public/logo.png");
    const logoImg = await loadImage(logoPath);

    const canvas = createCanvas(logoImg.width, logoImg.height);
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false; 
    ctx.drawImage(logoImg, 0, 0);

    const logoBase64 = canvas.toDataURL("image/png");
    pdf.addImage(logoBase64, "PNG", 4, 2, 16, 16);

    /* ================= HEADER ================= */
    pdf.setFont("courier", "bold"); 
    pdf.setFontSize(14);
    pdf.setTextColor(0, 0, 0);

    pdf.text(vendor.vendorName.toUpperCase(), pageWidth / 2, 10, {
      align: "center",
    });

    pdf.setFontSize(10);
    pdf.text("7979769612, 8863811908", pageWidth / 2, 15, {
      align: "center",
    });
    pdf.text("Thathopur, Baheri", pageWidth / 2, 19, {
      align: "center",
    });

    /* ================= TABLE ================= */
    autoTable(pdf, {
      startY: 25,
      head: [["S.No", "Product", "Qty"]],
      body: rows,
      theme: "grid",
      margin: { left: 4, right: 4 },

      styles: {
        font: "courier",  
        fontSize: 10,    
        fontStyle: "bold", 
        cellPadding: 0.8, 
        valign: "middle",
        overflow: "linebreak",
        textColor: [0, 0, 0],
        lineColor: [0, 0, 0],
        lineWidth: 0.6,   
      },

      headStyles: {
        fontStyle: "bold",
        fillColor: false,
        textColor: [0, 0, 0],
        lineWidth: 0.6,
      },

      columnStyles: {
        0: { cellWidth: 10, halign: "center" },
        1: { cellWidth: 44 },
        2: { cellWidth: 18, halign: "center" },
      },
    });

    /* ================= FOOTER ================= */
    const finalY =
      ((pdf as any).lastAutoTable?.finalY || pageHeight - 8) + 5;

    pdf.setFont("courier", "bold");
    pdf.setFontSize(9);
    pdf.text(
      "SPS - Aapke Zaruraton Ka Saathi",
      pageWidth / 2,
      finalY,
      { align: "center" }
    );

    /* ================= RESPONSE ================= */
    const pdfBuffer = Buffer.from(pdf.output("arraybuffer"));

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${vendor.vendorName}.pdf"`,
      },
    });
  } catch (err) {
    console.error("PRINT ERROR:", err);
    return NextResponse.json({ message: "Print failed" }, { status: 500 });
  }
}
