import { Router } from 'express';
import { parseNaturalLanguageExpense } from '../utils/parser';

const router = Router();

router.post('/', (req, res) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required' });
    }

    const parsedData = parseNaturalLanguageExpense(text);
    res.json(parsedData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
