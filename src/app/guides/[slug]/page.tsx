import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

type GuideContent = {
  title: string;
  date: string;
  readTime: string;
  category: string;
  content: string;
};

const guides: Record<string, GuideContent> = {
  "kdp-cover-rejection-checklist": {
    title: "KDP Cover Rejection Checklist 2026",
    date: "January 15, 2026",
    readTime: "8 min read",
    category: "Checklists",
    content: `
## Why KDP Rejects Covers

Amazon KDP has strict technical requirements for book covers. Unlike many publishing platforms, KDP's review process will reject your book if the cover file doesn't meet their exact specifications. The good news: every rejection reason is preventable if you know what to check.

This checklist covers every common rejection reason, ordered by frequency.

---

## The Complete Rejection Checklist

### 1. Incorrect Spine Width

**The Problem:** Your spine is too wide or too narrow for your page count and paper type.

**How to Fix:** Use KDP's formula:
- White paper: pages × 0.002252 inches
- Cream paper: pages × 0.0025 inches
- Color paper: pages × 0.002347 inches

For a 200-page white paper book: 200 × 0.002252 = 0.4504 inches spine width.

**Tool:** Use our [Spine Width Calculator](/tools/calculator) to get the exact number instantly.

---

### 2. Missing or Incorrect Bleed

**The Problem:** KDP requires exactly 0.125 inches (⅛ inch) of bleed on all four sides. Your design elements must extend into this bleed area.

**How to Fix:** Add 0.125" to each side of your cover dimensions. A 6x9 cover becomes 6.25" x 9.25" with bleed. Your background, textures, and any elements that touch the edges must extend fully into the bleed.

---

### 3. Wrong DPI (Resolution)

**The Problem:** KDP requires a minimum of 300 DPI. Canva exports at 96 DPI by default. Images found on the internet are usually 72 DPI.

**How to Fix:** Export your cover at exactly 300 DPI. If using images, ensure the source images are high resolution. A 600 x 900 pixel image at 300 DPI is only 2" × 3" — too small for a full cover.

For a 6x9 cover with 0.125" bleed, you need at least: 6.25" × 300 = 1875px wide, 9.25" × 300 = 2775px tall.

---

### 4. Safe Zone Violations

**The Problem:** Critical content (title, author name, important imagery) is within 0.25" of the trim edge.

**How to Fix:** Keep all text and important elements at least 0.25" away from the trim edge (the edge where the bleed starts). This is your "safe zone." KDP can trim up to this area during the printing process.

---

### 5. Wrong File Dimensions

**The Problem:** Your cover file is the wrong size for the trim size and page count you selected in KDP.

**How to Fix:** Full cover width = (trim width × 2) + spine width + 0.25" (for both bleed sides). Full height = trim height + 0.25". Use our [Cover Calculator](/tools/calculator) to get exact dimensions.

---

### 6. Low-Quality Images

**The Problem:** Images in your cover are pixelated, blurry, or artifacted when viewed at full size.

**How to Fix:** Only use images that are at least 300 DPI at the size they'll be used. Vector graphics (SVG, AI) are always safe. If using photos, ensure they're at least 2000px wide for typical cover sizes.

---

### 7. Barcode Area Blocked

**The Problem:** Your design covers the area where KDP places the ISBN barcode on the back cover.

**How to Fix:** Leave a clear 2" × 1.2" area in the lower right corner of your back cover. Keep this area white or very light. Never place important design elements in this corner.

---

### 8. Text in the Gutter

**The Problem:** Text continues from the spine into either the front or back cover without accounting for the spine connection area.

**How to Fix:** Keep spine text fully within the spine boundaries. Don't design text that intentionally flows from spine to cover — it almost never aligns correctly after printing.

---

### 9. Incorrect Color Mode

**The Problem:** While KDP accepts RGB PDFs, CMYK gives more predictable print results.

**How to Fix:** Export in CMYK color mode if possible. If using RGB, avoid very bright neon colors which won't translate accurately to print. Test with KDP's online cover previewer.

---

### 10. PDF Compression Issues

**The Problem:** Your PDF uses compression that KDP can't read, or the file is too large (maximum 650MB).

**How to Fix:** Export as PDF/X-1a if your software supports it. Keep the file under 650MB. Our export tool handles all compression settings automatically.

---

## Quick Pre-Upload Checklist

Before uploading to KDP, check these items:

- [ ] Spine width matches KDP's formula for your page count and paper
- [ ] Bleed is exactly 0.125" on all sides
- [ ] Resolution is at least 300 DPI
- [ ] All critical text is 0.25"+ from trim edges
- [ ] Barcode area (lower right back) is clear
- [ ] File is under 650MB
- [ ] File format is PDF

Use our [KDP Preflight Checker](/tools/preflight) to automatically verify many of these items.

---

## What Happens When KDP Rejects Your Cover

KDP will show you the rejection reason in your KDP dashboard. Common messages include:
- "The cover file you uploaded does not meet our specifications"
- "The resolution of your cover image is too low"
- "Your spine width does not match the specifications for your page count"

After fixing the issue, you can re-upload immediately. There's no waiting period or penalty for rejections.
    `,
  },
  "spine-width-calculation": {
    title: "How to Calculate KDP Spine Width",
    date: "January 22, 2026",
    readTime: "6 min read",
    category: "Technical",
    content: `
## What Is KDP Spine Width?

The spine is the visible edge of a book when it sits on a shelf — the part that shows the title and author name. For KDP paperback covers, you design the spine as part of a full cover wrap that includes the front cover, spine, and back cover as one continuous image.

Getting the spine width wrong is the most common reason for KDP cover rejection. It's also completely preventable once you understand the formula.

---

## The KDP Spine Width Formula

KDP calculates spine width based on two factors:
1. **Number of pages** in your book
2. **Paper type** used for printing

The formula is:

**Spine Width = Page Count × Paper Thickness Multiplier**

### Paper Thickness Multipliers

| Paper Type | Multiplier (inches per page) |
|------------|------------------------------|
| White Paper | 0.002252" |
| Cream Paper | 0.0025" |
| Color Paper | 0.002347" |

### Example Calculations

**Example 1:** 200-page book on white paper
- Spine = 200 × 0.002252 = **0.4504 inches**

**Example 2:** 300-page book on cream paper
- Spine = 300 × 0.0025 = **0.750 inches**

**Example 3:** 150-page book on color paper
- Spine = 150 × 0.002347 = **0.3521 inches**

---

## Full Cover Width Formula

The spine calculation is used within the larger full cover width calculation:

**Full Cover Width = (Trim Width × 2) + Spine Width + 0.25"**

The 0.25" accounts for the bleed on both sides (0.125" on the left edge of the back cover + 0.125" on the right edge of the front cover).

### Example: 6×9 Book, 200 Pages, White Paper

- Spine Width: 200 × 0.002252 = 0.4504"
- Full Width: (6 × 2) + 0.4504 + 0.25 = **12.7004 inches**
- Full Height: 9 + 0.25 = **9.25 inches**

---

## Why Spine Width Changes Over Time

As you edit your manuscript, your page count changes. Each time you change the page count in KDP, you must recalculate your spine width and update your cover design.

This is why authors often get their covers rejected during the upload process — they calculated the spine at 200 pages but their final manuscript is 210 pages, which changes the spine width by 0.02252 inches. That tiny difference is enough for a rejection.

**Best practice:** Don't finalize your cover until your manuscript page count is locked in.

---

## Minimum Pages for a Visible Spine

KDP requires at least 100 pages for your book to have any visible spine (enough to hold text). Books under 100 pages have a spine too thin for text.

- Under 100 pages: Spine text is not recommended
- 100-200 pages: Small spine text only (no horizontal text)
- 200+ pages: Full spine text with title and author

---

## Using Our Calculator

Rather than calculating manually, use our [Spine Width Calculator](/tools/calculator). Enter your page count, paper type, and trim size — it calculates everything instantly and shows you all the dimensions you need.

---

## Common Spine Width Mistakes

**Mistake 1: Using the wrong paper type**
If you selected "white paper" when designing but upload to "cream paper" in KDP, the spine will be wrong. Always match your cover spine calculation to the paper type selected in KDP.

**Mistake 2: Counting pages wrong**
KDP counts the total number of pages in your finished PDF, including blank pages, copyright pages, and back matter. Your word processor may show a different count.

**Mistake 3: Using approximate numbers**
Use the full decimal precision in your cover design software. Rounding 0.4504" to 0.45" or even 0.450" can cause issues.
    `,
  },
  "canva-to-kdp-guide": {
    title: "Canva to KDP: The Complete Fix Guide",
    date: "February 3, 2026",
    readTime: "10 min read",
    category: "Canva",
    content: `
## The Canva-KDP Problem

Canva is the most popular graphic design tool for indie authors — it's easy to use, looks great on screen, and has thousands of book cover templates. But Canva was designed for digital use, not professional printing. When you try to upload a Canva cover to KDP, several things go wrong.

This guide covers every problem and exactly how to fix each one.

---

## Problem 1: Wrong Resolution (96 DPI vs 300 DPI)

**What Happens:** Canva's default export is 96 DPI, but KDP requires minimum 300 DPI. Your cover will look fine on screen but will appear blurry when printed.

**The Symptom:** KDP shows a "low resolution" warning, or your printed books have blurry covers.

**The Fix Options:**

Option A (Quick): Use Canva's "Print" PDF export. Under "File > Download > PDF Print", Canva exports at a higher quality setting. This doesn't give you true 300 DPI but is better than the default.

Option B (Better): Use our [Ebook Converter tool](/tools/converter) which processes your Canva export and increases the effective DPI through resampling.

Option C (Best): Use a proper print-ready export method from a design tool that supports true 300 DPI.

---

## Problem 2: Wrong Dimensions

**What Happens:** Canva's book cover templates are designed for a single front cover, not the full KDP wrap (back + spine + front). KDP requires the full cover wrap.

**The Symptom:** KDP says "Cover dimensions don't match your book specifications."

**The Fix:** You need to create a new Canva design with the correct full cover dimensions:
1. Use our [Calculator](/tools/calculator) to get your full cover dimensions
2. Create a new Canva design at those exact dimensions (in inches)
3. Place your front cover design on the right third
4. Create back cover content on the left third
5. Design the spine in the center strip

Alternatively, design your front cover, then use our [Ebook Converter](/tools/converter) to automatically add the spine and back cover.

---

## Problem 3: Missing Bleed

**What Happens:** Canva doesn't add bleed to its designs by default. KDP requires 0.125" bleed on all sides.

**The Symptom:** White edges appear on your printed book, or KDP rejects the file for insufficient bleed.

**The Fix:** When creating your Canva design:
1. Go to "File > Show print bleed" to see bleed guides
2. Ensure your background extends fully to the bleed edge (shown by the outer dotted line)
3. Keep all important text within the inner safe zone guides

---

## Problem 4: RGB vs CMYK Color Mode

**What Happens:** Canva only exports in RGB color mode. Professional printing uses CMYK. This means your colors may look different in print than on screen, especially bright blues, oranges, and greens.

**The Symptom:** Colors look washed out or different in your printed book.

**The Fix:**
- Avoid very bright, saturated colors in your Canva design
- Test your design in Canva's "Print Preview" mode
- Adjust colors to be slightly less saturated than looks good on screen
- True CMYK conversion requires a professional tool like Adobe Illustrator or InDesign

---

## Problem 5: Missing Crop Marks and Trim Lines

**What Happens:** Canva can include crop marks in PDF exports, but they're not always positioned correctly for KDP's requirements.

**The Fix:**
- In Canva, enable "Crop marks and bleed" in the PDF print export settings
- Verify the crop marks are at the correct trim line position, not at the bleed edge

---

## The Complete Canva-to-KDP Workflow

Here's the best workflow for using Canva for KDP:

**Step 1:** Calculate exact dimensions using our [Cover Calculator](/tools/calculator).

**Step 2:** Create a new Canva design at those exact dimensions. Select "Custom size" and enter dimensions in inches.

**Step 3:** Enable "Show print bleed" in Canva's View menu. Design with background extending to the bleed guides.

**Step 4:** Keep all critical content (title, author name, barcode area) within the safe zone guides.

**Step 5:** Export as "PDF Print" (not "PDF Standard") from Canva.

**Step 6:** Upload your Canva PDF to our [Ebook Converter](/tools/converter) to verify dimensions and DPI, then download a KDP-ready file.

**Step 7:** Upload to KDP.

---

## Canva Alternatives for KDP

If you're regularly publishing on KDP and Canva limitations are frustrating you:

- **Our Cover Creator** — Built specifically for KDP. Auto-calculates all dimensions, exports at correct DPI, adds bleed automatically.
- **Adobe Express** — Has better print support than Canva
- **Affinity Publisher** — Paid but excellent print support including CMYK
- **Adobe InDesign** — Industry standard, complex but very powerful

---

## Quick Canva Checklist

Before downloading from Canva for KDP:

- [ ] Design created at correct full cover dimensions (not just front cover)
- [ ] Background extends to bleed guides
- [ ] Text stays within safe zone
- [ ] No important content in barcode area (lower right of back cover)
- [ ] Exporting as "PDF Print", not "PDF Standard"
- [ ] Crop marks enabled in export settings
    `,
  },
  "kdp-cover-size-requirements": {
    title: "KDP Cover Size Requirements 2026",
    date: "February 10, 2026",
    readTime: "7 min read",
    category: "Specifications",
    content: `
## KDP Cover Technical Specifications

This guide covers every technical requirement for KDP paperback covers in 2026. Bookmark this page — it's the only reference you need.

---

## KDP Trim Sizes

KDP supports the following paperback trim sizes:

| Trim Size | Width | Height | Common Use |
|-----------|-------|--------|------------|
| 5" × 8" | 5" | 8" | Fiction, Novels |
| 5.06" × 7.81" | 5.06" | 7.81" | Pocket novels |
| 5.25" × 8" | 5.25" | 8" | Trade fiction |
| 5.5" × 8.5" | 5.5" | 8.5" | Fiction, Memoirs |
| 6" × 9" | 6" | 9" | Non-fiction, Guides |
| 7" × 10" | 7" | 10" | Textbooks, Workbooks |
| 7.5" × 9.25" | 7.5" | 9.25" | Journals, Planners |
| 8" × 10" | 8" | 10" | Coloring Books, Activity |
| 8.5" × 8.5" | 8.5" | 8.5" | Square format books |
| 8.5" × 11" | 8.5" | 11" | Coloring Books, Workbooks |

---

## Required Bleed

All KDP covers must have exactly **0.125 inches** (⅛ inch) of bleed on all four sides.

This means:
- Your cover file must be larger than your trim size
- Background colors/images must extend to the bleed edge
- The bleed area will be cut off during printing

**Full Cover Height with Bleed:**
Trim Height + 0.25" (0.125" top + 0.125" bottom)

**Full Cover Width with Bleed:**
(Trim Width × 2) + Spine Width + 0.25"

---

## Safe Zone Requirements

KDP recommends keeping all critical content at least **0.25 inches** from the trim edge.

Safe Zone rules:
- Title and author name: minimum 0.25" from all trim edges
- Spine text: minimum 0.0625" from each spine edge
- Barcode area: keep lower-right 2" × 1.2" of back cover clear

---

## DPI Requirements

- **Minimum DPI:** 300 DPI
- **Recommended:** 300 DPI
- **Maximum useful:** 600 DPI (above this is unnecessary)

DPI directly impacts print sharpness. Lower DPI = blurry print.

**Pixel calculations for common sizes at 300 DPI:**

For 6×9 with bleed:
- Width: 6.25" × 300 = 1875 pixels
- Height: 9.25" × 300 = 2775 pixels

For 8.5×11 with bleed:
- Width: 8.75" × 300 = 2625 pixels
- Height: 11.25" × 300 = 3375 pixels

---

## File Format Requirements

- **Accepted formats:** PDF only (for print covers)
- **Maximum file size:** 650 MB
- **Color mode:** RGB or CMYK (CMYK recommended for accurate print colors)
- **PDF version:** PDF 1.3 or higher

---

## Spine Width Requirements

Spine width is calculated based on page count and paper type:

| Paper Type | Formula |
|-----------|---------|
| White Paper | Pages × 0.002252" |
| Cream Paper | Pages × 0.0025" |
| Color Paper | Pages × 0.002347" |

Minimum pages for a spine: 24 pages (KDP minimum)
Minimum pages for readable spine text: ~100 pages

---

## Image Quality Guidelines

- Avoid using web images (usually 72 DPI)
- Vector graphics (SVG, EPS) can be scaled without quality loss
- JPEG compression artifacts will be visible in print — use PNG for logos and graphics
- Avoid extreme dark gradients — they may appear banded in print

---

## Quick Spec Reference Card

Copy this for your design workflow:

KDP COVER SPECIFICATIONS: Bleed 0.125 inches all sides | Safe Zone 0.25 inches from trim | DPI 300 minimum | Format PDF | Max Size 650 MB

Use our [Cover Calculator](/tools/calculator) to get exact dimensions for any trim size and page count.
    `,
  },
  "bleed-and-safe-zone-guide": {
    title: "Bleed and Safe Zone Guide for KDP",
    date: "February 18, 2026",
    readTime: "5 min read",
    category: "Basics",
    content: `
## What Is Bleed?

Bleed is extra design area that extends beyond the final trim edge of your book. It's printed and then cut off during the manufacturing process.

Think of it like this: when you paint a room, you paint slightly past the corner so there's no white gap showing. Bleed works the same way — you extend your design past where it will be cut so there's no white gap on the edges of your printed book.

**KDP requires exactly 0.125 inches (⅛ inch) of bleed on all four sides.**

---

## Why Bleed Is Necessary

Cutting isn't perfectly precise. Industrial book production cuts thousands of books at once, and the cutting blade can shift slightly between the expected position and the actual cut.

Without bleed, this slight variation means you might see a white stripe of unprinted paper on the edge of your book. With bleed, even if the cut is slightly off, the design still extends all the way to the edge.

**Without bleed:** Risk of white edges
**With bleed:** Clean, edge-to-edge design regardless of cut position

---

## What Is a Safe Zone?

The safe zone (sometimes called the "inner margin" or "live area") is the area where you should keep all critical content like titles, author names, and important imagery.

**KDP's recommended safe zone: 0.25 inches from the trim edge**

This is different from the bleed area — the safe zone is inside the trim (on the final printed book), while bleed is outside the trim.

---

## Visualizing Bleed vs Safe Zone

Imagine your book cover as three nested rectangles:

1. **Outer rectangle (bleed edge):** Your design canvas. Background extends to here.
2. **Middle rectangle (trim edge):** Where the book will actually be cut. This is your book's final size.
3. **Inner rectangle (safe zone):** Where all important content should stay.

← Bleed Edge (design canvas edge)
  0.125" bleed all around    
      ← Trim Edge (final cut line)
    0.25" safe zone        
          ← Safe Zone Edge
                         
       SAFE TO PUT       
       TEXT HERE

---

## What Goes Where

**In the bleed area (outside the trim line):**
- Background colors
- Background patterns or textures
- Decorative elements that extend to the edge

**Do NOT put in the bleed area:**
- Text
- Logos
- Important imagery

**Within the safe zone (inside the inner boundary):**
- Title
- Author name
- Subtitle
- Important imagery
- Any content you must see in the final product

**Between trim and safe zone (the 0.25" margin):**
- Avoid placing anything critical here
- Background can extend through this area
- Decorative elements with minor importance can appear here

---

## Bleed in Practice

Here's how to set up bleed in common tools:

**In our Cover Creator:** Bleed is added automatically. The editor shows bleed guides visually.

**In Canva:** Go to File > View Settings > Show Print Bleed. Your design canvas will show the bleed area. Extend backgrounds to the outer dotted line.

**In Adobe Illustrator:** Set up the artboard at trim size, then set Document Bleed to 0.125" in Document Setup.

**In Photoshop:** Create your canvas 0.25" wider and taller than your trim size (to account for bleed on all sides).

---

## Common Bleed Mistakes

**Mistake 1:** Designing only at the trim size and forgetting to add bleed.
**Fix:** Always add 0.25" to both width and height when creating your canvas.

**Mistake 2:** Adding bleed space but not extending background colors/images into it.
**Fix:** Make sure every background element reaches the very edge of your canvas.

**Mistake 3:** Placing text in the bleed area.
**Fix:** All text must be within the trim edges, preferably within the safe zone.

**Mistake 4:** Confusing bleed with margins.
**Fix:** Bleed is added to the outside of your design. Margins are inside. Both exist simultaneously.

Use our [Cover Calculator](/tools/calculator) and [Preflight Checker](/tools/preflight) to verify your cover has correct bleed setup.
    `,
  },
  "hardcover-vs-paperback": {
    title: "Hardcover vs Paperback Cover Differences",
    date: "February 25, 2026",
    readTime: "6 min read",
    category: "Formats",
    content: `
## KDP Paperback vs Hardcover Covers

KDP offers both paperback and hardcover printing for self-publishers. While the design principles are similar, the technical specifications differ in important ways.

---

## Cover Wrap: The Big Difference

The most significant difference is how the cover wraps around the book.

**Paperback:** One continuous wrap (back + spine + front) that's glued to the book.

**Hardcover:** The cover design is called a "case laminate" and covers both boards. KDP hardcover has a slightly different calculation for the cover dimensions.

---

## Spine Width Formulas

**Paperback spine width:**
- White paper: pages × 0.002252"
- Cream paper: pages × 0.0025"
- Color paper: pages × 0.002347"

**Hardcover spine width:**
- White paper: pages × 0.0025"
- Cream paper: pages × 0.0025"

Note: KDP hardcover currently only supports white and cream paper, not color.

---

## Bleed Requirements

**Paperback:** 0.125" bleed on all sides.

**Hardcover:** The bleed requirement for KDP hardcovers is larger — approximately 0.25" or more, depending on the case wrap method. Always check KDP's current hardcover cover templates for exact specifications.

---

## Safe Zones

**Paperback:** Keep critical content 0.25" from trim edges.

**Hardcover:** Keep critical content further from edges due to the wrap-around nature of case laminate covers. KDP recommends checking their hardcover template for exact safe zone guides.

---

## File Formats

Both formats accept PDF files. The same 300 DPI and maximum 650MB rules apply.

---

## Trim Size Availability

Not all trim sizes are available in hardcover format. KDP hardcover trim sizes as of 2026:
- 5" × 8"
- 5.5" × 8.5"
- 6" × 9"
- 7" × 10"
- 8.5" × 11"

Coloring book sizes (8×10, 8.5×8.5, square) may not all be available in hardcover. Check KDP's current available trim sizes when setting up your book.

---

## Design Considerations

**Paper show-through:** Hardcovers print on slightly different paper than paperbacks. Thin lines and very fine details may not reproduce as crisp.

**Spine text:** Hardcover spines behave the same as paperback — minimum ~100 pages for legible spine text.

**Barcode placement:** KDP places the barcode on the back cover for both formats. Leave the standard 2" × 1.2" clear area in the lower-right of the back cover.

---

## When to Choose Hardcover

Consider offering a hardcover edition if:
- Your book targets gift buyers
- You're publishing children's books
- Your content commands a premium price
- You're building a series and want a collectible feel

Hardcovers typically sell for 2-3× the price of paperbacks, and your royalty can be similar or higher despite the higher print cost.

---

## Using Our Tools

Currently, KDP Cover Tool is optimized for paperback covers. Our spine calculator uses paperback formulas. For hardcover calculations, use KDP's official cover template download from your KDP dashboard, which provides the exact dimensions for your specific book.

We're adding full hardcover support soon.
    `,
  },
  "ai-cover-art-for-kdp": {
    title: "AI Cover Art for KDP: What Works",
    date: "March 4, 2026",
    readTime: "9 min read",
    category: "AI & Design",
    content: `
## AI Art for Book Covers: The Reality

AI image generators have transformed what's possible for indie authors. You can now create professional-looking cover art without hiring an illustrator. But AI art has specific strengths and limitations for KDP covers.

This guide covers what actually works, what doesn't, and how to use AI art correctly.

---

## What AI Does Well for Book Covers

### Abstract and Atmospheric Backgrounds
AI excels at creating moody, atmospheric backgrounds — misty forests, dramatic skies, dark cityscapes, or abstract textures. These work perfectly as book cover backgrounds.

### Character Silhouettes
Simplified character silhouettes are generally more reliable than detailed character portraits. A lone figure on a hillside, a person walking through fog, a silhouette against a sunset — these are areas where AI is strong.

### Objects and Still Life
Single objects with dramatic lighting: a crown, a rose, a weapon, a door, a key. AI handles these very well and they make excellent thriller, romance, or fantasy cover elements.

### Abstract Genre Indicators
Genre-appropriate abstract art: swirling magic for fantasy, sleek geometric patterns for sci-fi, soft florals for romance.

---

## What AI Struggles With for Book Covers

### Text
AI-generated text is almost always incorrect. Letters will be garbled, misspelled, or distorted. Never rely on AI to generate readable text for your cover.

**Solution:** Use our Cover Creator to overlay real text onto AI-generated artwork.

### Specific People's Faces
Generating realistic, consistent human faces is difficult for current AI. Faces often look uncanny or distorted. For portrait-based covers, consider using real photographs or avoiding close-up face shots.

### Complex Scenes
Busy scenes with multiple elements tend to become incoherent. AI works better with simpler, focused compositions.

### Hands
Hands are notoriously difficult for AI image generators. Avoid close-up shots that prominently feature hands.

---

## The Recommended AI Cover Workflow

**Step 1: Generate art, not a complete cover**
Use AI to generate just the artwork — the background, the key visual. Don't try to make a complete cover with text in AI.

**Step 2: Upscale and clean up**
AI images are often generated at relatively low resolution. Use an upscaling tool to get to 300 DPI quality. Tools like Topaz Gigapixel or web-based alternatives can upscale without losing quality.

**Step 3: Import into our Cover Creator**
Upload your AI artwork as the cover image, then add your title, author name, and other text elements using our editor.

**Step 4: Run preflight**
Use our [Preflight Checker](/tools/preflight) to verify resolution and dimensions before exporting.

---

## Prompt Engineering for Book Covers

Better prompts produce better results. Key elements:

**Style keywords:** "professional book cover photography", "cinematic lighting", "dramatic", "moody"

**Composition keywords:** "centered subject", "rule of thirds", "negative space for title"

**Technical keywords:** "high resolution", "detailed", "sharp focus"

**Example prompt for thriller cover:**
"Dark city street at night, rain-wet cobblestones reflecting neon lights, a lone silhouette in a trench coat walking away, cinematic lighting, dramatic shadows, high contrast, professional photography style, suitable for book cover with space for title at top"

---

## Aspect Ratio Considerations

Most AI generators produce square or landscape images by default. Book covers are portrait orientation:
- 5×8: 0.625:1 ratio
- 6×9: 0.667:1 ratio
- 8.5×11: 0.773:1 ratio

When generating, specify portrait orientation or generate at a larger size and crop afterward.

---

## Copyright and KDP's Policies

KDP's position on AI-generated covers: they must be disclosed as AI-generated in some territories. Always check KDP's current content policies.

Practically: if you used AI to create the artwork, this should be disclosed. KDP has moved toward requiring disclosure rather than prohibition.

For commercial safety: Use AI art generators that allow commercial use. Read the terms of service for whichever tool you use.

---

## Best AI Tools for Book Cover Art

- **Midjourney:** Best quality for atmospheric and artistic styles
- **DALL-E 3:** Good for specific objects and cleaner compositions
- **Stable Diffusion:** Free, highly customizable with the right setup
- **Adobe Firefly:** Adobe's tool, explicitly trained on licensed content

Use our free [AI Cover Generator](/tools/ai-generator) to get concept descriptions that you can then use as prompts in your preferred AI image tool.
    `,
  },
  "first-time-author-cover-guide": {
    title: "First-Time KDP Author Cover Guide",
    date: "March 11, 2026",
    readTime: "12 min read",
    category: "Beginner",
    content: `
## Welcome to KDP Cover Design

If this is your first time creating a book cover for Amazon KDP, you're in the right place. This guide assumes zero prior knowledge and walks you through every step.

By the end, you'll understand what KDP requires, what tools to use, and how to create a cover that gets approved.

---

## What Is KDP?

KDP stands for Kindle Direct Publishing — Amazon's self-publishing platform. You upload your manuscript and cover, set your price, and sell through Amazon. When someone buys your book, Amazon prints and ships it. You get royalties.

---

## The Cover Files You Need

For a paperback on KDP, you need one file:
- A full cover wrap (PDF)

This single PDF includes your front cover, spine, and back cover all in one continuous image. You create this as one piece and upload it as one file.

If you're publishing a Kindle eBook as well, you need a separate cover — just the front cover as a JPEG at 2560 × 1600 pixels.

---

## Step 1: Get Your Book's Dimensions

Before designing anything, you need three things:
1. **Trim size** — the physical dimensions of your book (e.g., 6" × 9")
2. **Page count** — the total number of pages in your final manuscript
3. **Paper type** — white, cream, or color interior paper

**Where to find these:** Set up your book in your KDP account. Under "Paperback Content", you'll choose trim size and paper type. KDP will tell you your page count after you upload your manuscript.

**Important:** Don't design your cover until your page count is final. Changing page count changes spine width.

---

## Step 2: Calculate Your Cover Dimensions

Use our [Cover Calculator](/tools/calculator):
1. Enter your trim size
2. Select your paper type
3. Enter your page count
4. Get the exact spine width and full cover dimensions

Screenshot or write down these numbers:
- Full cover width (e.g., 12.7004")
- Full cover height (e.g., 9.25")
- Spine width (e.g., 0.4504")

---

## Step 3: Choose Your Design Approach

**Option A: Use a template (Easiest)**
Visit our [Templates](/tools/templates) and pick one that matches your genre. Templates are pre-sized correctly — you just replace the placeholder text and images.

**Option B: Use our Cover Creator (Best for custom covers)**
Our [Cover Creator](/dashboard/new) is built specifically for KDP. It auto-calculates dimensions, shows you the bleed guides, and exports correctly.

**Option C: Use Canva (Popular but requires workarounds)**
Canva works but requires careful setup for KDP. Read our [Canva to KDP guide](/guides/canva-to-kdp-guide) for the full process.

---

## Step 4: Design Principles for First-Timers

You don't need to be a designer to create a good book cover. Follow these principles:

**Keep it simple.** A clean design with one strong visual always beats a busy cover. Professional covers usually have: one main image, the title, and the author name.

**Typography matters.** Your title font should match your genre. Thriller covers use bold, high-contrast fonts. Romance uses elegant script. Children's books use rounded, friendly fonts.

**Use contrast.** Your title must be readable. Put light text on dark backgrounds, or dark text on light backgrounds. Add a slight shadow or outline if needed.

**Genre conventions.** Readers recognize genres by their covers. Look at the top 20 books in your genre on Amazon. Notice the patterns (dark colors for thriller, warm colors for romance, etc.) and follow them.

---

## Step 5: The Back Cover

The back cover should include:
- Book description (blurb) — 150-200 words
- Author bio — 50-100 words (optional for first book)
- Leave space for the ISBN barcode in the lower-right corner

KDP places the barcode automatically if you leave a clear 2" × 1.2" area in the lower-right of the back cover.

---

## Step 6: Exporting for KDP

From our Cover Creator: Click "Download PDF" — the file is already KDP-ready.

From Canva: Use "PDF Print" export, not "PDF Standard". Enable crop marks.

---

## Step 7: Uploading to KDP

1. Log into your KDP account
2. Go to your book's paperback content page
3. Under "Cover", click "Upload a cover you already have"
4. Upload your PDF file
5. Wait for the preview to load
6. Check the preview looks correct
7. KDP will flag any technical issues before you can proceed

---

## Common First-Timer Mistakes

**Mistake 1:** Designing at the trim size, forgetting bleed.
**Fix:** Your canvas must be 0.25" larger in each direction than your trim size.

**Mistake 2:** Wrong spine width because page count changed.
**Fix:** Lock in your page count first, then design the cover.

**Mistake 3:** Using low-resolution images found online.
**Fix:** Use only images you know are at least 300 DPI, or use vector graphics.

**Mistake 4:** Title font that's too small or low contrast.
**Fix:** Your title should be readable in a thumbnail. If you can't read it on your phone, it's too small.

**Mistake 5:** Not running the cover through KDP's preview before submitting.
**Fix:** Always check the 3D preview that KDP shows you. Look at front, spine, and back carefully.

---

## Getting Feedback Before Publishing

Before finalizing your cover:
- Post it in indie author Facebook groups for feedback
- Ask 3-5 friends who read your genre if the cover looks professional
- Compare it to the top 10 covers in your genre on Amazon
- Use our [Preflight Checker](/tools/preflight) to verify technical specs

---

## Your Cover Is Your First Marketing

A great cover doesn't guarantee sales, but a bad cover will hurt them. Readers judge books by covers — it's an unavoidable reality of publishing.

If design isn't your strength, consider:
- Our AI Cover Generator for concept ideas
- Template covers (our gallery has options for many genres)
- Hiring a professional cover designer for your first book (many charge $50-200 for indie authors)

Good luck with your first book!
    `,
  },
};

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const guide = guides[slug];
  if (!guide) return { title: "Guide Not Found" };
  return {
    title: `${guide.title} – KDP Cover Tool`,
    description: `${guide.title}. Free guide for Amazon KDP publishers.`,
  };
}

export function generateStaticParams() {
  return Object.keys(guides).map((slug) => ({ slug }));
}

export default async function GuidePage({ params }: Props) {
  const { slug } = await params;
  const guide = guides[slug];

  if (!guide) {
    notFound();
  }

  // Simple markdown-to-HTML: convert headers, bold, tables, inline code, horizontal rules, lists
  function renderContent(content: string): string {
    return content
      .split("\n")
      .map((line) => {
        if (line.startsWith("## ")) return `<h2 class="text-xl font-bold mt-10 mb-4">${line.slice(3)}</h2>`;
        if (line.startsWith("### ")) return `<h3 class="text-base font-semibold mt-6 mb-2">${line.slice(4)}</h3>`;
        if (line.startsWith("---")) return '<hr class="border-white/10 my-6" />';
        if (line.startsWith("- [x]") || line.startsWith("- [ ]")) {
          const checked = line.startsWith("- [x]");
          const text = line.slice(6);
          return `<li class="flex items-center gap-2 text-sm text-white/60 py-0.5"><span class="w-4 h-4 rounded border ${checked ? "bg-emerald-500/30 border-emerald-500/50 text-emerald-400" : "border-white/20"} flex items-center justify-center shrink-0 text-xs">${checked ? "✓" : ""}</span>${text}</li>`;
        }
        if (line.startsWith("- ")) return `<li class="text-sm text-white/60 py-0.5 pl-4 list-disc list-inside">${line.slice(2)}</li>`;
        if (line.startsWith("| ")) {
          if (line.includes("---")) return "";
          const cells = line.split("|").filter((c) => c.trim());
          const isHeader = false;
          return `<tr class="border-b border-white/[0.06]">${cells.map((c) => `<td class="px-4 py-2.5 text-sm text-white/70">${c.trim()}</td>`).join("")}</tr>`;
        }
        if (line.startsWith("")) return line === "" ? "</code></pre>" : '<pre class="rounded-xl bg-white/[0.04] border border-white/[0.08] p-4 text-sm text-white/70 overflow-x-auto my-4 font-mono"><code>';
        if (line.trim() === "") return "<br />";
        line = line.replace(/\*\*(.+?)\*\*/g, "<strong class=\"text-white/90\">$1</strong>");
        line = line.replace(/`(.+?)`/g, "<code class=\"bg-white/10 px-1.5 py-0.5 rounded text-xs text-violet-300 font-mono\">$1</code>");
        line = line.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-violet-400 hover:text-violet-300 transition-colors underline underline-offset-2">$1</a>');
        return `<p class="text-sm text-white/60 leading-relaxed">${line}</p>`;
      })
      .join("\n");
  }

  return (
    <main className="min-h-screen py-12 px-6">
      <div className="mx-auto max-w-3xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-white/40 mb-8">
          <Link href="/guides" className="hover:text-white transition-colors">Guides</Link>
          <span>/</span>
          <span className="text-white/60 truncate">{guide.title}</span>
        </div>

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs text-violet-400">
              {guide.category}
            </span>
            <span className="text-xs text-white/30">{guide.date}</span>
            <span className="text-xs text-white/30">·</span>
            <span className="text-xs text-white/30">{guide.readTime}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">{guide.title}</h1>
        </div>

        {/* Content */}
        <article
          className="prose-custom"
          dangerouslySetInnerHTML={{ __html: renderContent(guide.content) }}
        />

        {/* CTA */}
        <div className="mt-14 rounded-2xl border border-violet-500/20 bg-violet-500/5 p-8 text-center">
          <h3 className="text-lg font-semibold mb-2">Ready to Create Your Cover?</h3>
          <p className="text-white/50 text-sm mb-5">Use our free tools to apply everything you just learned.</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/dashboard/new" className="rounded-xl bg-violet-600 hover:bg-violet-500 transition-colors px-5 py-2.5 text-sm font-semibold text-white">
              Open Cover Creator
            </Link>
            <Link href="/tools/calculator" className="rounded-xl border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 transition-all px-5 py-2.5 text-sm font-semibold text-white">
              Use Calculator
            </Link>
          </div>
        </div>

        {/* More guides */}
        <div className="mt-10">
          <Link href="/guides" className="flex items-center gap-2 text-sm text-violet-400 hover:text-violet-300 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back to all guides
          </Link>
        </div>
      </div>
    </main>
  );
}
