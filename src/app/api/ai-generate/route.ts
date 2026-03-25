import { NextResponse } from "next/server";

interface CoverConcept {
  title: string;
  description: string;
  palette: string[];
  typography: string;
  preset: string;
}

const GENRE_CONCEPTS: Record<string, CoverConcept[]> = {
  "Fantasy": [
    { title: "Shadow of the Ancients", description: "A dramatic full-bleed illustration of a lone figure silhouetted against a vast, glowing magical portal. Deep indigo and gold dominate the scene, with intricate rune patterns bordering the edges. The sky is split between burning amber and deep violet, suggesting an otherworldly realm.", palette: ["#1a0a3d","#ffd700","#6b21a8","#c4861a"], typography: "EB Garamond Bold, decorative caps for title", preset: "fantasy" },
    { title: "The Ember Crown", description: "Close-up of an ancient crown resting on a stone throne, surrounded by embers and ash. The composition uses deep reds and black with flickers of orange light illuminating intricate metalwork. Smoke curls form subtle dragon silhouettes in the upper corners.", palette: ["#0a0a0a","#c2410c","#7f1d1d","#fbbf24"], typography: "Cinzel Decorative, gold lettering on dark background", preset: "fantasy" },
    { title: "Whispers of the Void", description: "Ethereal cosmic landscape with a hooded mage standing at the edge of a floating island. The background is a swirling galaxy in deep purple and teal. Magical particles cascade from the character's outstretched hands, forming constellations.", palette: ["#0f172a","#7c3aed","#0891b2","#e2e8f0"], typography: "Raleway Light with heavy title weight", preset: "fantasy" },
    { title: "Forest of Forgotten Names", description: "Dense, misty forest at twilight with bioluminescent mushrooms and fireflies. A winding path leads to a glowing doorway built into an ancient oak. The colour palette is rich emerald and moonlight silver with hints of copper.", palette: ["#14532d","#c0c0c0","#b45309","#0f2e14"], typography: "Merriweather Serif, moss-green title text", preset: "fantasy" },
  ],
  "Romance": [
    { title: "A Kiss in Versailles", description: "Soft watercolour scene of two silhouettes embracing in a moonlit garden. Blush pinks and warm creams fill the palette, with rose petals scattering from the upper corners. The mood is tender and cinematic.", palette: ["#fce4ec","#f48fb1","#7b2d42","#fff8e1"], typography: "Playfair Display Italic, rose-gold shimmer effect", preset: "romance" },
    { title: "Second Chance Summer", description: "Bright, sun-drenched beach scene with two hands reaching for each other against a pastel sunset. Coral, lavender and warm gold create an optimistic, hopeful mood suggesting a road-trip romance.", palette: ["#ff7043","#e1bee7","#ffd54f","#ffffff"], typography: "Lato Semi-Bold, clean with coral accent", preset: "romance" },
    { title: "The Last Letter", description: "A single handwritten letter resting on a vintage desk bathed in warm candlelight. Sepia tones and cream whites evoke nostalgia and longing. A pressed rose lies alongside the letter, its petals echoing the muted pink title.", palette: ["#c4a882","#8b5e3c","#fdf6ec","#7b2d42"], typography: "Crimson Text Italic, sepia-toned title", preset: "romance" },
    { title: "Midnight in Manhattan", description: "New York City skyline at night reflected in rain puddles on an empty street. Two silhouettes share an umbrella under a glowing streetlamp. Deep navy, gold lights and warm amber create a cinematic city romance.", palette: ["#0f172a","#fbbf24","#1e3a5f","#f8fafc"], typography: "Oswald Regular, gold title on dark background", preset: "romance" },
  ],
  "Thriller": [
    { title: "The Last Signal", description: "Dark minimalist design: a single red telephone on a glossy black surface, its cord spelling out a cryptic number. The title is rendered in stark white uppercase, with a thin red line cutting diagonally across the cover.", palette: ["#0a0a0a","#b91c1c","#ffffff","#1a1a1a"], typography: "Oswald Bold, high contrast white on black", preset: "thriller" },
    { title: "Ghost Protocol", description: "Rain-slicked city street at 3am, a lone figure in a trench coat reflected in a puddle. The whole image desaturated to near-grey with one element — a burning car — blazing in amber. The title glows in neon-red.", palette: ["#1a1a1a","#2d2d2d","#c2410c","#6b7280"], typography: "Bebas Neue, distressed neon treatment", preset: "thriller" },
    { title: "The Missing Hour", description: "A broken wristwatch frozen at 3:17am lies on a blood-stained white sheet. Extreme close-up composition with harsh overhead lighting. Pure black and white with a single drop of crimson red as the only colour.", palette: ["#000000","#ffffff","#dc2626","#1f2937"], typography: "Courier New Bold, typewriter-style title", preset: "thriller" },
    { title: "Zero Trace", description: "Aerial view of a foggy forest with a single flashlight beam cutting through the darkness below. The viewer's perspective creates a sense of being watched. Cold blue-green tones suggest danger and isolation.", palette: ["#0c1a2e","#1e4d6b","#94a3b8","#e2e8f0"], typography: "Montserrat ExtraBold, all-caps stamped style", preset: "thriller" },
  ],
  "Coloring Book": [
    { title: "Zen Mandala Garden", description: "Clean white background with a detailed mandala line illustration centred on the cover. Thin black ink lines of intricate geometric and floral patterns with plenty of white space. A decorative frame of smaller patterns borders the title area.", palette: ["#ffffff","#2d2d2d","#f9f9f9","#e5e5e5"], typography: "Crimson Text Regular, black title below mandala", preset: "coloring" },
    { title: "Botanical Bliss", description: "Delicate hand-drawn botanical illustrations arranged symmetrically: ferns, roses, and wildflowers forming a wreath. Black outlines on white, with the title woven into the top of the botanical wreath using a flowing script.", palette: ["#ffffff","#1a1a1a","#f5f5f5","#fafafa"], typography: "EB Garamond Italic, title integrated into illustration", preset: "coloring" },
    { title: "Ocean Dreams", description: "Intricate underwater scene filled with detailed coral, fish, and sea creatures rendered in precise line art. White background allows full colouring freedom. The title appears in a decorative ocean wave arch at the top.", palette: ["#ffffff","#111827","#f8fafc","#e2e8f0"], typography: "Raleway Regular, clean sans-serif title", preset: "coloring" },
    { title: "Sacred Geometry", description: "Complex overlapping geometric shapes forming a harmonious composition. Precise line art with detailed interior patterns for colouring. Triangles, circles, and hexagons interlock to create a meditative, structured design.", palette: ["#ffffff","#0f172a","#f1f5f9","#e2e8f0"], typography: "Montserrat Light, minimal modern title", preset: "coloring" },
  ],
  "Non-Fiction": [
    { title: "The Clarity Method", description: "Clean, professional layout with bold typography dominating the cover. A single abstract geometric shape in gold on a white background conveys authority. Generous white space and a subtle grid pattern reinforce the structured, methodical theme.", palette: ["#ffffff","#1a1a1a","#b45309","#f5f5f5"], typography: "Montserrat ExtraBold, black on white with gold accent", preset: "nonfiction" },
    { title: "Deep Work Mastery", description: "Minimalist design featuring a solitary desk lamp illuminating a focused workspace. Muted grey tones with a single warm accent colour. The composition communicates focus, discipline and productivity.", palette: ["#f5f5f5","#1a1a1a","#d97706","#6b7280"], typography: "Source Sans Pro SemiBold, clean editorial layout", preset: "nonfiction" },
    { title: "Atomic Habits Decoded", description: "Infographic-style cover showing small building blocks stacking into a larger structure. Each block is a slightly different shade of the same colour family. Clean sans-serif typography. The visual metaphor of incremental growth is immediately clear.", palette: ["#1e40af","#3b82f6","#93c5fd","#f8fafc"], typography: "Lato Bold, blue gradient system with white title", preset: "nonfiction" },
  ],
  "Children's": [
    { title: "The Brave Little Cloud", description: "Bright, cheerful illustration of a cartoon cloud character with a smile floating over a colourful town. Bold primary colours and thick outlines create a friendly, accessible look. The sky is a vivid turquoise with fluffy white friends.", palette: ["#60a5fa","#ffffff","#fbbf24","#34d399"], typography: "Raleway ExtraBold, rounded bubbly letters", preset: "childrens" },
    { title: "Pip and the Magic Garden", description: "Lush garden scene with oversized flowers and a tiny girl with red wellies exploring among them. Watercolour textures in warm greens, pinks and yellows create a dreamy, magical atmosphere.", palette: ["#86efac","#f9a8d4","#fde68a","#fff7ed"], typography: "Playfair Display Bold, storybook hand-lettered style", preset: "childrens" },
    { title: "Monster Under My Bed", description: "Friendly purple monster peeking out from under a bed with a big goofy smile, clearly harmless. The bedroom setting is cosy and warm with night-light glow. Inverts the scary trope into something silly and sweet.", palette: ["#7c3aed","#fbbf24","#1e1b4b","#f0fdf4"], typography: "Bebas Neue rounded variant, large playful title", preset: "childrens" },
  ],
};

function getConceptsForGenre(genre: string, style: string, prompt: string): CoverConcept[] {
  const base = GENRE_CONCEPTS[genre] || GENRE_CONCEPTS["Fantasy"];
  return base.map(c => ({
    ...c,
    description: style !== "Illustrated"
      ? c.description.replace(/illustration/gi, style.toLowerCase())
      : c.description,
    title: prompt ? `${c.title}` : c.title,
  })).slice(0, 4);
}

export async function POST(request: Request) {
  try {
    const { genre, style, prompt } = await request.json();

    const anthropicKey = process.env.ANTHROPIC_API_KEY;

    if (anthropicKey) {
      try {
        const { Anthropic } = await import("@anthropic-ai/sdk");
        const client = new Anthropic({ apiKey: anthropicKey });

        const message = await client.messages.create({
          model: "claude-opus-4-5",
          max_tokens: 1024,
          messages: [{
            role: "user",
            content: `Generate 4 distinct book cover concepts for a ${genre} book with a ${style} visual style.
${prompt ? `Book description: ${prompt}` : ""}

For each concept, provide:
1. A compelling book title
2. A detailed visual description of the cover (2-3 sentences)
3. A color palette (4 hex colors)
4. Typography recommendation
5. A preset ID (one of: thriller, romance, fantasy, childrens, nonfiction, coloring)

Respond ONLY with valid JSON in this exact format:
{
  "concepts": [
    {
      "title": "Book Title",
      "description": "Visual description...",
      "palette": ["#hex1","#hex2","#hex3","#hex4"],
      "typography": "Font recommendation",
      "preset": "preset-id"
    }
  ]
}`,
          }],
        });

        const content = message.content[0];
        if (content.type === "text") {
          const jsonMatch = content.text.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            return NextResponse.json(parsed);
          }
        }
      } catch (aiError) {
        console.warn("AI generation failed, using fallback:", aiError);
      }
    }

    // Fallback: return curated concepts
    const concepts = getConceptsForGenre(genre, style, prompt);
    return NextResponse.json({ concepts });

  } catch (error) {
    console.error("AI generate error:", error);
    return NextResponse.json({ error: "Failed to generate concepts" }, { status: 500 });
  }
}
