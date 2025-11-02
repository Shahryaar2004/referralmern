function generateOTP() {
  const otp = Math.floor(10000 + Math.random() * 90000); 
  return otp.toString();
}


function getEmailTemplate(otp) {
  return `
  <div style="font-family: Arial, sans-serif; padding: 20px; background: #f9f9f9;">
    <h2 style="color: #333;">🔐 Password Reset Request</h2>
    <p>Hello,</p>
    <p>We received a request to reset your password. Please use the OTP below to proceed:</p>
    
    <h1 style="background: #4CAF50; color: white; display: inline-block; padding: 10px 20px; border-radius: 5px;">
      ${otp}
    </h1>
    
    <p>This OTP is valid for <b>1 minute</b>. Do not share it with anyone.</p>
    <br/>
    <p>If you did not request a password reset, please ignore this email.</p>
    <hr/>
    <p style="font-size: 12px; color: #888;">© ${new Date().getFullYear()} Zapzo Chat</p>
  </div>
  `;
}


const otpCode = generateOTP();
const emailBody = getEmailTemplate(otpCode);




module.exports = { generateOTP, getEmailTemplate };
