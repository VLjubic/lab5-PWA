const express = require("express");
const path = require("path");
const httpPort = 80;

const externalUrl = process.env.RENDER_EXTERNAL_URL;
const port =
  externalUrl && process.env.PORT ? parseInt(process.env.PORT) : 4080;

const config = { baseURL: externalUrl || `https://localhost:${port}` };

const app = express();
app.use(express.json());

app.use(express.static(path.join(__dirname)));

app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "index.html"));
});

if (externalUrl) {
  const hostname = "127.0.0.1";
  app.listen(port, hostname, () => {
    console.log(
      `Server locally running at http://${hostname}:${port}/ and from outside on ${externalUrl}`
    );
  });
} else {
  app.listen(port, function () {
    console.log(`Server running at http://localhost:${port}/`);
  });
}
