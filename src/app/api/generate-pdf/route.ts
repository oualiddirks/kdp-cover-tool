import { NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";

const POINTS_PER_INCH = 72;

export async function POST(request: Request) {
  try {
    const { canvasImage, fullWidth, fullHeight } = await request.json();

    if (!canvasImage) {
      return NextResponse.json({ error: "canvasImage is required" }, { status: 400 });
    }
    if (!fullWidth || !fullHeight) {
      return NextResponse.json({ error: "fullWidth and fullHeight are required" }, { status: 400 });
    }

    // Strip data URL prefix (data:image/png;base64, or similar)
    const base64Data = (canvasImage as string).replace(/^data:image\/\w+;base64,/, "");
    const imageBuffer = Buffer.from(base64Data, "base64");

    // Create PDF at KDP dimensions
    const pageWidthPts = (fullWidth as number) * POINTS_PER_INCH;
    const pageHeightPts = (fullHeight as number) * POINTS_PER_INCH;

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([pageWidthPts, pageHeightPts]);

    // Embed the PNG canvas image
    const pngImage = await pdfDoc.embedPng(imageBuffer);
    page.drawImage(pngImage, {
      x: 0,
      y: 0,
      width: pageWidthPts,
      height: pageHeightPts,
    });

    const pdfBytes = await pdfDoc.save();

    return new Response(Buffer.from(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="kdp-cover.pdf"`,
        "Content-Length": pdfBytes.length.toString(),
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF: " + String(error) },
      { status: 500 }
    );
  }
}
