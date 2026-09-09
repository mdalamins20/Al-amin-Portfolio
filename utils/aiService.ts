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
      "gemini-3.1-flash-lite",
      "gemini-3.5-flash-lite",
      "gemini-flash-lite-latest",
      "gemini-3-flash-preview",
      "gemini-3.6-flash",
      "gemini-flash-latest"
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

export const getAIAutocomplete = async (currentText: string, fieldType: string, context?: string): Promise<string> => {
  const prompt = `You are a professional assistant helping a user write their developer portfolio. 
The user is currently writing the "${fieldType}" field and has typed the following:

"${currentText}"

${context ? `Here is some context about what they are writing about: ${context}` : ''}

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

export const generateFullBlogPost = async (topic: string): Promise<{title: string, seoTitle?: string, metaDescription?: string, keywords?: string, content: string}> => {
  const prompt = `You are a world-class, highly experienced human tech blogger and senior software engineer. 
  The user wants to write a complete, massive, and highly detailed blog post based on this topic or hint: "${topic}".
  
  Please unlock your full potential and generate a highly professional, deeply engaging, and very detailed blog post. Think like a human expert writing for real people, not an AI. Explain concepts clearly with real-world context, as if you are sharing your personal expertise and teaching another developer.
  
  Requirements for the content:
  1. It MUST be very detailed, covering the topic comprehensively from start to finish. Include an Introduction, multiple deep-dive sections, and a Conclusion.
  2. Use beautiful HTML formatting (<h2>, <h3>, <p>, <ul>, <li>, <strong>, <blockquote>, etc.) because this will be inserted directly into a Rich Text Editor.
  3. CODE CONTEXTUALITY: You MUST analyze the "Topic" first. If the topic is highly technical (like React, Next.js, Node.js, Python, CSS), provide highly relevant CODE SNIPPETS using <pre><code class="language-javascript">...</code></pre>. IF the topic is non-technical (like SEO, Marketing, Soft Skills, Career Advice), DO NOT write any code snippets. Understand the context and act accordingly!
  4. LANGUAGE STRICTNESS: You MUST write the ENTIRE blog post strictly in the EXACT same language as the given topic. If the topic is in Bengali, write in pure, high-quality, and grammatically correct Bengali ONLY. DO NOT mix Hindi, Arabic, Urdu, or any weird characters. Keep it 100% authentic to the topic's language.
  5. NO IMAGES: DO NOT include any inline images (<img> tags) or markdown images in the content. The user will upload their own custom 16:9 images. Focus entirely on delivering premium text content.
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
  ---CONTENT---
  The full, massive blog post content formatted as beautiful HTML. MUST include paragraphs, lists, contextual code blocks (only if needed), and hyperlinks. No images!`;
  
  const text = await generateText(prompt);
  try {
    const titleMatch = text.match(/---TITLE---\s*([\s\S]*?)\s*---SEO_TITLE---/);
    const seoTitleMatch = text.match(/---SEO_TITLE---\s*([\s\S]*?)\s*---META_DESCRIPTION---/);
    const metaDescMatch = text.match(/---META_DESCRIPTION---\s*([\s\S]*?)\s*---KEYWORDS---/);
    const keywordsMatch = text.match(/---KEYWORDS---\s*([\s\S]*?)\s*---CONTENT---/);
    const contentMatch = text.match(/---CONTENT---\s*([\s\S]*)/);
    
    if (!titleMatch || !contentMatch) {
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
  const prompt = `You are the lead developer and author of this project. You are writing your own personal portfolio project summary.
Generate a short and professional project summary based ONLY on the following GitHub repository data (which includes the full recursive file tree and commits):
  
${repoData}

STRICT RULES:
1. FIRST-PERSON PERSONA (CRITICAL): You MUST write from a first-person perspective ("I built", "I implemented", "I used"). NEVER write from a third-person perspective.
2. NO HALLUCINATION: Analyze the recursive file list and README carefully. Extract the real features and technologies. DO NOT invent or assume any technologies.
3. TONE & STYLE: The tone must be extremely professional, authoritative, and engaging.
4. LANGUAGE MIX (BENGALI + ENGLISH): You MUST write the description in a professional Bengali-English mix (Banglish style for tech terms). The main sentences should be in Bengali (Bangla script), but ALL technical words, frameworks, architectures, and professional terms MUST be kept in English.
5. Heavily optimize for SEO with perfect tags and keywords.

Return your response EXACTLY in the following plain text format, separating each section with the exact markers shown below. Do NOT use JSON.

---TITLE---
A very short, clean, and catchy main title for the project in English (ONLY the exact name of the app/project, max 3-4 words). DO NOT include any long descriptions, taglines, or colons.
---DESCRIPTION---
An engaging 3-4 line short description in professional Bengali-English mix highlighting the exact value proposition based on the repo.
---TECH_STACK---
A comma-separated string of ALL technologies accurately extracted from the package.json and README (e.g., 'React, TypeScript, Tailwind CSS').
---SEO_TITLE---
A highly optimized SEO title for this project (under 60 characters, English).
---META_DESCRIPTION---
An engaging meta description optimized for Google search results (120-150 characters, English).
---KEYWORDS---
A comma-separated list of 5-8 highly relevant, exact-match focus keywords based on the repo's tech stack and purpose.`;

  const text = await generateText(prompt);
  console.log("=== RUNNING NEW PLAIN TEXT PROMPT V4 ===");
  try {
    // Strip bold markers, hashes, and code blocks
    let cleanText = text.replace(/```(markdown|text|html)?\n/ig, '').replace(/```/g, '');
    cleanText = cleanText.replace(/\*\*---/g, '---').replace(/---\*\*/g, '---').replace(/## ---/g, '---');
    // Normalize spaces around markers: "--- LONG DESCRIPTION ---" -> "---LONG_DESCRIPTION---"
    cleanText = cleanText.replace(/---\s*([A-Z_\s]+?)\s*---/g, (match, p1) => `---${p1.trim().replace(/\s+/g, '_')}---`);
    
    // Create a dictionary of extracted sections
    const parsed: Record<string, string> = {};
    const parts = cleanText.split(/---([A-Z_]+)---/);
    for (let i = 1; i < parts.length; i += 2) {
      const key = parts[i];
      const value = parts[i+1] ? parts[i+1].trim() : "";
      parsed[key] = value;
    }

    const title = parsed['TITLE'] || "";
    const description = parsed['DESCRIPTION'] || "";
    const techStack = parsed['TECH_STACK'] || "";
    const seoTitle = parsed['SEO_TITLE'] || "";
    const metaDescription = parsed['META_DESCRIPTION'] || "";
    const keywords = parsed['KEYWORDS'] || "";

    if (!title || !description) {
      console.error("FAILED TEXT:", text);
      throw new Error(`AI didn't return all required sections. Please check browser console for Raw Text.`);
    }

    return {
      title,
      description,
      techStack,
      seoTitle,
      metaDescription,
      keywords
    };
  } catch (e: any) {
    console.error("AI Parse Error (GitHub plain text):", e, "Raw Text:", text);
    throw e; // Throw exact error so it shows in popup
  }
};
