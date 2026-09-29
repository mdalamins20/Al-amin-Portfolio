import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

dotenv.config();

// Initialize Firebase Admin (We will add the credentials later via env variable)
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    initializeApp({
      credential: cert(serviceAccount)
    });
    console.log("Firebase Admin initialized successfully.");
  } catch (error) {
    console.error("Error initializing Firebase Admin:", error);
  }
} else {
  console.warn("FIREBASE_SERVICE_ACCOUNT environment variable is missing.");
}

const db = getApps().length > 0 ? getFirestore() : null;

const app = express();
app.use(cors());
app.use(express.json());

// Security: Using a Secret Path (Capability URL) instead of Auth Headers
// Since Gemini Web UI doesn't support custom headers, we make the URL itself the secret.
const SECRET_PATH = process.env.MCP_API_KEY || "my-super-secret-key-123";


import { randomUUID } from "crypto";
const transports = new Map();

function setupServer() {
  const mcpServer = new Server({
    name: "Alamin-Portfolio-MCP",
    version: "1.0.0"
  }, {
    capabilities: {
      tools: {}
    }
  });

  mcpServer.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: "get_portfolio_stats",
          description: "Get basic statistics of the portfolio (e.g. number of blogs, projects).",
          inputSchema: { type: "object", properties: {}, required: [] }
        },
        {
          name: "firestore_read_collection",
          description: "Read documents from a specific Firestore collection. Useful for Projects, Blogs, Skills, etc.",
          inputSchema: {
            type: "object",
            properties: {
              collectionPath: { type: "string", description: "The path of the collection (e.g., 'projects', 'blogs')" },
              limitTo: { type: "number", description: "Limit the number of results" }
            },
            required: ["collectionPath"]
          }
        },
        {
          name: "firestore_read_document",
          description: "Read a specific document from Firestore.",
          inputSchema: {
            type: "object",
            properties: {
              documentPath: { type: "string", description: "The path of the document (e.g., 'profile/main', 'projects/id')" }
            },
            required: ["documentPath"]
          }
        },
        {
          name: "firestore_create_document",
          description: "Create or overwrite a document in Firestore.",
          inputSchema: {
            type: "object",
            properties: {
              documentPath: { type: "string", description: "The path where the document should be created (e.g., 'blogs/new-blog-id')" },
              data: { type: "object", description: "The JSON data to write" }
            },
            required: ["documentPath", "data"]
          }
        },
        {
          name: "firestore_update_document",
          description: "Update specific fields of an existing document in Firestore.",
          inputSchema: {
            type: "object",
            properties: {
              documentPath: { type: "string" },
              data: { type: "object", description: "The fields to update" }
            },
            required: ["documentPath", "data"]
          }
        },
        {
          name: "firestore_delete_document",
          description: "Delete a document from Firestore.",
          inputSchema: {
            type: "object",
            properties: {
              documentPath: { type: "string" }
            },
            required: ["documentPath"]
          }
        }
      ]
    };
  });

  mcpServer.setRequestHandler(CallToolRequestSchema, async (request) => {
    if (!db) {
      return { content: [{ type: "text", text: "Database not connected. Check service account." }] };
    }

    try {
      if (request.params.name === "get_portfolio_stats") {
        const blogsSnap = await db.collection("blogs").count().get();
        const projectsSnap = await db.collection("projects").count().get();
        return {
          content: [{ type: "text", text: `Your portfolio currently has ${blogsSnap.data().count} blogs and ${projectsSnap.data().count} projects.` }]
        };
      }
      
      if (request.params.name === "firestore_read_collection") {
        const { collectionPath, limitTo } = request.params.arguments;
        let query = db.collection(collectionPath);
        if (limitTo) query = query.limit(limitTo);
        const snapshot = await query.get();
        const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return { content: [{ type: "text", text: JSON.stringify(docs, null, 2) }] };
      }

      if (request.params.name === "firestore_read_document") {
        const { documentPath } = request.params.arguments;
        const docSnap = await db.doc(documentPath).get();
        if (!docSnap.exists) {
          return { content: [{ type: "text", text: `Document ${documentPath} does not exist.` }] };
        }
        return { content: [{ type: "text", text: JSON.stringify({ id: docSnap.id, ...docSnap.data() }, null, 2) }] };
      }

      if (request.params.name === "firestore_create_document") {
        const { documentPath, data } = request.params.arguments;
        await db.doc(documentPath).set(data);
        return { content: [{ type: "text", text: `Document ${documentPath} successfully created/overwritten.` }] };
      }

      if (request.params.name === "firestore_update_document") {
        const { documentPath, data } = request.params.arguments;
        await db.doc(documentPath).update(data);
        return { content: [{ type: "text", text: `Document ${documentPath} successfully updated.` }] };
      }

      if (request.params.name === "firestore_delete_document") {
        const { documentPath } = request.params.arguments;
        await db.doc(documentPath).delete();
        return { content: [{ type: "text", text: `Document ${documentPath} successfully deleted.` }] };
      }

      throw new Error(`Unknown tool: ${request.params.name}`);
    } catch (err) {
      return { content: [{ type: "text", text: `Error executing tool ${request.params.name}: ${err.message}` }] };
    }
  });

  return mcpServer;
}

// SSE Transport for MCP
app.get(`/mcp/${SECRET_PATH}`, async (req, res) => {
  const sessionId = randomUUID();
  const host = req.headers.host || "alamin-q03k.onrender.com";
  const protocol = req.headers['x-forwarded-proto'] || req.protocol || "https";
  const endpointUrl = `${protocol}://${host}/message/${SECRET_PATH}?sessionId=${sessionId}`;
  
  const transport = new SSEServerTransport(endpointUrl, res);
  transports.set(sessionId, transport);
  
  const mcpServer = setupServer();
  await mcpServer.connect(transport);
  
  req.on('close', () => {
    transports.delete(sessionId);
    mcpServer.close();
  });
});

app.post(`/message/${SECRET_PATH}`, async (req, res) => {
  const sessionId = req.query.sessionId;
  const transport = transports.get(sessionId);
  if (transport) {
    await transport.handlePostMessage(req, res);
  } else {
    res.status(503).json({ error: "SSE Transport not initialized or expired. Connect to /mcp first." });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`MCP Server is running on port ${PORT}`);
  console.log(`Secret Path is enabled for security.`);
});
