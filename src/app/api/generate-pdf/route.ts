import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { PDFDocument, rgb, degrees } from "pdf-lib";

const POINTS_PER_INCH = 72;

function inchesToPoints(inches: number): number {
  return inches * POINTS_PER_INCH;
}

export async function POST(request: Request) {
  try {
    const { coverId } = await request.json();

    if (!coverId) {
      return NextResponse.json({ error: "coverId is required" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch cover data
    const { data: cover, error: fetchError } = await supabase
      .from("covers")
      .select("*")
      .eq("id", coverId)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !cover) {
      return NextResponse.json({ error: "Cover not found" }, { status: 404 });
    }

    // Get trim size dimensions from the cover record
    const trimSizeMap: Record<string, { width: number; height: number }> = {
      "8.5 x 11": { width: 8.5, height: 11 },
      "6 x 9": { width: 6, height: 9 },
      "5.5 x 8.5": { width: 5.5, height: 8.5 },
      "8 x 10": { width: 8, height: 10 },
      "8.5 x 8.5": { width: 8.5, height: 8.5 },
    };

    const trimDims = trimSizeMap[cover.trim_size] ?? { width: 8.5, height: 11 };
    const spineWidth = Number(cover.spine_width) || 0.25;
    const fullWidth = Number(cover.full_width) || (trimDims.width * 2 + spineWidth + 0.25);
    const fullHeight = Number(cover.full_height) || (trimDims.height + 0.25);
    const bleed = 0.125;

    // Create PDF
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([
      inchesToPoints(fullWidth),
      inchesToPoints(fullHeight),
    ]);

    const { width: pageWidth, height: pageHeight } = page.getSize();

    // Background
    page.drawRectangle({
      x: 0,
      y: 0,
      width: pageWidth,
      height: pageHeight,
      color: rgb(1, 1, 1),
    });

    // Back cover zone (left panel)
    const backCoverWidth = inchesToPoints(trimDims.width);
    page.drawRectangle({
      x: 0,
      y: 0,
      width: backCoverWidth,
      height: pageHeight,
      color: rgb(0.97, 0.95, 1.0),
      borderColor: rgb(0.6, 0.4, 0.9),
      borderWidth: 0.5,
    });

    // Spine zone
    const spineX = backCoverWidth;
    const spineWidthPts = inchesToPoints(spineWidth);
    page.drawRectangle({
      x: spineX,
      y: 0,
      width: spineWidthPts,
      height: pageHeight,
      color: rgb(0.85, 0.80, 0.98),
      borderColor: rgb(0.5, 0.3, 0.85),
      borderWidth: 0.5,
    });

    // Front cover zone (right panel)
    const frontX = spineX + spineWidthPts;
    const frontCoverWidth = inchesToPoints(trimDims.width);
    page.drawRectangle({
      x: frontX,
      y: 0,
      width: frontCoverWidth,
      height: pageHeight,
      color: rgb(0.97, 0.95, 1.0),
      borderColor: rgb(0.6, 0.4, 0.9),
      borderWidth: 0.5,
    });

    // Bleed lines (dashed effect - draw as thin lines)
    const bleedPts = inchesToPoints(bleed);
    const dashColor = rgb(0.8, 0.1, 0.1);
    const dashWidth = 0.75;

    // Left bleed
    page.drawLine({ start: { x: bleedPts, y: 0 }, end: { x: bleedPts, y: pageHeight }, thickness: dashWidth, color: dashColor });
    // Right bleed
    page.drawLine({ start: { x: pageWidth - bleedPts, y: 0 }, end: { x: pageWidth - bleedPts, y: pageHeight }, thickness: dashWidth, color: dashColor });
    // Top bleed
    page.drawLine({ start: { x: 0, y: bleedPts }, end: { x: pageWidth, y: bleedPts }, thickness: dashWidth, color: dashColor });
    // Bottom bleed
    page.drawLine({ start: { x: 0, y: pageHeight - bleedPts }, end: { x: pageWidth, y: pageHeight - bleedPts }, thickness: dashWidth, color: dashColor });

    // Safe zone lines (0.25" inside trim)
    const safeInset = inchesToPoints(0.25);
    const safeColor = rgb(0.1, 0.5, 0.1);

    // Back cover safe zone
    page.drawRectangle({
      x: bleedPts + safeInset,
      y: bleedPts + safeInset,
      width: backCoverWidth - bleedPts - safeInset * 2,
      height: pageHeight - bleedPts * 2 - safeInset * 2,
      borderColor: safeColor,
      borderWidth: 0.5,
      color: rgb(0, 0, 0),
      opacity: 0,
      borderOpacity: 0.4,
    });

    // Front cover safe zone
    page.drawRectangle({
      x: frontX + safeInset,
      y: bleedPts + safeInset,
      width: frontCoverWidth - safeInset * 2,
      height: pageHeight - bleedPts * 2 - safeInset * 2,
      borderColor: safeColor,
      borderWidth: 0.5,
      color: rgb(0, 0, 0),
      opacity: 0,
      borderOpacity: 0.4,
    });

    // Text labels using built-in font
    const font = await pdfDoc.embedStandardFont("Helvetica" as any);
    const boldFont = await pdfDoc.embedStandardFont("Helvetica-Bold" as any);

    // "FRONT COVER" text
    const frontCenterX = frontX + frontCoverWidth / 2;
    const frontCenterY = pageHeight / 2;
    const frontLabel = "FRONT COVER";
    const frontLabelWidth = font.widthOfTextAtSize(frontLabel, 18);
    page.drawText(frontLabel, {
      x: frontCenterX - frontLabelWidth / 2,
      y: frontCenterY + 30,
      size: 18,
      font: boldFont,
      color: rgb(0.4, 0.2, 0.7),
      opacity: 0.6,
    });

    // Book title on front
    if (cover.title) {
      const titleSize = 12;
      const titleWidth = font.widthOfTextAtSize(cover.title, titleSize);
      page.drawText(cover.title, {
        x: frontCenterX - Math.min(titleWidth, frontCoverWidth - 40) / 2,
        y: frontCenterY,
        size: titleSize,
        font: boldFont,
        color: rgb(0.2, 0.1, 0.5),
        maxWidth: frontCoverWidth - 40,
      });
    }

    // Author on front
    if (cover.author) {
      const authorSize = 10;
      const authorWidth = font.widthOfTextAtSize(cover.author, authorSize);
      page.drawText(cover.author, {
        x: frontCenterX - Math.min(authorWidth, frontCoverWidth - 40) / 2,
        y: frontCenterY - 20,
        size: authorSize,
        font,
        color: rgb(0.3, 0.2, 0.6),
        maxWidth: frontCoverWidth - 40,
      });
    }

    // "BACK COVER" text
    const backCenterX = backCoverWidth / 2;
    const backLabel = "BACK COVER";
    const backLabelWidth = font.widthOfTextAtSize(backLabel, 18);
    page.drawText(backLabel, {
      x: backCenterX - backLabelWidth / 2,
      y: pageHeight / 2 + 30,
      size: 18,
      font: boldFont,
      color: rgb(0.4, 0.2, 0.7),
      opacity: 0.6,
    });

    // Back cover description text
    if (cover.back_cover_text) {
      const maxWidth = backCoverWidth - 60;
      page.drawText(cover.back_cover_text, {
        x: backCenterX - maxWidth / 2,
        y: pageHeight / 2,
        size: 9,
        font,
        color: rgb(0.2, 0.1, 0.4),
        maxWidth,
        lineHeight: 14,
      });
    }

    // Barcode placeholder on back cover (bottom right)
    const barcodeWidth = inchesToPoints(2);
    const barcodeHeight = inchesToPoints(1.2);
    const barcodeX = backCoverWidth - bleedPts - safeInset - barcodeWidth;
    const barcodeY = bleedPts + safeInset + 5;
    page.drawRectangle({
      x: barcodeX,
      y: barcodeY,
      width: barcodeWidth,
      height: barcodeHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
      color: rgb(1, 1, 1),
    });
    const barcodeText = "BARCODE";
    const barcodeTextWidth = font.widthOfTextAtSize(barcodeText, 8);
    page.drawText(barcodeText, {
      x: barcodeX + barcodeWidth / 2 - barcodeTextWidth / 2,
      y: barcodeY + barcodeHeight / 2 - 4,
      size: 8,
      font,
      color: rgb(0.5, 0.5, 0.5),
    });

    // Spine text (only if spine >= 0.5")
    if (spineWidth >= 0.5) {
      const spineText = `${cover.title} | ${cover.author}`;
      const spineTextSize = Math.min(9, spineWidthPts * 0.6);
      page.drawText(spineText, {
        x: spineX + spineWidthPts / 2 + spineTextSize / 2,
        y: pageHeight * 0.35,
        size: spineTextSize,
        font: boldFont,
        color: rgb(0.3, 0.1, 0.6),
        rotate: degrees(90),
        maxWidth: pageHeight * 0.4,
      });
    }

    // Spine width label
    const spineLabel = `${spineWidth.toFixed(4)}"`;
    const spineLabelWidth = font.widthOfTextAtSize(spineLabel, 6);
    page.drawText(spineLabel, {
      x: spineX + spineWidthPts / 2 - spineLabelWidth / 2,
      y: 8,
      size: 6,
      font,
      color: rgb(0.3, 0.3, 0.8),
    });

    // Dimension annotations at top
    const dimY = pageHeight - 12;
    page.drawText(`Full: ${fullWidth.toFixed(4)}" x ${fullHeight.toFixed(4)}"`, {
      x: 10,
      y: dimY,
      size: 7,
      font,
      color: rgb(0.4, 0.4, 0.4),
    });
    page.drawText(`Trim: ${trimDims.width}" x ${trimDims.height}" | Bleed: 0.125"`, {
      x: 10,
      y: dimY - 10,
      size: 7,
      font,
      color: rgb(0.4, 0.4, 0.4),
    });

    // WATERMARK for free plan
    // Check user profile plan
    const { data: profileData } = await supabase
      .from("profiles")
      .select("plan")
      .eq("id", user.id)
      .single();

    if (!profileData || profileData.plan === "free") {
      const watermarkFont = await pdfDoc.embedStandardFont("Helvetica-Bold" as any);
      const wmText = "KDP COVER TOOL - FREE VERSION";
      const wmSize = 28;
      page.drawText(wmText, {
        x: pageWidth / 2 - font.widthOfTextAtSize(wmText, wmSize) / 2,
        y: pageHeight / 2 - 60,
        size: wmSize,
        font: watermarkFont,
        color: rgb(0.9, 0.1, 0.1),
        opacity: 0.15,
        rotate: degrees(-30),
      });
    }

    // Serialize the PDF
    const pdfBytes = await pdfDoc.save();

    // Update cover status to complete
    await supabase
      .from("covers")
      .update({ status: "complete", updated_at: new Date().toISOString() })
      .eq("id", coverId);

    return new Response(Buffer.from(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="kdp-cover-${coverId}.pdf"`,
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
