/**
 * Welcome Email Template
 */
const welcomeTemplate = (name) => {
    return `
        <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
            <div style="background: linear-gradient(135deg, #3cb14a, #2d8e3a); padding: 20px; text-align: center;">
                 <h1 style="color: white; margin: 0;">ToyRent</h1>
            </div>
            <div style="padding: 30px;">
                <h2 style="color: #3cb14a;">Chào mừng ${name}!</h2>
                <p>Cảm ơn bạn đã đăng ký tài khoản tại <strong>ToyRent</strong>.</p>
                <p>Chúng tôi rất vui mừng được đồng hành cùng bạn trong việc mang lại những món đồ chơi tuyệt vời nhất cho bé.</p>
                <div style="margin-top: 30px; text-align: center;">
                    <a href="${process.env.FRONTEND_URL || '#'}" style="background-color: #3cb14a; color: white; padding: 12px 25px; text-decoration: none; border-radius: 25px; font-weight: bold;">Khám phá ngay</a>
                </div>
            </div>
            <div style="background-color: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #eee;">
                <p>Nếu bạn có bất kỳ câu hỏi nào, đừng ngần ngại phản hồi email này.</p>
                <p>Trân trọng,<br/>Đội ngũ ToyRent</p>
            </div>
        </div>
    `;
};

/**
 * OTP Email Template
 */
const otpTemplate = (otp) => {
    return `
        <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
            <div style="background: linear-gradient(135deg, #3cb14a, #2d8e3a); padding: 20px; text-align: center;">
                 <h1 style="color: white; margin: 0;">ToyRent</h1>
            </div>
            <div style="padding: 30px; text-align: center;">
                <h2 style="color: #3cb14a;">Xác thực tài khoản</h2>
                <p>Mã OTP của bạn là:</p>
                <div style="font-size: 36px; font-weight: bold; color: #2d8e3a; letter-spacing: 8px; margin: 25px 0; padding: 15px; background-color: #f0fdf4; border-radius: 8px; display: inline-block;">
                    ${otp}
                </div>
                <p style="color: #6b7280; font-size: 14px;">Mã này có hiệu lực trong vòng 5 phút. Vui lòng không chia sẻ mã này với bất kỳ ai.</p>
            </div>
            <div style="background-color: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #eee;">
                <p>Đây là email tự động, vui lòng không trả lời.</p>
                <p>&copy; ${new Date().getFullYear()} ToyRent. All rights reserved.</p>
            </div>
        </div>
    `;
};

module.exports = {
    welcomeTemplate,
    otpTemplate
};
