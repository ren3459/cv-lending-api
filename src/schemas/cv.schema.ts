import { z } from "zod";

export const contactRequestSchema = z.object({
  name: z.string().trim().min(2).max(120),
  phone: z
    .string()
    .trim()
    .min(7)
    .max(60)
    .regex(/^[+\d\s()-]+$/),
  email: z.email(),
  comment: z.string().trim().min(10).max(3000),
});

export const aiSummarySchema = z.object({
  prompt: z.string().trim().min(8).max(800),
});

export type ContactRequestPayload = z.infer<typeof contactRequestSchema>;
export type AiSummaryPayload = z.infer<typeof aiSummarySchema>;
