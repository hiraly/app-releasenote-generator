import OpenAI from 'openai';

const openai = new OpenAI();

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { translationContent, baseLanguage, iOSLanguages } = req.body;

    try {
      const iOSNotes = await generateIOSNotes(translationContent, baseLanguage, iOSLanguages);
      res.status(200).json({ iOSReleaseNotes: iOSNotes });
    } catch (error) {
      console.error('iOS generation error:', error);
      res.status(500).json({ error: 'Error generating iOS release notes' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

async function generateIOSNotes(content, baseLanguage, languages) {
  const prompt = `以下のコンテンツ、ベース言語、および言語リストに基づいて、iOSのリリースノートを生成してください。

  コンテンツ:
  ${content}
  
  ベース言語: ${baseLanguage}
  言語リスト: ${languages}
  
  リリースノートを次の形式でフォーマットしてください:

  \`\`\`json
  {
    "language-code": "リリースノートの内容",
    ...
  }
  \`\`\`

  "language-code" を各言語の実際の言語コードに置き換えてください。
  ベース言語から始めて、各言語のリリースノートを生成してください。`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
  });

  const iOSNotes = completion.choices[0].message.content;

  // Extract JSON content from markdown code blocks
  let extractedNotes = {};
  try {
    // Remove the markdown code block delimiters and extract the JSON content
    const jsonContent = iOSNotes.replace(/```json\s*([\s\S]*?)\s*```/g, '$1');
    extractedNotes = JSON.parse(jsonContent);
  } catch (error) {
    console.error('Error parsing iOS notes:', error);
    extractedNotes = {};
  }

  return extractedNotes;
}
