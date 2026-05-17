import { NextResponse } from 'next/server';

type AnalyzeSparkRequest = {
  title?: string;
  kind?: string;
  notes?: string;
  branchName?: string;
  attachments?: Array<{ fileName?: string; mimeType?: string; attachmentType?: string; size?: number }>;
  existingPathways?: Array<{ title?: string; outputType?: string }>;
  existingNextMove?: string;
};

const FALLBACK_RESPONSE = {
  summary: 'This Spark has usable creative signal but needs pathway focus before build mode.',
  suggestedKind: 'concept seed',
  suggestedBranchName: 'Core Creative',
  suggestedStage: 'Ember',
  suggestedValueTags: ['portfolio', 'audience', 'system'],
  suggestedPathways: [
    {
      title: 'Publish a concise behind-the-scenes post',
      outputType: 'social post',
      reason: 'Fast release lane that tests resonance with low production overhead.',
      suggestedNextMove: 'Draft a 120-word post and select one attachment preview image.',
    },
    {
      title: 'Turn the spark into a small productized asset',
      outputType: 'digital product',
      reason: 'Creates reusable IP and potential monetization from existing material.',
      suggestedNextMove: 'Outline a one-page deliverable spec with scope, format, and price.',
    },
  ],
  suggestedNextMove: 'Choose one pathway and complete a single 20-minute draft sprint.',
  confidenceNotes:
    'Fallback mock used because OPENAI_API_KEY is missing. Suggestions are editable and should be treated as hypotheses, not facts.',
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as AnalyzeSparkRequest;

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ ...FALLBACK_RESPONSE, usedFallback: true });
    }

    const prompt = `
You are assisting inside Creative Momentum OS.
Interpret a Spark and return only strict JSON for possible-form assistance.
Rules:
- Do not invent fake certainty.
- Keep user in control; suggestions are editable and optional.
- Avoid generic productivity advice.
- Suggest practical possible forms for a solo creative operator.
- Pathways = possible outputs the Spark could become.
- Current Action = one concrete physical action.

Return this exact JSON shape:
{
  "summary": "short human-readable interpretation",
  "suggestedKind": "string",
  "suggestedBranchName": "string",
  "suggestedStage": "Spark | Ember | Fire | Blaze",
  "suggestedValueTags": ["money", "audience", "portfolio", "skill", "story/ip", "system"],
  "suggestedPathways": [
    {
      "title": "string",
      "outputType": "string",
      "reason": "string",
      "suggestedNextMove": "string"
    }
  ],
  "suggestedNextMove": "string",
  "confidenceNotes": "string"
}

Spark Input:
${JSON.stringify(body, null, 2)}
`;

    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        input: prompt,
      }),
    });

    if (!response.ok) {
      return NextResponse.json(
        { ...FALLBACK_RESPONSE, usedFallback: true, confidenceNotes: 'AI request failed; fallback mock response returned.' },
        { status: 200 },
      );
    }

    const data = (await response.json()) as { output_text?: string };
    const raw = data.output_text ?? '';
    const parsed = JSON.parse(raw);
    return NextResponse.json({ ...parsed, usedFallback: false });
  } catch {
    return NextResponse.json(
      { ...FALLBACK_RESPONSE, usedFallback: true, confidenceNotes: 'Analysis parsing failed; fallback mock response returned.' },
      { status: 200 },
    );
  }
}
