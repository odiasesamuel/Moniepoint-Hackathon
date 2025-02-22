const fs = require("fs");
const path = require("path");

const transactionDir = "./transactions_2024";

let dailySalesVolume = {};
let dailySalesValue = {};
let productSales = {};
let monthlyTopStaff = {};
let hourlyTransactionCount = {};

function processTransactionFile(filePath) {
  const data = fs.readFileSync(filePath, "utf8");
  const lines = data.trim().split("\n");
  console.log(lines);
}

fs.readdirSync(transactionDir).forEach((file) => {
  processTransactionFile(path.join(transactionDir, file));
});
