import EventSource from "eventsource";

const url = "https://alamin-q03k.onrender.com/mcp/sk-alamin-mcp-alpha-2026";
const es = new EventSource(url);

es.onopen = () => {
    console.log("Connected to SSE");
};

es.onmessage = (event) => {
    console.log("Message:", event.data);
};

es.onerror = (err) => {
    console.error("Error:", err);
};

es.addEventListener("endpoint", (event) => {
    console.log("Endpoint received:", event.data);
});
