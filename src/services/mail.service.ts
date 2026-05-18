import nodemailer from "nodemailer";
import { env } from "../config/env";
import type { ContactRequestPayload } from "../schemas/cv.schema";

type SendCvResult = {
  delivered: boolean;
  messageId?: string;
};

const isSmtpConfigured = Boolean(
  env.SMTP_HOST &&
  env.SMTP_USER &&
  env.SMTP_PASS &&
  env.MAIL_FROM &&
  env.MAIL_TO,
);

const transporter = isSmtpConfigured
  ? nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    })
  : null;

export async function sendContactRequest(
  payload: ContactRequestPayload,
): Promise<SendCvResult> {
  const subject = `New contact request: ${payload.name}`;
  const ownerText = [
    "Новый контакт с сайта",
    "",
    `Имя: ${payload.name}`,
    `Телефон: ${payload.phone}`,
    `Email: ${payload.email}`,
    "",
    "Комментарий",
    payload.comment,
  ].join("\n");
  const senderText = [
    `Здравствуйте, ${payload.name}!`,
    "",
    "Мы получили вашу заявку и вернемся с ответом.",
    "",
    "Копия вашего сообщения:",
    "",
    `Телефон: ${payload.phone}`,
    `Email: ${payload.email}`,
    "",
    payload.comment,
  ].join("\n");

  if (!transporter || !env.MAIL_FROM || !env.MAIL_TO) {
    console.info(
      "SMTP is not configured. Contact request was validated but not delivered.",
    );
    console.info(ownerText);
    return { delivered: false };
  }

  const [ownerInfo, senderInfo] = await Promise.all([
    transporter.sendMail({
      from: env.MAIL_FROM,
      to: env.MAIL_TO,
      replyTo: payload.email,
      subject,
      text: ownerText,
    }),
    transporter.sendMail({
      from: env.MAIL_FROM,
      to: payload.email,
      replyTo: env.MAIL_TO,
      subject: "Копия заявки с сайта",
      text: senderText,
    }),
  ]);

  return {
    delivered: true,
    messageId: [ownerInfo.messageId, senderInfo.messageId]
      .filter(Boolean)
      .join(", "),
  };
}
