import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get('image') as File;

    if (!imageFile) {
      return NextResponse.json(
        { success: false, message: 'No image provided' },
        { status: 400 }
      );
    }

    // Convert image to base64
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString('base64');
    const mimeType = imageFile.type || 'image/jpeg';

    // Initialize ZAI
    const zai = await ZAI.create();

    const prompt = `Analyze this academic screenshot and extract structured data. 

If this is a class schedule/timetable, extract:
- Course names
- Times
- Locations
- Instructors
- Days

If this is a transcript or grade report, extract:
- Course names
- Credits
- Scores/Grades
- GPA information
- Semester information

If this is a credit summary, extract:
- Total credits
- Required credits
- Credit breakdown by category

Return the data as a JSON object with the following structure:
{
  "type": "schedule" | "transcript" | "credits" | "other",
  "data": {
    // Extracted data based on type
  }
}`;

    const response = await zai.chat.completions.createVision({
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: prompt,
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`,
              },
            },
          ],
        },
      ],
      thinking: { type: 'disabled' },
    });

    const content = response.choices[0]?.message?.content;

    // Try to parse as JSON, fallback to raw content
    let result;
    try {
      // Extract JSON from the response if it's wrapped in markdown code blocks
      const jsonMatch = content?.match(/```json\n?([\s\S]*?)\n?```/) || 
                        content?.match(/```\n?([\s\S]*?)\n?```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : content;
      result = JSON.parse(jsonStr || '{}');
    } catch {
      result = {
        type: 'other',
        data: { rawContent: content },
      };
    }

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error('Screenshot recognition error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to analyze screenshot' },
      { status: 500 }
    );
  }
}
