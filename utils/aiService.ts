import { GoogleGenerativeAI } from '@google/generative-ai';

const SYSTEM_PROMPT = `You are an advanced AI assistant deeply integrated into Muhammad Al-amin's personal portfolio Admin Dashboard. 
Your primary job is to help him write professional content for his web development projects, skills, blogs, and experiences.
Muhammad Al-amin is a Digital Solutions Architect who builds highly scalable, fast, and secure web applications using modern tech stacks (React, Firebase, Node.js, etc.).
Whenever you generate text, autocomplete sentences, or write blog posts, you MUST act as his personal assistant, writing from his perspective or providing content that perfectly aligns with a high-end web developer's portfolio.
Do not act as a generic AI; you know this site is his portfolio and you are helping him populate it with the best possible professional descriptions, case studies, and privacy policies.`;

// Retrieve API key from local storage
export const getApiKey = () => {
  return localStorage.getItem('GEMINI_API_KEY') || '';
};

export const saveApiKey = (key: string) => {
  localStorage.setItem('GEMINI_API_KEY', key);
};

export const removeApiKey = () => {
  localStorage.removeItem('GEMINI_API_KEY');
};

export const generateText = async (prompt: string, context?: string): Promise<string> => {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    throw new Error('API Key is missing. Please set your Gemini API Key in the settings.');
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Fallback array of models to ensure it auto-detects the working one
    const modelsToTry = [
      "gemini-flash-lite-latest",
      "gemini-3.1-flash-lite", 
      "gemini-2.5-flash-lite",
      "gemini-flash-latest",
      "gemini-3.5-flash"
    ];
    
    let fullPrompt = `${SYSTEM_PROMPT}\n\nTask: ${prompt}`;
    if (context) {
      fullPrompt = `${SYSTEM_PROMPT}\n\nContext: ${context}\n\nTask: ${prompt}`;
    }

    let lastError = null;

    for (const modelName of modelsToTry) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        return response.text();
      } catch (e: any) {
        console.warn(`Model ${modelName} failed, trying next...`, e.message);
        lastError = e;
      }
    }

    throw new Error(lastError?.message || 'Failed to generate content with all available models.');
  } catch (error: any) {
    console.error("AI Generation Error:", error);
    throw new Error(error.message || 'Failed to generate content');
  }
};

export const getAIAutocomplete = async (currentText: string, fieldType: string): Promise<string> => {
  const prompt = `You are a professional assistant helping a user write their developer portfolio. 
The user is currently writing the "${fieldType}" field and has typed the following:

"${currentText}"

Please complete the text smoothly. Ensure your tone is professional, engaging, and suitable for a portfolio. 
If the field type is "Project Description" or "longDescription", structure your completion as a "Deep Case Study" using the following format and headings:
<h2>Problem:</h2> <p>What was the client's problem?</p>
<h2>Solution:</h2> <p>How did you solve it?</p>
<h2>Impact/Result:</h2> <p>What was the measurable outcome (e.g., speed increased by X%, sales boosted by Y%)?</p>

If the field type is "CV Professional Summary", write a powerful 3-4 sentence Executive Summary for a CV. It should highlight core skills, total years of experience, and main value proposition. Do NOT use HTML tags.

Output ONLY the completed text (what comes after the user's input), without any explanations, quotes, or formatting. If the user wrote in Bengali, complete in Bengali. If in English, complete in English. 
IMPORTANT: Maintain clean, standard spacing. Do NOT use zero-width spaces or non-breaking spaces that break word-wrapping in browsers. Ensure Bengali text flows naturally without breaking words in the middle.`;

  return generateText(prompt);
};

export const getAIBlogGeneration = async (topic: string): Promise<string> => {
  const prompt = `You are an expert tech blogger. Write a comprehensive, engaging, and professional blog post about the following topic: "${topic}".
  
Use HTML formatting (e.g. <h2>, <p>, <ul>, <li>, <strong>) because this will be inserted into a Rich Text Editor. Output ONLY the raw HTML content, without any markdown code blocks, explanations, or enclosing tags like \`\`\`html. Make it informative and easy to read.
IMPORTANT FORMATTING RULE: Ensure proper line breaks and standard spacing between words. DO NOT use zero-width spaces, non-breaking spaces randomly, or weird characters that might break word-wrapping in browsers. Ensure text flows naturally and Bengali words do not break in the middle. Use <br> or <p> tags correctly for paragraphs.`;

  return generateText(prompt);
};

export const generateFullBlogPost = async (topic: string): Promise<{title: string, seoTitle?: string, metaDescription?: string, keywords?: string, content: string, imagePrompt?: string}> => {
  const prompt = `You are a world-class tech blogger and senior software engineer. The user wants to write a complete, massive, and highly detailed blog post based on this topic or hint: "${topic}".
  
  Please generate a highly professional, engaging, human-like, and very detailed blog post. Explain concepts clearly with examples, as if you are teaching another developer. 
  
  Requirements for the content:
  1. It MUST be very detailed, covering the topic comprehensively from start to finish. Include an Introduction, multiple deep-dive sections, and a Conclusion.
  2. Use beautiful HTML formatting (<h2>, <h3>, <p>, <ul>, <li>, <strong>, <blockquote>, etc.) because this will be inserted directly into a Rich Text Editor.
  3. Include CODE SNIPPETS where relevant to explain technical concepts. Use <pre><code class="language-javascript">...</code></pre> for code blocks.
  4. LANGUAGE STRICTNESS: You MUST write the ENTIRE blog post strictly in the EXACT same language as the given topic. If the topic is in Bengali, write in pure, high-quality, and grammatically correct Bengali ONLY. DO NOT mix Hindi, Arabic, Urdu, or any weird characters. Keep it 100% authentic to the topic's language.
  5. INLINE IMAGES: You MUST include at least 2 or 3 images inside the content to make it visually appealing. For images, MUST use URLs like this: <img src="https://image.pollinations.ai/prompt/YOUR-KEYWORD-HERE-realistic-4k-tech-photography?width=800&height=400&nologo=true" alt="Descriptive alt text" style="border-radius: 12px; margin: 20px 0; max-width: 100%;" />. Replace YOUR-KEYWORD-HERE with words describing a realistic, professional tech scene (e.g., modern coding workspace). DO NOT use abstract art. DO NOT use loremflickr or unsplash.
  6. LINKS: If you refer to any external resources, official documentation, or tools, please include relevant hyperlinks using <a href="..." target="_blank" rel="noopener noreferrer">...</a> tags.
  7. FORMATTING & SPACING: Ensure proper line breaks and standard spacing between words. DO NOT use zero-width spaces, non-breaking spaces randomly, or weird characters that might break word-wrapping in browsers. Ensure text flows naturally and Bengali words do not break in the middle. Use <br> or <p> tags correctly for paragraphs.
  
  Return your response EXACTLY in the following custom format (do NOT use JSON):
  
  ---TITLE---
  A highly engaging, catchy, and professional title for the blog post
  ---SEO_TITLE---
  A highly optimized SEO title tag for this blog (under 60 characters)
  ---META_DESCRIPTION---
  An engaging meta description optimized for Google search results (120-150 characters)
  ---KEYWORDS---
  A comma-separated list of 5-8 highly relevant, long-tail focus keywords for SEO
  ---IMAGE_PROMPT---
  A highly detailed English prompt for a realistic, professional, 4k photograph representing the blog's theme. MUST be related to modern technology, software engineering, or coding. DO NOT use abstract art. IT MUST INCLUDE AN INSTRUCTION TO WRITE ENGLISH TEXT ON THE IMAGE (YouTube Thumbnail style). For example: "A realistic tech workspace with bold 3D text saying 'LARAVEL GUIDE' on a glowing screen". Use normal spaces, do NOT use hyphens.
  ---CONTENT---
  The full, massive blog post content formatted as beautiful HTML. MUST include paragraphs, lists, code blocks, hyperlinks, and at least 2-3 inline pollinations images.`;
  
  const text = await generateText(prompt);
  try {
    const titleMatch = text.match(/---TITLE---\s*([\s\S]*?)\s*---SEO_TITLE---/);
    const seoTitleMatch = text.match(/---SEO_TITLE---\s*([\s\S]*?)\s*---META_DESCRIPTION---/);
    const metaDescMatch = text.match(/---META_DESCRIPTION---\s*([\s\S]*?)\s*---KEYWORDS---/);
    const keywordsMatch = text.match(/---KEYWORDS---\s*([\s\S]*?)\s*---IMAGE_PROMPT---/);
    const imagePromptMatch = text.match(/---IMAGE_PROMPT---\s*([\s\S]*?)\s*---CONTENT---/);
    const contentMatch = text.match(/---CONTENT---\s*([\s\S]*)/);
    
    if (!titleMatch || !contentMatch || !imagePromptMatch) {
      // Fallback: if it still tried to output JSON by mistake, let's catch it
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error(`AI didn't return valid data. It said: "${text.substring(0, 100)}..."`);
    }
    
    return {
      title: titleMatch[1].trim(),
      seoTitle: seoTitleMatch ? seoTitleMatch[1].trim() : '',
      metaDescription: metaDescMatch ? metaDescMatch[1].trim() : '',
      keywords: keywordsMatch ? keywordsMatch[1].trim() : '',
      imagePrompt: imagePromptMatch[1].trim(),
      content: contentMatch[1].trim()
    };
  } catch (e: any) {
    console.error("AI Parse Error:", e, "Raw Text:", text);
    if (e.message.includes("AI didn't return valid data")) {
      throw e;
    }
    throw new Error('AI generated invalid format. Please try a different topic or click Generate again.');
  }
};

export const generateProjectFromGithub = async (repoData: string): Promise<any> => {
  const prompt = `You are a highly skilled Digital Solutions Architect and Technical Writer. 
The user wants to auto-generate a massive, highly detailed portfolio project based on the following GitHub repository data:
  
${repoData}

Please deeply analyze this repository (README, package.json, tech stack, structure) and generate all necessary fields for a premium portfolio project. 
DO NOT leave any field blank or generic. Write everything in extremely high detail, as if you are showcasing your best work.

Return your response EXACTLY in the following JSON format:
{
  "title": "A clean, professional, and catchy title for the project.",
  "description": "An engaging 3-4 line short description highlighting the main value proposition.",
  "longDescription": "A massive, highly detailed, professional blog-style description of the project. MUST be structured as a 'Deep Case Study'. Format beautifully with HTML. You MUST include these three sections with <h2> tags: <h2>Problem</h2> (What problem did this project solve?), <h2>Solution</h2> (How did you architect and solve it?), and <h2>Impact/Result</h2> (What was the measurable outcome, performance gain, or business impact?). Explain the architecture and why it's amazing.",
  "category": "One of: Frontend, Backend, Full-Stack, Mobile App, Other",
  "techStack": "A comma-separated string of ALL technologies used (e.g., 'React, TypeScript, Tailwind CSS, Node.js, MongoDB'). DO NOT use an array.",
  "features": "A comma-separated string of 5-8 key features (e.g., 'Real-time Chat, User Authentication, Stripe Integration'). DO NOT use an array.",
  "privacyPolicy": "A comprehensive Privacy Policy formatted as HTML (<h2>, <p>). Explain what data is collected, how it's used, and security measures. Make it look professional.",
  "seoTitle": "A highly optimized SEO title for this project (under 60 characters).",
  "metaDescription": "An engaging meta description optimized for Google search results (120-150 characters).",
  "keywords": "A comma-separated list of 5-8 highly relevant, long-tail focus keywords for SEO."
}
Output ONLY valid JSON starting with { and ending with }. Do not include markdown formatting like \`\`\`json.`;

  const text = await generateText(prompt);
  try {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) {
      throw new Error(`AI didn't return valid data. It said: "${text.substring(0, 100)}..."`);
    }
    return JSON.parse(match[0]);
  } catch (e: any) {
    console.error("AI JSON Parse Error (GitHub):", e, "Raw Text:", text);
    if (e.message.includes("AI didn't return valid data")) {
      throw e;
    }
    throw new Error('AI generated invalid format. Please try again.');
  }
};
