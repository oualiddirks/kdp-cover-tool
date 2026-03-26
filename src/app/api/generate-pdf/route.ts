import { NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";
import { createClient } from "@/lib/supabase/server";

const POINTS_PER_INCH = 72;
const DEFAULT_FULL_WIDTH_IN = 17.225; // 8.5*2 + 0.225 spine + 0.25 bleed
const DEFAULT_FULL_HEIGHT_IN = 11.25; // 11 + 0.25 bleed

export async function POST(request: Request) {
  try {
    const { canvasDataUrl, coverId } = await request.json();

    if (!canvasDataUrl) {
      return NextResponse.json({ error: "canvasDataUrl is required" }, { status: 400 });
    }

    // Get cover dimensions from Supabase or use defaults
    let fullWidthIn = DEFAULT_FULL_WIDTH_IN;
    let fullHeightIn = DEFAULT_FULL_HEIGHT_IN;

    if (coverId) {
      try {
        const supabase = await createClient();
        const { data: cover } = await supabase
          .from("covers")
          .select("full_width, full_height")
          .eq("id", coverId)
          .single();
        if (cover?.full_width) fullWidthIn = cover.full_width;
        if (cover?.full_height) fullHeightIn = cover.full_height;
      } catch {
        // Fall through to defaults
      }
    }

    // Strip "data:image/png;base64," prefix
    const base64 = (canvasDataUrl as string).replace(/^data:image\/\w+;base64,/, "");
    const imageBytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));

    // Create PDF at KDP dimensions (inches × 72 points)
    const fullWidthPts = fullWidthIn * POINTS_PER_INCH;
    const fullHeightPts = fullHeightIn * POINTS_PER_INCH;

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([fullWidthPts, fullHeightPts]);

    // Embed PNG and draw to fill entire page
    const coverImage = await pdfDoc.embedPng(imageBytes);
    page.drawImage(coverImage, {
      x: 0,
      y: 0,
      width: fullWidthPts,
      height: fullHeightPts,
    });

    const pdfBytes = await pdfDoc.save();

    return new Response(Buffer.from(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="kdp-cover.pdf"`,
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
