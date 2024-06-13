const express = require("express");
const fs = require("fs");
const path = require("path");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const app = express();
const port = 3000;
const tradefiles = path.join(__dirname, "trade.json");

app.use(morgan(":method :url :status :response-time ms - :date[iso]"));
app.use(bodyParser.json());

const readTrades = () => {
  try {
    const data = fs.readFileSync(tradefiles, "utf8");
    console.log(data);
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

const writerades = (data) => {
  fs.writeFileSync(tradefiles, JSON.stringify(data, null, 2));
};


app.get('/trades', (req, res) => {
    const trades = readTrades();
    res.status(200).json({ trades });
  });
app.post("/trades", (req, res) => {
  const data = readTrades();
  const newTrade = req.body;
  newTrade.id = data.length ? data[data.length - 1].id + 1 : 1;
  data.push(newTrade);
  writerades(data);
  res.status(201).send(data);
});

app.get("/trades/:id", (req, res) => {
  const trades = readTrades();
  const trade = trades.find((trade) => trade.id == parseInt(req.params.id));
  if (trade) {
    res.status(200).send(trade);
  } else {
    res.status(404).send("Trade not found");
  }
});

app.delete("/trades/:id", (req, res) => {
  let trades = readTrades();
  let tradeIndex = trades.findIndex(
    (trade) => trade.id == parseInt(req.params.id)
  );
  if (tradeIndex !== -1) {
    trades = trades.filter((trade) => trade.id !== parseInt(req.params.id));
    writerades(trades);
    res.status(200).send(trades);
  } else {
    res.status(404).send("Trade not found");
  }
});
app.patch("/trades/:id", (req, res) => {
  const trades = readTrades();
  const trade = trades.find((trade) => trade.id == parseInt(req.params.id));
  if (trade) {
    if (req.body.price) {
      trade.price = req.body.price;
    }
    writerades(trades);
    res.status(200).send(trade);
  } else {
    res.status(404).send("Trade not found");
  }
});

app.listen(port || 5000, () => {
  console.log(`Server running on port ${port}`);
});
