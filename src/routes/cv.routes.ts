import { Router } from 'express';
import { aiSummarySchema, contactRequestSchema } from '../schemas/cv.schema';
import { generateSummary } from '../services/ai.service';
import { sendContactRequest } from '../services/mail.service';

export const contactRouter = Router();
export const aiRouter = Router();

contactRouter.post('/', async (req, res, next) => {
  try {
    const payload = contactRequestSchema.parse(req.body);
    const result = await sendContactRequest(payload);

    res.status(202).json({
      message: result.delivered
        ? 'Contact request was sent'
        : 'Contact request was accepted in demo mode',
      delivered: result.delivered,
      messageId: result.messageId
    });
  } catch (error) {
    next(error);
  }
});

aiRouter.post('/', async (req, res, next) => {
  try {
    const { prompt } = aiSummarySchema.parse(req.body);
    const summary = await generateSummary(prompt);

    res.status(200).json({ summary });
  } catch (error) {
    next(error);
  }
});
