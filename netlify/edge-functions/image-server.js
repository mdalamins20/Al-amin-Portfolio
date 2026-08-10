export default async (request, context) => {
  const url = new URL(request.url);
  const match = url.pathname.match(/^\/api\/og-image\/(blogs|projects)\/([^/]+)$/);
  
  if (!match) return context.next();
  
  const collection = match[1];
  const docId = match[2];
  
  const projectId = Netlify.env.get("VITE_FIREBASE_PROJECT_ID") || "alaminportfolio-24fab";
  const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collection}/${docId}`;
  
  try {
    const fbRes = await fetch(firestoreUrl);
    if (fbRes.ok) {
      const data = await fbRes.json();
      let image = "";
      if (collection === "blogs") {
        image = data.fields?.image?.stringValue || data.fields?.coverImage?.stringValue || "";
      } else {
        image = data.fields?.projectImage?.stringValue || data.fields?.image?.stringValue || "";
      }
      
      if (image.startsWith('data:image/')) {
        // Extract base64 and mime type
        const matches = image.match(/^data:(image\/[a-zA-Z0-9]+);base64,(.+)$/);
        if (matches) {
          const mimeType = matches[1];
          const base64Data = matches[2];
          
          // Decode base64 to Uint8Array
          const binaryString = atob(base64Data);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          
          return new Response(bytes, {
            headers: {
              "Content-Type": mimeType,
              "Cache-Control": "public, max-age=31536000, immutable"
            }
          });
        }
      } else if (image.startsWith('http')) {
        // If it's already a URL, just redirect to it
        return Response.redirect(image, 302);
      }
    }
  } catch (error) {
    console.error("Error serving image:", error);
  }
  
  return new Response("Not found", { status: 404 });
};
