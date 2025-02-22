const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 5000;

const uploadFolder = path.join(__dirname, "transactions");
if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadFolder);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

app.post("/metrics", upload.array("files"), async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: "No files uploaded" });
  }

  let dailySalesVolume = {};
  let dailySalesValue = {};
  let productSales = {};
  let monthlyTopStaff = {};
  let hourlyTransactionCount = {};

  try {
    for (const file of req.files) {
      const filePath = path.join(uploadFolder, file.filename);
      const data = fs.readFileSync(filePath, "utf8");
      const lines = data.trim().split("\n");

      lines.forEach((line) => {
        const [staffId, time, products, amount] = line.split(",");
        const date = time.split("T")[0];
        const hour = time.split("T")[1].slice(0, 2);
        const month = date.slice(0, 7); // YYYY-MM

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

      // Delete file after processing
      fs.unlinkSync(filePath);
    }

    // Calculate final metrics
    const highestSalesVolumeDay = Object.entries(dailySalesVolume).reduce((a, b) => (b[1] > a[1] ? b : a), ["", 0]);
    const highestSalesValueDay = Object.entries(dailySalesValue).reduce((a, b) => (b[1] > a[1] ? b : a), ["", 0]);
    const mostSoldProduct = Object.entries(productSales).reduce((a, b) => (b[1] > a[1] ? b : a), ["", 0]);
    const highestSalesStaffPerMonth = Object.fromEntries(Object.entries(monthlyTopStaff).map(([month, sales]) => [month, Object.entries(sales).reduce((a, b) => (b[1] > a[1] ? b : a))[0]]));
    const highestHourByAvgTransactionVolume = Object.entries(hourlyTransactionCount)
      .map(([hour, volumes]) => [hour, volumes.reduce((sum, v) => sum + v, 0) / volumes.length])
      .reduce((a, b) => (b[1] > a[1] ? b : a), ["", 0])[0];

    res.status(200).json({
      highestSalesVolumeDay,
      highestSalesValueDay,
      mostSoldProduct,
      highestSalesStaffPerMonth,
      highestHourByAvgTransactionVolume,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
