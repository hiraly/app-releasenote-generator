import OpenAI from 'openai';

const openai = new OpenAI();

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { translationContent, baseLanguage, iOSLanguages, androidLanguages } = req.body;

    try {
      const iOSNotes = await generateIOSNotes(translationContent, baseLanguage, iOSLanguages);
      const androidNotes = await generateAndroidNotes(translationContent, baseLanguage, androidLanguages);

      res.status(200).json({ iOSReleaseNotes: iOSNotes, androidReleaseNotes: androidNotes });
    } catch (error) {
      console.error('err', error);
      res.status(500).json({ error: 'Error generating release notes' });
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

async function generateAndroidNotes(content, baseLanguage, languages) {
  const prompt = `以下のコンテンツ、ベース言語、および言語リストに基づいて、Androidのリリースノートを生成してください。

  コンテンツ:
  ${content}
  
  ベース言語: ${baseLanguage}
  言語リスト: ${languages}
  
  リリースノートを次の形式でフォーマットしてください:

  \`\`\`
    <language-code>
    [特定の言語でのリリースノートの内容]
    </language-code>
  \`\`\`
  
  <language-code> を各言語の実際の言語コードに置き換えてください。
  ベース言語から始めて、各言語のリリースノートを生成してください。`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
  });

  // 結果からフォーマットされたリリースノートを取得
  const androidNotes = completion.choices[0].message.content;
  console.log('androidNotes', androidNotes);
  // コードコメントされた箇所のみを抽出
  const extractedNotes = androidNotes.match(/<([\w-]+)>\s*([\s\S]*?)\s*<\/\1>/g);
  return extractedNotes?.join('\n') ?? '';
}
