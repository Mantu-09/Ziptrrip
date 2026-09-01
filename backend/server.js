const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Health-check route
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Ziptrrip API is running' });
});

// Placeholder: todo routes will be mounted here in future steps
// app.use('/api/todos', todoRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
