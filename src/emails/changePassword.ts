export const subject = 'Po.et Password Changed'

const getDateReadable = () => {
  const date = new Date()
  const options = {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
    timeZoneName: 'short',
  }

  return date.toLocaleString('en-US', options)
}

// tslint:disable:max-line-length
export const template = () => `
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
            Hi,
          </p>

          <p style="font-family:Helvetica,Arial,sans-serif;font-weight:normal;color:#525845;font-size:15px;line-height:21px;">
            Your password has been changed.
          </p>

          <p style="font-family:Helvetica,Arial,sans-serif;font-weight:normal;color:#525845;font-size:15px;line-height:21px;">
            This is a confirmation that your password was changed at ${getDateReadable()}
          </p>

          <p style="font-family:Helvetica,Arial,sans-serif;font-weight:normal;color:#525845;font-size:15px;line-height:21px;">
            <strong>The Po.et Team</strong>
          </p>

          <p style="font-family:Helvetica,Arial,sans-serif;font-weight:normal;color:#525845;font-size:15px;line-height:21px;">
            <strong>P.S.</strong> We also love hearing from you and helping you with any issues you have. Please reply to this
            email if you want to ask a question, or even just to say hi. :-)</p>
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
                  <img width="35" src="https://s3.amazonaws.com/poet-email/twitter.jpg">
                </a>
              </td>
              <td style="padding: 0 10px">
                <a href="https://github.com/poetapp">
                  <img width="35" src="https://s3.amazonaws.com/poet-email/github.jpg">
                </a>
              </td>
              <td style="padding: 0 10px">
                <a href="https://www.reddit.com/r/poetproject">
                  <img width="35" src="https://s3.amazonaws.com/poet-email/reddit.jpg">
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
            © ${new Date().getFullYear()}
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
