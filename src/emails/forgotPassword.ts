export const subject = 'Po.et Password Reset'

// tslint:disable:max-line-length
export const template = (token: string) => `
<table border="0" cellpadding="0" cellspacing="0" width="100%">
<tr>
  <td bgcolor="#ffffff" align="center">
    <table border="0" cellpadding="0" cellspacing="0" width="600">
      <tr>
        <td align="center" height="150">
            <img height="50" src="https://cdn-images-1.medium.com/max/750/1*3ILSSKcOmL3AeK-kLnU73Q@2x.png" />
        </td>
      </tr>
    </table>
    <table border="0" cellpadding="0" cellspacing="0" width="600">
      <tr>
        <td>
          <p style="font-family:Helvetica,Arial,sans-serif;font-weight:normal;color:#525845;font-size:15px;line-height:21px; margin-bottom: 40px;">
            Hi, dear user.
          </p>

          <p style="font-family:Helvetica,Arial,sans-serif;font-weight:normal;color:#525845;font-size:15px;line-height:21px;">
            You recently requested to
            <strong>reset your password</strong> for your
            <strong>Po.et account</strong>. You can reset your password using the token below.
          </p>

          <p id="frost-token" style="font-family:Helvetica,Arial,sans-serif;font-weight:normal;color:#525845;font-size:15px;line-height:21px; border: 1px dashed #ccc;
          padding: 30px; margin: 40px 0px;">
            ${token}
          </p>

          <p style="font-family:Helvetica,Arial,sans-serif;font-weight:normal;color:#525845;font-size:15px;line-height:21px;">
            If you did not request a password reset, please ignore this email or reply to let us know. This token is only valid for the
            next 30 minutes.
          </p>

          <p style="font-family:Helvetica,Arial,sans-serif;font-weight:normal;color:#525845;font-size:15px;line-height:21px;">
            Thanks,
          </p>
          <p style="font-family:Helvetica,Arial,sans-serif;font-weight:normal;color:#525845;font-size:15px;line-height:21px;">
            <strong>Po.et Team</strong>
          </p>

          <p style="font-family:Helvetica,Arial,sans-serif;font-weight:normal;color:#525845;font-size:15px;line-height:21px;">
            <strong>P.S.</strong> We also love hearing from you and helping you with any issues you have. Please reply to this
            email if you want to ask a question or just say hi.</p>
        </td>
      </tr>
    </table>
    <table border="0" cellpadding="0" cellspacing="0" width="600">
      <tr>
        <td align="center" style="padding:60px 0 60px 0">
          <table width="300" style="max-width:300px;width:100px" border="0">
            <tr>
              <td style="padding: 0 10px">
                <a href="https://twitter.com/_poetproject">
                  <img width="35" src="https://po.et/img/twitter-logo.png">
                </a>
              </td>
              <td style="padding: 0 10px">
                <a href="https://github.com/poetapp">
                  <img width="35" src="https://po.et/img/github-logo.png">
                </a>
              </td>
              <td style="padding: 0 10px">
                <a href="https://www.reddit.com/r/poetproject">
                  <img width="35" src="https://po.et/img/reddit-logo.png">
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    <table border="0" cellpadding="0" cellspacing="0" width="600">
      <tr>
        <td style="line-height:0px; padding-bottom:35px; padding-top:0px; padding-left:4%; padding-right:4%;" align="center" valign="top"
          width="100%" class="">
          <span style="  margin-bottom:0px; margin-top:0px; font-family: Helvetica, Arial, sans-serif; font-size:12px; line-height:18px;  color:#524C46;">
            © 2017
            <a href="https://po.et/" target="_blank" style="color:#43B980; font-weight:bold; text-decoration:none;">Po.et</a>. All rights reserved.
          </span>
        </td>
      </tr>
    </table>
  </td>
</tr>
</table>
`
// tslint:enable:max-line-length
