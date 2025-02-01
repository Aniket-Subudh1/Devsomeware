import { NextResponse,NextRequest } from "next/server";
import ConnectDb from "@/middleware/connectDb";
import EventReg from "@/models/EventReg";
import VerifyUser from "@/server/VerifyUser";
import nodemailer from "nodemailer";
export const POST = async (req:NextRequest) => {
    try{
    const data = await req.json();
    console.log(data);
    await ConnectDb();
    const verifyResult = await VerifyUser();
    if(!verifyResult.isAuth){
    return NextResponse.json({message:"User not authenticated. UnAuthorized access",success:false});
    }
    const findoneevent = await EventReg.findOne({userid:data.id,eventid:data.eventid});
    if(findoneevent){
        return NextResponse.json({message:"User already registered for the event",success:false});
    }
    const ticketid = Math.random().toString(36).substring(7)+"DSW";
    const newEvent = new EventReg({
        userid:data.id,
        eventid:data.eventid,
        eventname:data.eventname,
        ticketid:ticketid,
        email:data.email,
    });
    await newEvent.save();
    handleSendMail(data.email);
    return NextResponse.json({message:"Event Registered Successfully",success:true,event:newEvent});
}
    catch(err){
        console.log(err);
        return NextResponse.json({message:"Error in Event Registration. Please try again later.",success:false});
    }
}

const handleSendMail = async (email:string) => {
    try{
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false, // true for port 465, false for other ports
            auth: {
              user: process.env.EMAIL_USERNAME,
              pass: process.env.EMAIL_PASSWORD,
            },
          });

          const info = await transporter.sendMail({
            from: '"DevSomeware" <team@devsomeware.com>', // sender address
            to: email, // list of receivers,
            cc:"saneev.das@devsomeware.com,aniket@devsomeware.com,ankit@devsomeware.com,swagat@devsomeware.com,basir@devsomeware.com",
            subject: "✅ Confirmation: Successfully Registered for Zenetrone!", 
            text: "✅ Confirmation: Successfully Registered for Zenetrone!", // plain text body
            html: `
            <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html dir="ltr" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">
 <head>
  <meta charset="UTF-8">
  <meta content="width=device-width, initial-scale=1" name="viewport">
  <meta name="x-apple-disable-message-reformatting">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta content="telephone=no" name="format-detection">
  <title>New Template 2</title><!--[if (mso 16)]>
    <style type="text/css">
    a {text-decoration: none;}
    </style>
    <![endif]--><!--[if gte mso 9]><style>sup { font-size: 100% !important; }</style><![endif]--><!--[if gte mso 9]>
<noscript>
         <xml>
           <o:OfficeDocumentSettings>
           <o:AllowPNG></o:AllowPNG>
           <o:PixelsPerInch>96</o:PixelsPerInch>
           </o:OfficeDocumentSettings>
         </xml>
      </noscript>
<![endif]--><!--[if mso]><xml>
    <w:WordDocument xmlns:w="urn:schemas-microsoft-com:office:word">
      <w:DontUseAdvancedTypographyReadingMail/>
    </w:WordDocument>
    </xml><![endif]-->
  <style type="text/css">
.rollover:hover .rollover-first {
  max-height:0px!important;
  display:none!important;
}
.rollover:hover .rollover-second {
  max-height:none!important;
  display:block!important;
}
.rollover span {
  font-size:0px;
}
u + .body img ~ div div {
  display:none;
}
#outlook a {
  padding:0;
}
span.MsoHyperlink,
span.MsoHyperlinkFollowed {
  color:inherit;
  mso-style-priority:99;
}
a.es-button {
  mso-style-priority:100!important;
  text-decoration:none!important;
}
a[x-apple-data-detectors],
#MessageViewBody a {
  color:inherit!important;
  text-decoration:none!important;
  font-size:inherit!important;
  font-family:inherit!important;
  font-weight:inherit!important;
  line-height:inherit!important;
}
.es-desk-hidden {
  display:none;
  float:left;
  overflow:hidden;
  width:0;
  max-height:0;
  line-height:0;
  mso-hide:all;
}
@media only screen and (max-width:600px) {.es-p-default { } *[class="gmail-fix"] { display:none!important } p, a { line-height:150%!important } h1, h1 a { line-height:120%!important } h2, h2 a { line-height:120%!important } h3, h3 a { line-height:120%!important } h4, h4 a { line-height:120%!important } h5, h5 a { line-height:120%!important } h6, h6 a { line-height:120%!important } .es-header-body p { } .es-content-body p { } .es-footer-body p { } .es-infoblock p { } h1 { font-size:30px!important; text-align:center; line-height:120%!important } h2 { font-size:26px!important; text-align:center; line-height:120%!important } h3 { font-size:20px!important; text-align:center; line-height:120%!important } h4 { font-size:24px!important; text-align:left } h5 { font-size:20px!important; text-align:left } h6 { font-size:16px!important; text-align:left } .es-header-body h1 a, .es-content-body h1 a, .es-footer-body h1 a { font-size:30px!important } .es-header-body h2 a, .es-content-body h2 a, .es-footer-body h2 a { font-size:26px!important } .es-header-body h3 a, .es-content-body h3 a, .es-footer-body h3 a { font-size:20px!important } .es-header-body h4 a, .es-content-body h4 a, .es-footer-body h4 a { font-size:24px!important } .es-header-body h5 a, .es-content-body h5 a, .es-footer-body h5 a { font-size:20px!important } .es-header-body h6 a, .es-content-body h6 a, .es-footer-body h6 a { font-size:16px!important } .es-menu td a { font-size:14px!important } .es-header-body p, .es-header-body a { font-size:16px!important } .es-content-body p, .es-content-body a { font-size:16px!important } .es-footer-body p, .es-footer-body a { font-size:13px!important } .es-infoblock p, .es-infoblock a { font-size:12px!important } .es-m-txt-c, .es-m-txt-c h1, .es-m-txt-c h2, .es-m-txt-c h3, .es-m-txt-c h4, .es-m-txt-c h5, .es-m-txt-c h6 { text-align:center!important } .es-m-txt-r, .es-m-txt-r h1, .es-m-txt-r h2, .es-m-txt-r h3, .es-m-txt-r h4, .es-m-txt-r h5, .es-m-txt-r h6 { text-align:right!important } .es-m-txt-j, .es-m-txt-j h1, .es-m-txt-j h2, .es-m-txt-j h3, .es-m-txt-j h4, .es-m-txt-j h5, .es-m-txt-j h6 { text-align:justify!important } .es-m-txt-l, .es-m-txt-l h1, .es-m-txt-l h2, .es-m-txt-l h3, .es-m-txt-l h4, .es-m-txt-l h5, .es-m-txt-l h6 { text-align:left!important } .es-m-txt-r img, .es-m-txt-c img, .es-m-txt-l img { display:inline!important } .es-m-txt-r .rollover:hover .rollover-second, .es-m-txt-c .rollover:hover .rollover-second, .es-m-txt-l .rollover:hover .rollover-second { display:inline!important } .es-m-txt-r .rollover span, .es-m-txt-c .rollover span, .es-m-txt-l .rollover span { line-height:0!important; font-size:0!important; display:block } .es-spacer { display:inline-table } a.es-button, button.es-button { font-size:20px!important; padding:10px 0px 10px 0px!important; line-height:120%!important } a.es-button, button.es-button, .es-button-border { display:inline-block!important } .es-m-fw, .es-m-fw.es-fw, .es-m-fw .es-button { display:block!important } .es-m-il, .es-m-il .es-button, .es-social, .es-social td, .es-menu { display:inline-block!important } .es-adaptive table, .es-left, .es-right { width:100%!important } .es-content table, .es-header table, .es-footer table, .es-content, .es-footer, .es-header { width:100%!important; max-width:600px!important } .adapt-img { width:100%!important; height:auto!important } .es-mobile-hidden, .es-hidden { display:none!important } .es-desk-hidden { width:auto!important; overflow:visible!important; float:none!important; max-height:inherit!important; line-height:inherit!important } tr.es-desk-hidden { display:table-row!important } table.es-desk-hidden { display:table!important } td.es-desk-menu-hidden { display:table-cell!important } .es-menu td { width:1%!important } table.es-table-not-adapt, .esd-block-html table { width:auto!important } .h-auto { height:auto!important } .es-text-8857 .es-text-mobile-size-42, .es-text-8857 .es-text-mobile-size-42 * { font-size:42px!important; line-height:150%!important } }
@media screen and (max-width:384px) {.mail-message-content { width:414px!important } }
</style>
 </head>
 <body class="body" style="width:100%;height:100%;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;padding:0;Margin:0">
  <div dir="ltr" class="es-wrapper-color" lang="en" style="background-color:#333333"><!--[if gte mso 9]>
			<v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="t">
				<v:fill type="tile" color="#333333"></v:fill>
			</v:background>
		<![endif]-->
   <table width="100%" cellspacing="0" cellpadding="0" class="es-wrapper" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;padding:0;Margin:0;width:100%;height:100%;background-repeat:repeat;background-position:center top;background-color:#333333">
     <tr style="border-collapse:collapse">
      <td valign="top" style="padding:0;Margin:0">
       <table cellpadding="0" cellspacing="0" align="center" class="es-content" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;width:100%;table-layout:fixed !important">
         <tr style="border-collapse:collapse">
          <td align="center" class="es-adaptive" style="padding:0;Margin:0">
           <table cellspacing="0" cellpadding="0" align="center" class="es-content-body" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:transparent;width:600px" role="none">
             <tr style="border-collapse:collapse">
              <td align="left" style="padding:10px;Margin:0;background-position:center top"><!--[if mso]><table style="width:580px"><tr><td style="width:280px" valign="top"><![endif]-->
               <table cellspacing="0" cellpadding="0" align="left" class="es-left" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:left">
                 <tr style="border-collapse:collapse">
                  <td align="left" style="padding:0;Margin:0;width:280px">
                   <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                     <tr style="border-collapse:collapse">
                      
                     </tr>
                   </table></td>
                 </tr>
               </table><!--[if mso]></td><td style="width:20px"></td><td style="width:280px" valign="top"><![endif]-->
               <table cellspacing="0" cellpadding="0" align="right" class="es-right" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:right">
                 <tr style="border-collapse:collapse">
                  <td align="left" style="padding:0;Margin:0;width:280px">
                   <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                     <tr style="border-collapse:collapse">
                     
                     </tr>
                   </table></td>
                 </tr>
               </table><!--[if mso]></td></tr></table><![endif]--></td>
             </tr>
           </table></td>
         </tr>
       </table>
       <table cellspacing="0" cellpadding="0" align="center" class="es-content" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;width:100%;table-layout:fixed !important">
         <tr style="border-collapse:collapse"></tr>
         <tr style="border-collapse:collapse">
          <td align="center" style="padding:0;Margin:0">
           <table cellspacing="0" cellpadding="0" bgcolor="#2b2c2c" align="center" class="es-header-body" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#2B2C2C;width:600px" role="none">
             <tr style="border-collapse:collapse">
              <td align="left" style="padding:10px;Margin:0">
               <table width="100%" cellspacing="0" cellpadding="0" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                 <tr style="border-collapse:collapse">
                  <td valign="top" align="center" style="padding:0;Margin:0;width:580px">
                   <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                     <tr style="border-collapse:collapse">
                      <td align="center" style="padding:10px;Margin:0;font-size:0"><a href="https://devsomeware.com" target="_blank" style="mso-line-height-rule:exactly;text-decoration:underline;font-family:arial, 'helvetica neue', helvetica, sans-serif;font-size:14px;color:#DBDBDB"><img src="https://ekflden.stripocdn.email/content/guids/CABINET_59434c66956f55e33a5791d2cb0f5ec455b3347669e1d2e7337dca5ce27385f7/images/dev.png" alt="" title="Automotive logo" width="560" class="adapt-img" style="display:block;font-size:14px;border:0;outline:none;text-decoration:none"></a></td>
                     </tr>
                   </table></td>
                 </tr>
               </table></td>
             </tr>
             <tr style="border-collapse:collapse">
              <td bgcolor="#e2e3e3" align="left" style="padding:0;Margin:0;padding-top:10px;padding-bottom:10px;background-color:#E2E3E3">
               <table width="100%" cellspacing="0" cellpadding="0" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                 <tr style="border-collapse:collapse">
                  <td valign="top" align="center" style="padding:0;Margin:0;width:600px">
                   <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                     <tr style="border-collapse:collapse">
                      <td style="padding:0;Margin:0">
                       <table width="100%" cellspacing="0" cellpadding="0" class="es-menu" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                         <tr class="links" style="border-collapse:collapse">
                          <td id="esd-menu-id-0" width="20.00%" bgcolor="transparent" align="center" style="Margin:0;border:0;padding-top:0px;padding-bottom:0px;padding-right:5px;padding-left:5px">
                           <div style="vertical-align:middle;display:block">
                            <a target="_blank" href="https://viewstripo.email/" style="mso-line-height-rule:exactly;text-decoration:none;font-family:arial, 'helvetica neue', helvetica, sans-serif;font-size:14px;display:block;color:#333333"></a>
                           </div></td>
                          <td id="esd-menu-id-1" esdev-border-color="#000000" width="20.00%" bgcolor="transparent" align="center" style="Margin:0;border:0;padding-top:0px;padding-bottom:0px;padding-right:5px;padding-left:5px">
                           <div style="vertical-align:middle;display:block">
                            <a target="_blank" href="https://viewstripo.emil/" style="mso-line-height-rule:exactly;text-decoration:none;font-family:arial, 'helvetica neue', helvetica, sans-serif;font-size:14px;display:block;color:#333333"></a>
                           </div></td>
                          <td id="esd-menu-id-2" esdev-border-color="#000000" width="20.00%" bgcolor="transparent" align="center" style="Margin:0;border:0;padding-top:0px;padding-bottom:0px;padding-right:5px;padding-left:5px">
                           <div style="vertical-align:middle;display:block">
                            <a target="_blank" href="https://viewstripo.email/" style="mso-line-height-rule:exactly;text-decoration:none;font-family:arial, 'helvetica neue', helvetica, sans-serif;font-size:14px;display:block;color:#333333"></a>
                           </div></td>
                          <td id="esd-menu-id-3" esdev-border-color="#000000" width="20.00%" bgcolor="transparent" align="center" class="es-hidden" style="Margin:0;border:0;padding-top:0px;padding-bottom:0px;padding-right:5px;padding-left:5px">
                           <div style="vertical-align:middle;display:block">
                            <a target="_blank" href="https://viewstripo.email/" style="mso-line-height-rule:exactly;text-decoration:none;font-family:arial, 'helvetica neue', helvetica, sans-serif;font-size:14px;display:block;color:#333333"></a>
                           </div></td>
                          <td id="esd-menu-id-4" esdev-border-color="#000000" width="20.00%" bgcolor="transparent" align="center" class="es-hidden" style="Margin:0;border:0;padding-top:0px;padding-bottom:0px;padding-right:5px;padding-left:5px">
                           <div style="vertical-align:middle;display:block">
                            <a target="_blank" href="https://viewstripo.email/" style="mso-line-height-rule:exactly;text-decoration:none;font-family:arial, 'helvetica neue', helvetica, sans-serif;font-size:14px;display:block;color:#333333"></a>
                           </div></td>
                         </tr>
                       </table></td>
                     </tr>
                   </table></td>
                 </tr>
               </table></td>
             </tr>
           </table></td>
         </tr>
       </table>
       <table cellspacing="0" cellpadding="0" align="center" class="es-content" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;width:100%;table-layout:fixed !important">
         <tr style="border-collapse:collapse">
          <td align="center" style="padding:0;Margin:0">
           <table cellspacing="0" cellpadding="0" bgcolor="#2b2c2c" align="center" class="es-content-body" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#2B2C2C;width:600px" role="none">
             <tr style="border-collapse:collapse">
              <td bgcolor="#040404" align="left" style="padding:0;Margin:0;padding-top:20px;background-color:#040404">
               <table width="100%" cellspacing="0" cellpadding="0" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                 <tr style="border-collapse:collapse">
                  <td valign="top" align="center" style="padding:0;Margin:0;width:600px">
                   <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                     <tr style="border-collapse:collapse">
                      <td align="center" style="padding:0;Margin:0;font-size:0"><a target="_blank" href="https://viewstripo.email/" style="mso-line-height-rule:exactly;text-decoration:underline;font-family:arial, 'helvetica neue', helvetica, sans-serif;font-size:14px;color:#DE4A4A"><img src="https://ekflden.stripocdn.email/content/guids/CABINET_59434c66956f55e33a5791d2cb0f5ec455b3347669e1d2e7337dca5ce27385f7/images/poster.png" alt="" title="Father's Day Sale" width="600" class="adapt-img" style="display:block;font-size:14px;border:0;outline:none;text-decoration:none"></a></td>
                     </tr>
                   </table></td>
                 </tr>
               </table></td>
             </tr>
           </table></td>
         </tr>
       </table>
       <table cellspacing="0" cellpadding="0" align="center" class="es-content" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;width:100%;table-layout:fixed !important">
         <tr style="border-collapse:collapse">
          <td align="center" style="padding:0;Margin:0">
           <table cellspacing="0" cellpadding="0" bgcolor="#2b2c2c" align="center" class="es-content-body" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#2B2C2C;width:600px" role="none">
             <tr style="border-collapse:collapse">
              <td bgcolor="#020202" align="left" style="Margin:0;padding-top:25px;padding-right:20px;padding-bottom:30px;padding-left:20px;background-color:#020202">
               <table width="100%" cellspacing="0" cellpadding="0" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                 <tr style="border-collapse:collapse">
                  <td valign="top" align="center" style="padding:0;Margin:0;width:560px">
                   <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                     <tr style="border-collapse:collapse">
                      <td align="center" class="es-text-8857" style="Margin:0;padding-right:20px;padding-left:20px;padding-top:5px;padding-bottom:5px"><h6 class="es-m-txt-c es-text-mobile-size-42" style="Margin:0;font-family:arial, 'helvetica neue', helvetica, sans-serif;mso-line-height-rule:exactly;letter-spacing:0;font-size:42px;font-style:normal;font-weight:normal;line-height:50.4px;color:#6855e3">Registered Successfully !</h6></td>
                     </tr>
                     <tr style="border-collapse:collapse">
                      <td align="center" style="padding:0;Margin:0;padding-right:20px;padding-left:20px"><p class="es-m-txt-c" style="Margin:0;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:24px;letter-spacing:0;color:#cccccc;font-size:16px">You have successfully registered for the ZeNoTronE Event</p></td>
                     </tr>
                     <tr style="border-collapse:collapse">
                      <td align="center" style="padding:0;Margin:0;padding-right:20px;padding-left:20px"><p style="Margin:0;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:24px;letter-spacing:0;color:#A2A2A2;font-size:16px">We kindly request you to attend the event at the scheduled time, where you will have the chance to win amazing goodies and prizes.</p></td>
                     </tr>
                     <tr style="border-collapse:collapse">
                      <td align="center" style="Margin:0;padding-top:25px;padding-bottom:5px;padding-right:10px;padding-left:10px"><span class="es-button-border" style="border-style:solid;border-color:#6855e3;background:transparent;border-width:1px;display:inline-block;border-radius:7px;width:auto"><a href="https://devsomeware.com/tickets" target="_blank" class="es-button" style="mso-style-priority:100 !important;text-decoration:none !important;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;font-size:16px;color:#6855e3;padding:10px 20px 10px 20px;display:inline-block;background:transparent;border-radius:7px;font-weight:normal;font-style:normal;line-height:19.2px;width:auto;text-align:center;letter-spacing:0;mso-padding-alt:0;mso-border-alt:10px solid #2B2C2C;border-color:transparent">View Ticket</a></span></td>
                     </tr>
                   </table></td>
                 </tr>
               </table></td>
             </tr>
           </table></td>
         </tr>
       </table>
       <table cellpadding="0" cellspacing="0" align="center" class="es-footer" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;width:100%;table-layout:fixed !important;background-color:transparent;background-repeat:repeat;background-position:center top">
         <tr style="border-collapse:collapse">
          <td align="center" style="padding:0;Margin:0">
           <table cellspacing="0" cellpadding="0" bgcolor="#212121" align="center" class="es-footer-body" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#212121;width:600px" role="none">
             <tr style="border-collapse:collapse">
              <td align="left" style="Margin:0;padding-top:20px;padding-right:20px;padding-bottom:30px;padding-left:20px">
               <table width="100%" cellspacing="0" cellpadding="0" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                 <tr style="border-collapse:collapse">
                  <td valign="top" align="center" style="padding:0;Margin:0;width:560px">
                   <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                     <tr style="border-collapse:collapse">
                      <td align="center" style="padding:0;Margin:0;padding-bottom:15px;font-size:0"><a href="https://devsomeware.com/events" target="_blank" style="mso-line-height-rule:exactly;text-decoration:underline;font-family:arial, 'helvetica neue', helvetica, sans-serif;font-size:14px;color:#DBDBDB"><img src="https://ekflden.stripocdn.email/content/guids/CABINET_59434c66956f55e33a5791d2cb0f5ec455b3347669e1d2e7337dca5ce27385f7/images/zenotrone.png" alt="" title="Automotive logo" width="560" class="adapt-img" style="display:block;font-size:14px;border:0;outline:none;text-decoration:none"></a></td>
                     </tr>
                     <tr style="border-collapse:collapse">
                      <td align="center" style="padding:0;Margin:0;padding-bottom:15px;font-size:0">
                       <table cellspacing="0" cellpadding="0" class="es-table-not-adapt es-social" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                         <tr style="border-collapse:collapse">
                          <td valign="top" align="center" style="padding:0;Margin:0;padding-right:20px"><a target="_blank" href="https://x.com/DevSomware" style="mso-line-height-rule:exactly;text-decoration:underline;font-family:arial, 'helvetica neue', helvetica, sans-serif;font-size:14px;color:#DBDBDB"><img title="X" src="https://ekflden.stripocdn.email/content/assets/img/social-icons/logo-gray/x-logo-gray.png" alt="X" width="32" style="display:block;font-size:14px;border:0;outline:none;text-decoration:none"></a></td>
                          <td valign="top" align="center" style="padding:0;Margin:0;padding-right:20px"><a target="_blank" href="https://www.instagram.com/devsomeware" style="mso-line-height-rule:exactly;text-decoration:underline;font-family:arial, 'helvetica neue', helvetica, sans-serif;font-size:14px;color:#DBDBDB"><img title="Instagram" src="https://ekflden.stripocdn.email/content/assets/img/social-icons/logo-gray/instagram-logo-gray.png" alt="Inst" width="32" style="display:block;font-size:14px;border:0;outline:none;text-decoration:none"></a></td>
                          <td valign="top" align="center" style="padding:0;Margin:0;padding-right:10px"><a target="_blank" href="https://www.linkedin.com/company/devsomeware" style="mso-line-height-rule:exactly;text-decoration:underline;font-family:arial, 'helvetica neue', helvetica, sans-serif;font-size:14px;color:#DBDBDB"><img title="LinkedIn" src="https://ekflden.stripocdn.email/content/assets/img/social-icons/logo-gray/linkedin-logo-gray.png" alt="In" width="32" style="display:block;font-size:14px;border:0;outline:none;text-decoration:none"></a></td>
                          <td align="center" valign="top" style="padding:0;Margin:0;padding-right:10px"><a target="_blank" href="https://github.com/DevSomware" style="mso-line-height-rule:exactly;text-decoration:underline;font-family:arial, 'helvetica neue', helvetica, sans-serif;font-size:14px;color:#DBDBDB"><img src="https://ekflden.stripocdn.email/content/assets/img/other-icons/logo-gray/github-logo-gray.png" alt="GitHub" width="32" title="GitHub" style="display:block;font-size:14px;border:0;outline:none;text-decoration:none"></a></td>
                         </tr>
                       </table></td>
                     </tr>
                     <tr style="border-collapse:collapse">
                      <td align="center" style="padding:0;Margin:0"><p style="Margin:0;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:19.5px;letter-spacing:0;color:#A2A2A2;font-size:13px"><br></p></td>
                     </tr>
                     <tr style="border-collapse:collapse">
                      <td align="center" style="padding:0;Margin:0;padding-top:5px"><p style="Margin:0;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:19.5px;letter-spacing:0;color:#A2A2A2;font-size:13px">You are receiving this email because you have visited our site or asked us about regular newsletter. Make sure our messages get to your Inbox (and not your bulk or junk folders).</p></td>
                     </tr>
                   </table></td>
                 </tr>
               </table></td>
             </tr>
           </table></td>
         </tr>
       </table>
       <table cellspacing="0" cellpadding="0" align="center" class="es-footer" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;width:100%;table-layout:fixed !important;background-color:transparent;background-repeat:repeat;background-position:center top">
         <tr style="border-collapse:collapse">
          <td align="center" style="padding:0;Margin:0">
           <table cellspacing="0" cellpadding="0" align="center" class="es-footer-body" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:transparent;width:600px" role="none">
             <tr style="border-collapse:collapse">
              <td align="left" style="Margin:0;padding-right:20px;padding-bottom:30px;padding-left:20px;padding-top:30px">
               <table width="100%" cellspacing="0" cellpadding="0" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                 <tr style="border-collapse:collapse">
                  <td valign="top" align="center" style="padding:0;Margin:0;width:560px">
                   <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                     <tr style="border-collapse:collapse">
                      <td align="center" class="made_with" style="padding:0;Margin:0;font-size:0"><a target="_blank" href="https://devsomeware.com" style="mso-line-height-rule:exactly;text-decoration:underline;font-family:arial, 'helvetica neue', helvetica, sans-serif;font-size:14px;color:#DBDBDB"><img src="https://ekflden.stripocdn.email/content/guids/CABINET_59434c66956f55e33a5791d2cb0f5ec455b3347669e1d2e7337dca5ce27385f7/images/s.png" alt="" width="560" class="adapt-img" style="display:block;font-size:14px;border:0;outline:none;text-decoration:none"></a></td>
                     </tr>
                   </table></td>
                 </tr>
               </table></td>
             </tr>
           </table></td>
         </tr>
       </table></td>
     </tr>
   </table>
  </div>
 </body>
</html>
            `,
          });
          console.log('Message sent: %s', info.messageId);
    }
    
    catch(err){
        console.log(err);
    }
}