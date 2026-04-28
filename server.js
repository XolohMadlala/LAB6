const http = require("http");
const fs = require("fs");
const url = require("url");
const querystring = require("querystring");

function isValidName(name) {
  name = name.trim();
  if (name === "") return false;
  if (/^\d+$/.test(name)) return false;
  return true;
}

function isValidPassword(password) {
  if (password.length < 10) return false;
  if (!/[A-Za-z]/.test(password)) return false;
  if (!/\d/.test(password)) return false;
  return true;
}

function isValidID(id) {
  if (id.includes(".")) return false;
  if (!/^[\d-]+$/.test(id)) return false;

  const digitsOnly = id.replace(/-/g, "");
  return digitsOnly.length === 12;
}

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url);

  if (req.method === "GET" && parsedUrl.pathname === "/") {
    fs.readFile("./protectaccess.html", (err, data) => {
      if (err) {
        res.writeHead(500);
        return res.end("Error loading page");
      }
      res.writeHead(200, { "Content-Type": "text/html" });
      return res.end(data);
    });
  }

  else if (req.method === "POST" && parsedUrl.pathname === "/protectaccess") {
    let body = "";

    req.on("data", chunk => {
      body += chunk.toString();
    });

    req.on("end", () => {
      const formData = querystring.parse(body);

      const name = formData.name || "";
      const pw = formData.pw || "";
      const IDnumber = formData.IDnumber || "";

      const valid =
        isValidName(name) &&
        isValidPassword(pw) &&
        isValidID(IDnumber);

      const maskedPassword = "*".repeat(pw.length);
      const cleanID = IDnumber.replace(/-/g, "");

      const result = `${name}, ${maskedPassword}, ${cleanID}, ${
        valid ? "Successful" : "Access Denied"
      }\n`;

      fs.appendFile("accessresults.txt", result, () => {
        res.writeHead(200, { "Content-Type": "text/html" });

        res.end(`
          <h1 style="color:${valid ? "green" : "red"}">
            ${valid ? "Successful" : "Access Denied Invalid Data"}
          </h1>
          <p>${name}, ${maskedPassword}, ${cleanID}</p>
          <a href="/">Go Back</a>
        `);
      });
    });
  }

  else {
    res.writeHead(404);
    res.end("Not Found");
  }
});

server.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
