'use server'

import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendBirthdayEmail(data: {
  email: string
  name: string
  message: string
}) {
  try {
    if (!process.env.RESEND_API_KEY) {
      throw new Error("Chưa cấu hình RESEND_API_KEY trong biến môi trường (.env)")
    }

    const { data: emailData, error } = await resend.emails.send({
      from: 'Birthday Wishes <onboarding@resend.dev>', // Cần cấu hình Domain trong Resend dashboard để đổi email này
      to: [data.email],
      subject: `Chúc mừng sinh nhật ${data.name}! 🎂`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; background-color: #fdf2f8; border-radius: 10px; border: 1px solid #fbcfe8;">
          <h1 style="color: #db2777; margin-top: 0;">Chúc mừng sinh nhật! 🎉</h1>
          <p style="font-size: 16px;">Thân gửi <strong>${data.name}</strong>,</p>
          <p style="font-size: 16px; line-height: 1.5; color: #374151;">${data.message}</p>
          <br/>
          <hr style="border: none; border-top: 1px solid #fbcfe8;" />
          <p style="color: #6b7280; font-size: 14px;">Trân trọng,<br/><strong>Ban Lãnh Đạo Trung Tâm</strong></p>
        </div>
      `
    })

    if (error) {
      console.error("Resend Error:", error)
      throw new Error(error.message)
    }

    return { success: true, data: emailData }
  } catch (error: any) {
    console.error("Error sending birthday email:", error)
    throw new Error(error.message || "Gửi email thất bại")
  }
}
