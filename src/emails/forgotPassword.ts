export const subject = 'Po.et Password Reset'

export const template = (token: string) => `
  <p>Hi, dear user</p>

  <p>You recently requested to <strong>reset your password</strong> for your <strong>Po.et account</strong>. 
  You can reset your password using the token below.</p>
    
  <p><strong>${token}</strong></p>

  <p>If you did not request a password reset, please ignore this email or reply <br/>
  to let us know. This token is only valid for the next 30 minutes.</p>

  <p>Thanks,</p>
  <p><strong>Po.et Team</strong></p>

  <p><strong>P.S.</strong> We also love hearing from you and helping you with any issues you have.<br/>
  Please reply to this email if you want to ask a question or just say hi.</p>
`
