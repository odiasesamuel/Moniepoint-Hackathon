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
  // console.log(lines);
  lines.forEach((line) => {
    const [staffId, time, products, amount] = line.split(",");
    const date = time.split("T")[0];
    const hour = time.split("T")[1].slice(0, 2);
    const month = date.slice(0, 7); // YYYY-MM
    console.log(staffId, time, products, amount);
  });
}

fs.readdirSync(transactionDir).forEach((file) => {
  processTransactionFile(path.join(transactionDir, file));
});
