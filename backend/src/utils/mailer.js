/**
 * 메일 발송.
 * SMTP 설정(.env 의 SMTP_HOST)이 없으면 실제로 보내지 않고 콘솔에만 남긴다.
 * 메일 실패가 요청 자체를 실패시키면 안 되므로, 이 파일의 함수는 오류를 던지지 않는다.
 */
import nodemailer from 'nodemailer'

import { config } from '../config/index.js'

let transporter = null

if (config.mail.host) {
  transporter = nodemailer.createTransport({
    host: config.mail.host,
    port: config.mail.port,
    secure: config.mail.secure,
    auth: config.mail.user ? { user: config.mail.user, pass: config.mail.pass } : undefined,
  })
}

/**
 * @param {{ to: string, subject: string, text: string }} message
 */
export async function sendMail({ to, subject, text }) {
  if (!transporter) {
    console.info(
      '[mail] SMTP 미설정 - 메일을 보내지 않고 내용만 남깁니다.\n' +
        '       to: ' + to + '\n' +
        '       subject: ' + subject + '\n' +
        text.replace(/^/gm, '       '),
    )
    return { delivered: false }
  }

  try {
    await transporter.sendMail({ from: config.mail.from, to, subject, text })
    return { delivered: true }
  } catch (error) {
    console.error('[mail] 발송 실패:', error.message)
    return { delivered: false }
  }
}

export default { sendMail }
