export default async (request, context) => {
  const url = new URL(request.url);
  const path = url.pathname;
  
  // Only intercept /blog/:id and /project/:id
  const blogMatch = path.match(/^\/blog\/([^/]+)$/);
  const projectMatch = path.match(/^\/project\/([^/]+)$/);

  if (!blogMatch && !projectMatch) {
    return context.next();
  }

  const projectId = Netlify.env.get("VITE_FIREBASE_PROJECT_ID") || "alaminportfolio-24fab";
  
  let collection = "";
  let docId = "";

  if (blogMatch) {
    collection = "blogs";
    docId = blogMatch[1];
  } else if (projectMatch) {
    collection = "projects";
    docId = projectMatch[1];
  }

  // Fetch the page first
  const response = await context.next();
  // Ensure we are only modifying HTML
  const contentType = response.headers.get("content-type");
  if (!contentType || !contentType.includes("text/html")) {
    return response;
  }

  let html = await response.text();

  try {
    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collection}/${docId}`;
    const fbRes = await fetch(firestoreUrl);
    
    if (fbRes.ok) {
      const data = await fbRes.json();
      
      let title = "";
      let description = "";
      let image = "";

      if (collection === "blogs") {
        title = data.fields?.seoTitle?.stringValue || data.fields?.title?.stringValue || "";
        description = data.fields?.metaDescription?.stringValue || data.fields?.content?.stringValue?.substring(0, 150) || "";
        image = data.fields?.coverImage?.stringValue || "";
      } else if (collection === "projects") {
        title = data.fields?.title?.stringValue || "";
        description = data.fields?.description?.stringValue || "";
        image = data.fields?.projectImage?.stringValue || data.fields?.image?.stringValue || "";
      }
      
      // Clean description
      description = description.replace(/<[^>]*>?/gm, '').replace(/\n/g, ' ').substring(0, 160).trim();

      // Basic HTML replacement
      if (title) {
        // Replace existing <title>
        html = html.replace(/<title>.*?<\/title>/i, `<title>${title}</title>`);
        // Remove existing og:title
        html = html.replace(/<meta property="og:title"[^>]*>/gi, '');
        // Inject new og:title
        html = html.replace('</head>', `<meta property="og:title" content="${title}">\n</head>`);
      }
      
      if (description) {
        html = html.replace(/<meta name="description"[^>]*>/gi, '');
        html = html.replace(/<meta property="og:description"[^>]*>/gi, '');
        html = html.replace('</head>', `<meta name="description" content="${description}">\n<meta property="og:description" content="${description}">\n</head>`);
      }
      
      if (image) {
        html = html.replace(/<meta property="og:image"[^>]*>/gi, '');
        html = html.replace('</head>', `<meta property="og:image" content="${image}">\n<meta property="twitter:image" content="${image}">\n<meta property="twitter:card" content="summary_large_image">\n</head>`);
      }
      
      // Change standard meta url to actual url
      html = html.replace(/<meta property="og:url"[^>]*>/gi, '');
      html = html.replace('</head>', `<meta property="og:url" content="${url.href}">\n</head>`);
    }
  } catch (error) {
    console.error("Error fetching OG tags:", error);
  }

  return new Response(html, {
    headers: response.headers,
  });
};
