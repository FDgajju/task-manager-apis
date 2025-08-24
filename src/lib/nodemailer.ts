import nodemailer, { createTransport } from "nodemailer";

import type { TransportOptions } from "nodemailer";
import {
  NODE_MAILER_PASS,
  NODE_MAILER_SMTP_HOST,
  NODE_MAILER_SMTP_PORT,
  NODE_MAILER_USER,
} from "../constants/env.ts";
import type { SendMailPayloadT } from "./types.ts";

export const sendMail = async (payload: SendMailPayloadT) => {
  try {
    const transporter = createTransport({
      host: NODE_MAILER_SMTP_HOST,
      port: Number.parseInt(NODE_MAILER_SMTP_PORT),
      auth: {
        user: NODE_MAILER_USER,
        pass: NODE_MAILER_PASS,
      },
    } as TransportOptions);

    const mailPayload = {
      subject: payload.subject,
      from: payload.from,
      to: payload.to,
      html: payload.message,
      cc: payload.cc,
    };

    const mail = await transporter.sendMail(mailPayload);

    return { status: true, data: mail, error: null };
  } catch (error) {
    return { status: true, data: null, error };
  }
};
