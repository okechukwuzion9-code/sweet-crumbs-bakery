
const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, "data");
const DB_FILE = path.join(DATA_DIR, "messages.json");

fs.mkdirSync(DATA_DIR, { recursive: true });

if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, "[]");
}

function json(res, status, data) {
    res.writeHead(status, {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store"
    });
    res.end(JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {
    const url = new URL(
        req.url,
        `http://${req.headers.host || "localhost"}`
    );

    if (req.method === "GET" && url.pathname === "/api/health") {
        return json(res, 200, { status: "Backend is running!" });
    }

    if (req.method === "POST" && url.pathname === "/api/contact") {
        try {
            if (!req.headers["content-type"]?.includes("application/json")) {
                return json(res, 415, { error: "JSON is required." });
            }

            let body = "";
            for await (const chunk of req) {
                body += chunk;
                if (Buffer.byteLength(body) > 10000) {
                    return json(res, 413, { error: "Request too large." });
                }
            }

            const input = JSON.parse(body);
            const name = typeof input.name === "string"
                ? input.name.trim() : "";
            const email = typeof input.email === "string"
                ? input.email.trim() : "";
            const message = typeof input.message === "string"
                ? input.message.trim() : "";

            if (name.length < 2 || name.length > 100) {
                return json(res, 400, { error: "Enter a valid name." });
            }

            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                return json(res, 400, { error: "Enter a valid email." });
            }

            if (message.length < 10 || message.length > 300) {
                return json(res, 400, {
                    error: "Message must be 10–300 characters."
                });
            }

            const messages = JSON.parse(
                fs.readFileSync(DB_FILE, "utf8")
            );

            messages.push({
                id: crypto.randomUUID(),
                name,
                email,
                message,
                createdAt: new Date().toISOString()
            });

            fs.writeFileSync(DB_FILE, JSON.stringify(messages, null, 2));

            return json(res, 201, {
                success: true,
                message: "Message saved successfully!"
            });
        } catch (error) {
            console.error(error);
            return json(res, 500, {
                error: "Unable to save the message."
            });
        }
    }

    if (req.method !== "GET") {
        return json(res, 405, { error: "Method not allowed." });
    }

    const requested = url.pathname === "/"
        ? "index.html" : url.pathname.slice(1);

    const file = path.resolve(ROOT, requested);

    if (!file.startsWith(ROOT + path.sep) ||
        file.startsWith(DATA_DIR + path.sep)) {
        return json(res, 404, { error: "Not found." });
    }

    const types = {
        ".html": "text/html; charset=utf-8",
        ".css": "text/css; charset=utf-8",
        ".js": "text/javascript; charset=utf-8"
    };

    fs.readFile(file, (error, content) => {
        if (error) {
            return json(res, 404, { error: "File not found." });
        }

        res.writeHead(200, {
            "Content-Type": types[path.extname(file)] ||
                "application/octet-stream"
        });
        res.end(content);
    });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Website running on port ${PORT}`);
});
