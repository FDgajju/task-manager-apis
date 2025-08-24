import { sendMail } from "../../lib/nodemailer.ts";
import type {
  SendNotificationParamsType,
  sendNotificationType,
} from "../../lib/types.ts";
import { getTemplate } from "../../templates/getTemplate.ts";

export const sendNotification = async (
  type: sendNotificationType,
  params: SendNotificationParamsType
) => {
  try {
    const template = getTemplate(type);

    let message = template;
    for (const [key, value] of Object.entries(params.variables)) {
      message = message.replace(new RegExp(`{{${key}}}`, "g"), String(value));
    }

    const resp = await sendMail({
      message,
      from: params.from,
      to: params.to,
      subject: params.subject,
      cc: params.cc,
    });

    return { status: true, data: resp, error: null };
  } catch (error) {
    return {
      status: false,
      data: null,
      error: error instanceof Error ? error.message : error,
    };
  }
};
