import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { coverId, canvasDataUrl } = body;

    const { PDFDocument, rgb, StandardFonts } = await import("pdf-lib");

    // Cover dimension defaults (8.5x11, 100 pages, white paper)
    let fullWidth = 17.4752;
    let fullHeight = 11.25;
    let spineWidth = 0.2252;
    let title = "My Book";
    let author = "Author Name";
    let trimSize = "8.5 x 11";
    let paperType = "white";
    let coverFinish = "matte";

    // Fetch real dimensions from Supabase if coverId provided
    if (coverId) {
      try {
        const { createClient } = await import("@/lib/supabase/server");
        const supabase = await createClient();
        const { data: cover } = await supabase
          .from("covers")
          .select("*")
          .eq("id", coverId)
          .single();

        if (cover) {
          fullWidth = Number(cover.full_width) || fullWidth;
          fullHeight = Number(cover.full_height) || fullHeight;
          spineWidth = Number(cover.spine_width) || spineWidth;
          title = cover.title || title;
          author = cover.author || author;
          trimSize = cover.trim_size || trimSize;
          paperType = cover.paper_type || paperType;
          coverFinish = cover.cover_finish || coverFinish;
        }
      } catch {
        // Fall through to defaults
      }
    }

    // Convert inches → PDF points (72 pts/inch)
    const pageWidth = fullWidth * 72;
    const pageHeight = fullHeight * 72;
    const bleed = 0.125 * 72;
    const spineWidthPts = spineWidth * 72;

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([pageWidth, pageHeight]);
    const { width, height } = page.getSize();

    // Embed canvas image if provided
    if (canvasDataUrl && canvasDataUrl.length > 100) {
      try {
        const base64 = canvasDataUrl.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");
        const binaryStr = atob(base64);
        const bytes = new Uint8Array(binaryStr.length);
        for (let i = 0; i < binaryStr.length; i++) {
          bytes[i] = binaryStr.charCodeAt(i);
        }
        const embeddedImage = canvasDataUrl.startsWith("data:image/png")
          ? await pdfDoc.embedPng(bytes)
          : await pdfDoc.embedJpg(bytes);

        page.drawImage(embeddedImage, { x: 0, y: 0, width, height });
      } catch (imgError) {
        console.error("Image embed error:", imgError);
        await drawSpecSheet(page, pdfDoc, {
          title, author, trimSize, spineWidth, fullWidth, fullHeight,
          paperType, coverFinish, width, height, bleed, spineWidthPts,
        });
      }
    } else {
      await drawSpecSheet(page, pdfDoc, {
        title, author, trimSize, spineWidth, fullWidth, fullHeight,
        paperType, coverFinish, width, height, bleed, spineWidthPts,
      });
    }

    const pdfBytes = await pdfDoc.save();

    // Mark cover as complete
    if (coverId) {
      try {
        const { createClient } = await import("@/lib/supabase/server");
        const supabase = await createClient();
        await supabase.from("covers").update({ status: "complete" }).eq("id", coverId);
      } catch {
        // Non-fatal
      }
    }

    return new Response(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="kdp-cover-${Date.now()}.pdf"`,
        "Content-Length": pdfBytes.length.toString(),
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json(
      {
        error: "PDF generation failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function drawSpecSheet(page: any, pdfDoc: any, opts: {
  title: string; author: string; trimSize: string; spineWidth: number;
  fullWidth: number; fullHeight: number; paperType: string; coverFinish: string;
  width: number; height: number; bleed: number; spineWidthPts: number;
}) {
  const { StandardFonts, rgb } = await import("pdf-lib");
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const {
    width, height, bleed, spineWidthPts, title, author,
    trimSize, spineWidth, fullWidth, fullHeight, paperType, coverFinish,
  } = opts;

  // Dark background
  page.drawRectangle({ x: 0, y: 0, width, height, color: rgb(0.05, 0.05, 0.1) });

  const backX = bleed;
  const backW = (width - spineWidthPts) / 2 - bleed;
  const coverY = bleed;
  const coverH = height - bleed * 2;

  // Back cover zone
  page.drawRectangle({
    x: backX, y: coverY, width: backW, height: coverH,
    color: rgb(0.15, 0.15, 0.25),
    borderColor: rgb(0.5, 0.3, 0.8), borderWidth: 1,
  });

  // Spine zone
  const spineX = backX + backW;
  page.drawRectangle({
    x: spineX, y: coverY, width: spineWidthPts, height: coverH,
    color: rgb(0.1, 0.2, 0.4),
    borderColor: rgb(0.3, 0.6, 1), borderWidth: 1,
  });

  // Front cover zone
  const frontX = spineX + spineWidthPts;
  const frontW = backW;
  page.drawRectangle({
    x: frontX, y: coverY, width: frontW, height: coverH,
    color: rgb(0.15, 0.15, 0.25),
    borderColor: rgb(0.3, 0.8, 0.5), borderWidth: 1,
  });

  // Safe zone outline on front
  const safeInset = 0.25 * 72;
  page.drawRectangle({
    x: frontX + safeInset, y: coverY + safeInset,
    width: frontW - safeInset * 2, height: coverH - safeInset * 2,
    borderColor: rgb(0.3, 0.8, 0.5), borderWidth: 0.5,
    color: rgb(0, 0, 0),
    opacity: 0,
  });

  // Helper: center text in a zone
  const centerText = (text: string, x: number, w: number, y: number, size: number, f: typeof font) => {
    const tw = f.widthOfTextAtSize(text, size);
    page.drawText(text, { x: x + (w - tw) / 2, y, size, font: f, color: rgb(1, 1, 1) });
  };

  // Zone labels
  centerText("BACK COVER", backX, backW, coverY + coverH - 40, 14, boldFont);
  centerText(trimSize, backX, backW, coverY + coverH - 58, 9, font);
  centerText("FRONT COVER", frontX, frontW, coverY + coverH - 40, 14, boldFont);
  centerText(trimSize, frontX, frontW, coverY + coverH - 58, 9, font);

  // Title on front cover
  const titleText = title.substring(0, 25);
  const titleSize = 28;
  const titleW = boldFont.widthOfTextAtSize(titleText, titleSize);
  page.drawText(titleText, {
    x: frontX + (frontW - titleW) / 2,
    y: coverY + coverH / 2 + 20,
    size: titleSize, font: boldFont, color: rgb(1, 1, 1),
  });

  // Author on front cover
  const authorSize = 16;
  const authorW = font.widthOfTextAtSize(author, authorSize);
  page.drawText(author, {
    x: frontX + (frontW - authorW) / 2,
    y: coverY + coverH / 2 - 20,
    size: authorSize, font, color: rgb(0.8, 0.8, 0.8),
  });

  // Spine text (only if wide enough)
  if (spineWidth >= 0.5) {
    const spineText = title.substring(0, 20);
    page.drawText(spineText, {
      x: spineX + spineWidthPts / 2 + 4,
      y: coverY + coverH / 2 - 20,
      size: 8, font: boldFont, color: rgb(1, 1, 1),
      rotate: { type: "degrees", angle: 90 },
    });
  }

  // Barcode placeholder on back cover
  const barcodeW = 2 * 72;
  const barcodeH = 1.2 * 72;
  const barcodeX = backX + backW - barcodeW - safeInset;
  const barcodeY = coverY + safeInset;
  page.drawRectangle({
    x: barcodeX, y: barcodeY, width: barcodeW, height: barcodeH,
    color: rgb(1, 1, 1), borderColor: rgb(0, 0, 0), borderWidth: 1,
  });
  const barcodeLabel = "BARCODE";
  const barcodeLabelW = font.widthOfTextAtSize(barcodeLabel, 8);
  page.drawText(barcodeLabel, {
    x: barcodeX + (barcodeW - barcodeLabelW) / 2,
    y: barcodeY + barcodeH / 2 - 4,
    size: 8, font, color: rgb(0, 0, 0),
  });

  // Dimensions info at bottom
  const info = `Spine: ${spineWidth.toFixed(4)}" | Full: ${fullWidth.toFixed(4)}" × ${fullHeight.toFixed(4)}" | Trim: ${trimSize} | Bleed: 0.125" | ${paperType} paper | ${coverFinish}`;
  page.drawText(info, { x: bleed, y: 8, size: 6, font, color: rgb(0.6, 0.6, 0.6) });

  // Subtle watermark
  page.drawText("KDP COVER TOOL", {
    x: width / 2 - 60, y: height / 2,
    size: 10, font, color: rgb(1, 1, 1),
    opacity: 0.05,
    rotate: { type: "degrees", angle: 45 },
  });
}
