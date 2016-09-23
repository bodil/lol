const p = require("eulalie");
const fs = require("fs");
const parser = require("./parser.js");
const util = require("util")

const src = fs.readFileSync(process.argv[2], "utf8");

const result = p.parse(parser, p.stream(src));

if (result.name === "Eulalie.ParseResult") {
  console.log(util.inspect(result.value, { depth: null }));
} else {
  console.log(result.print());
}
