import express from 'express';
import cors from 'cors';
import expenseRoutes from './routes/expenses';
import budgetRoutes from './routes/budget';
import insightsRoutes from './routes/insights';
import parseRoutes from './routes/parse';

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/expenses', expenseRoutes);
app.use('/api/budget', budgetRoutes);
app.use('/api/insights', insightsRoutes);
app.use('/api/parse-expense', parseRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
