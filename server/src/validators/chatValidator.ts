import { z } from 'zod';

export const chatRequestSchema = z.object({
  question: z
    .string({
      required_error: 'Question is required.',
      invalid_type_error: 'Question must be a string.',
    })
    .trim()
    .min(2, 'Question must be at least 2 characters long.')
    .max(500, 'Question must not exceed 500 characters.'),
});

export type ValidatedChatRequest = z.infer<typeof chatRequestSchema>;
