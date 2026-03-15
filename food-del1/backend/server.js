import express from 'express';
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// 🔥 HARDCODE CORS - NOTHING CAN BREAK THIS
app.use('*', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', '*');
  if(req.method == 'OPTIONS') res.status(200).end();
  next();
});

// TEST DATA - WILL DEFINITELY WORK
app.get('/api/food/list', (req, res) => res.json([{id:1,name:'Burger',price:50}]));
app.get('/api/order/list', (req, res) => res.json([]));
app.get('/api/pos/orders', (req, res) => res.json([]));
app.get('/api/order/kitchen', (req, res) => res.json([]));
app.get('/', (req, res) => res.json({live:true}));

app.listen(PORT, () => {
  console.log('🚀 API LIVE - CORS FIXED');
});
