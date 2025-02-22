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
    // console.log(staffId, time, products, amount);

    // Update daily sales volume
    const transactionVolume = products.match(/:\d+/g).reduce((sum, p) => sum + parseInt(p.slice(1)), 0);
    dailySalesVolume[date] = (dailySalesVolume[date] || 0) + transactionVolume;

    // Update daily sales value
    dailySalesValue[date] = (dailySalesValue[date] || 0) + parseFloat(amount);

    // Update product sales
    products
      .slice(1, -1)
      .split("|")
      .forEach((p) => {
        const [productId, quantity] = p.split(":");
        productSales[productId] = (productSales[productId] || 0) + parseInt(quantity);
      });

    // Update highest sales staff per month
    monthlyTopStaff[month] = monthlyTopStaff[month] || {};
    monthlyTopStaff[month][staffId] = (monthlyTopStaff[month][staffId] || 0) + parseFloat(amount);

    // Update hourly transaction volume
    hourlyTransactionCount[hour] = (hourlyTransactionCount[hour] || []).concat(transactionVolume);
  });
}

fs.readdirSync(transactionDir).forEach((file) => {
  processTransactionFile(path.join(transactionDir, file));
});

// Calculate final metrics
const highestSalesVolumeDay = Object.entries(dailySalesVolume).reduce((a, b) => (b[1] > a[1] ? b : a));
const highestSalesValueDay = Object.entries(dailySalesValue).reduce((a, b) => (b[1] > a[1] ? b : a));
const mostSoldProduct = Object.entries(productSales).reduce((a, b) => (b[1] > a[1] ? b : a));
const highestSalesStaffPerMonth = Object.fromEntries(Object.entries(monthlyTopStaff).map(([month, sales]) => [month, Object.entries(sales).reduce((a, b) => (b[1] > a[1] ? b : a))[0]]));
const highestHourByAvgTransactionVolume = Object.entries(hourlyTransactionCount)
    .map(([hour, volumes]) => [hour, volumes.reduce((sum, v) => sum + v, 0) / volumes.length])
    .reduce((a, b) => (b[1] > a[1] ? b : a))[0];

// console.log("Highest sales volume in a day:", highestSalesVolumeDay);
// console.log("Highest sales value in a day:", highestSalesValueDay);
// console.log('Most sold product ID by volume:', mostSoldProduct);
// console.log('Highest sales staff ID for each month:', highestSalesStaffPerMonth);
console.log('Highest hour of the day by average transaction volume:', highestHourByAvgTransactionVolume);
