import { Router, type Request, type Response } from 'express';
import { ZodError } from 'zod';
import { getDatabase } from '../db/connection.js';
import { QueryInterpreter } from '../nlp/interpreter.js';
import { chatRequestSchema } from '../validators/chatValidator.js';

export const chatRouter = Router();

chatRouter.post('/chat', (req: Request, res: Response): void => {
  try {
    // 1. Zod request validation
    const validated = chatRequestSchema.parse(req.body);

    // 2. Query processing pipeline
    const db = getDatabase();
    const interpreter = new QueryInterpreter(db);
    const result = interpreter.processQuery(validated.question);

    res.status(200).json(result);
  } catch (error) {
    if (error instanceof ZodError) {
      const issue = error.issues[0]?.message || 'Invalid request payload.';
      res.status(400).json({
        success: false,
        message: issue,
        intent: 'validation_error',
        visualizationType: 'none',
        summary: issue,
        columns: [],
        rows: [],
        suggestedQuestions: [
          'Show monthly onboarding applications by customer segment',
          'Which branches have the highest rejection rate?',
          'What is the total transaction value this month?'
        ]
      });
      return;
    }

    // Defensive error handling: do not expose internal stack traces or secrets
    console.error('Unhandled error in /api/chat route:', error);
    res.status(500).json({
      success: false,
      message: 'An unexpected internal error occurred while processing your request.',
      intent: 'internal_error',
      visualizationType: 'none',
      summary: 'A server error occurred. Please try asking your question again in a moment.',
      columns: [],
      rows: []
    });
  }
});
