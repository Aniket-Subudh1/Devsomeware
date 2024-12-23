import { NextResponse,NextRequest } from "next/server";
import ConnectDb from "@/middleware/connectDb";
import Users from "@/models/Users";
import Cryptojs from "crypto-js";
import nodemailer from "nodemailer";
export const POST = async (req:NextRequest) => {
    try{
    await ConnectDb();
    const data = await req.json();
    const isuser = await Users.findOne({email:data.email});
    //if user already exists
    if(isuser!=null){
        return NextResponse.json({message:"User already exists with this email.",success:false});
    }
    //parse the input with zod to validate the input.
    //todo //zod validation
    const user = new Users({
        name:data.name,
        email:data.email,
        password:Cryptojs.AES.encrypt(data.password,process.env.AES_SECRET||"").toString(),
        github:data.github,
        linkedin:data.linkedin,
        intrests:data.interests,
        languages:data.languages,
        frameworks:data.frameworks,
        why:data.why,
        expectations:data.expectations
    })
    await user.save();
    //sendmail asyncronously and return user registered successfully
    handleSendMail(data.email,data.name);
    return NextResponse.json({message:"User registered successfully",success:true});
    }
    catch(err){
        console.log(err)
        return NextResponse.json({message:"Something went wrong",success:false});
    }
};


//send mail asyncronously function here
const handleSendMail = async (email:string,name:string) => {
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
            subject: "🎉 Account Created Successfully! Welcome to the DSW Community!", // Subject line
            text: "🎉 Your account has been created successfully! Welcome to the DSW Community, where innovation and growth begin. Enjoy exclusive access to resources, events, mentoring sessions, and all in-house products. Stay tuned for learn.devsomeware.com, coming soon!", // plain text body
            html: `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html dir="ltr" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">
     <head>
      <meta charset="UTF-8">
      <meta content="width=device-width, initial-scale=1" name="viewport">
      <meta name="x-apple-disable-message-reformatting">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta content="telephone=no" name="format-detection">
      <title>New Message</title><!--[if (mso 16)]>
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
    <![endif]--><!--[if !mso]><!-- -->
      <link href="https://fonts.googleapis.com/css?family=Lato:400,400i,700,700i" rel="stylesheet"><!--<![endif]-->
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
    @media only screen and (max-width:600px) {.es-m-p0r { padding-right:0px!important } .es-m-p20b { padding-bottom:20px!important } .es-m-p0l { padding-left:0px!important } .es-m-p20r { padding-right:20px!important } .es-m-p20l { padding-left:20px!important } .es-m-p10t { padding-top:10px!important } .es-m-p5b { padding-bottom:5px!important } .es-m-p0b { padding-bottom:0px!important } .es-p-default { } *[class="gmail-fix"] { display:none!important } p, a { line-height:150%!important } h1, h1 a { line-height:150%!important } h2, h2 a { line-height:150%!important } h3, h3 a { line-height:150%!important } h4, h4 a { line-height:120%!important } h5, h5 a { line-height:120%!important } h6, h6 a { line-height:120%!important } .es-header-body p { } .es-content-body p { } .es-footer-body p { } .es-infoblock p { } h1 { font-size:40px!important; text-align:left } h2 { font-size:28px!important; text-align:left } h3 { font-size:20px!important; text-align:left } h4 { font-size:24px!important; text-align:left } h5 { font-size:20px!important; text-align:left } h6 { font-size:16px!important; text-align:left } .es-header-body h1 a, .es-content-body h1 a, .es-footer-body h1 a { font-size:40px!important } .es-header-body h2 a, .es-content-body h2 a, .es-footer-body h2 a { font-size:28px!important } .es-header-body h3 a, .es-content-body h3 a, .es-footer-body h3 a { font-size:20px!important } .es-header-body h4 a, .es-content-body h4 a, .es-footer-body h4 a { font-size:24px!important } .es-header-body h5 a, .es-content-body h5 a, .es-footer-body h5 a { font-size:20px!important } .es-header-body h6 a, .es-content-body h6 a, .es-footer-body h6 a { font-size:16px!important } .es-menu td a { font-size:14px!important } .es-header-body p, .es-header-body a { font-size:14px!important } .es-content-body p, .es-content-body a { font-size:14px!important } .es-footer-body p, .es-footer-body a { font-size:14px!important } .es-infoblock p, .es-infoblock a { font-size:12px!important } .es-m-txt-c, .es-m-txt-c h1, .es-m-txt-c h2, .es-m-txt-c h3, .es-m-txt-c h4, .es-m-txt-c h5, .es-m-txt-c h6 { text-align:center!important } .es-m-txt-r, .es-m-txt-r h1, .es-m-txt-r h2, .es-m-txt-r h3, .es-m-txt-r h4, .es-m-txt-r h5, .es-m-txt-r h6 { text-align:right!important } .es-m-txt-j, .es-m-txt-j h1, .es-m-txt-j h2, .es-m-txt-j h3, .es-m-txt-j h4, .es-m-txt-j h5, .es-m-txt-j h6 { text-align:justify!important } .es-m-txt-l, .es-m-txt-l h1, .es-m-txt-l h2, .es-m-txt-l h3, .es-m-txt-l h4, .es-m-txt-l h5, .es-m-txt-l h6 { text-align:left!important } .es-m-txt-r img, .es-m-txt-c img, .es-m-txt-l img { display:inline!important } .es-m-txt-r .rollover:hover .rollover-second, .es-m-txt-c .rollover:hover .rollover-second, .es-m-txt-l .rollover:hover .rollover-second { display:inline!important } .es-m-txt-r .rollover span, .es-m-txt-c .rollover span, .es-m-txt-l .rollover span { line-height:0!important; font-size:0!important; display:block } .es-spacer { display:inline-table } a.es-button, button.es-button { font-size:18px!important; padding:10px 20px 10px 20px!important; line-height:120%!important } a.es-button, button.es-button, .es-button-border { display:inline-block!important } .es-m-fw, .es-m-fw.es-fw, .es-m-fw .es-button { display:block!important } .es-m-il, .es-m-il .es-button, .es-social, .es-social td, .es-menu { display:inline-block!important } .es-adaptive table, .es-left, .es-right { width:100%!important } .es-content table, .es-header table, .es-footer table, .es-content, .es-footer, .es-header { width:100%!important; max-width:600px!important } .adapt-img { width:100%!important; height:auto!important } .es-mobile-hidden, .es-hidden { display:none!important } .es-desk-hidden { width:auto!important; overflow:visible!important; float:none!important; max-height:inherit!important; line-height:inherit!important } tr.es-desk-hidden { display:table-row!important } table.es-desk-hidden { display:table!important } td.es-desk-menu-hidden { display:table-cell!important } .es-menu td { width:1%!important } table.es-table-not-adapt, .esd-block-html table { width:auto!important } .h-auto { height:auto!important } .es-text-6209 .es-text-mobile-size-24, .es-text-6209 .es-text-mobile-size-24 * { font-size:24px!important; line-height:150%!important } }
    @media screen and (max-width:384px) {.mail-message-content { width:414px!important } }
    </style>
     </head>
     <body class="body" style="width:100%;height:100%;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;padding:0;Margin:0">
      <div dir="ltr" class="es-wrapper-color" lang="en" style="background-color:#F6F6F6"><!--[if gte mso 9]>
                <v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="t">
                    <v:fill type="tile" color="#f6f6f6"></v:fill>
                </v:background>
            <![endif]-->
       <table width="100%" cellspacing="0" cellpadding="0" class="es-wrapper" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;padding:0;Margin:0;width:100%;height:100%;background-repeat:repeat;background-position:center top;background-color:#F6F6F6">
         <tr>
          <td valign="top" style="padding:0;Margin:0">
           <table cellspacing="0" cellpadding="0" align="center" class="es-header" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;width:100%;table-layout:fixed !important;background-color:transparent;background-repeat:repeat;background-position:center top">
             <tr>
              <td align="center" style="padding:0;Margin:0">
               <table cellspacing="0" cellpadding="0" bgcolor="#ffffff" align="center" class="es-header-body" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#010101;width:600px">
                 <tr>
                  <td align="left" data-custom-paddings="true" style="padding:0;Margin:0;padding-top:30px;padding-right:20px;padding-left:20px">
                   <table cellspacing="0" cellpadding="0" width="100%" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                     <tr>
                      <td valign="top" align="center" class="es-m-p0r" style="padding:0;Margin:0;width:560px">
                       <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                         <tr>
                          <td align="center" style="padding:0;Margin:0;font-size:0px"><a target="_blank" href="https://www.devsomeware.com" style="mso-line-height-rule:exactly;text-decoration:underline;color:#FFFFFF;font-size:14px"><img src="https://elvwyeu.stripocdn.email/content/guids/CABINET_d29021a75936f7c552e38f2b95ec649c8ce3493e7e1d9dd8bc1a5b9665ffd2c7/images/logo1.png" alt="Logo" title="Logo" width="82" class="adapt-img" style="display:block;font-size:20px;border:0;outline:none;text-decoration:none"></a></td>
                         </tr>
                       </table></td>
                     </tr>
                   </table></td>
                 </tr>
               </table></td>
             </tr>
           </table>
           <table cellspacing="0" cellpadding="0" align="center" class="es-content" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;width:100%;table-layout:fixed !important">
             <tr>
              <td align="center" style="padding:0;Margin:0">
               <table cellspacing="0" cellpadding="0" bgcolor="#030302" align="center" class="es-content-body" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#030302;width:600px" role="none">
                 <tr>
                  <td align="left" data-custom-paddings="true" style="Margin:0;padding-right:20px;padding-left:20px;padding-top:40px;padding-bottom:40px">
                   <table width="100%" cellspacing="0" cellpadding="0" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                     <tr>
                      <td valign="top" align="center" class="es-m-p0r es-m-p20b" style="padding:0;Margin:0;width:560px">
                       <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                         <tr>
                          <td align="center" style="padding:0;Margin:0;position:relative"><img src="https://elvwyeu.stripocdn.email/content/guids/bannerImgGuid/images/image17325632831564326.png" alt="DEV Someware" title="DEV Someware" width="560" height="205" class="adapt-img" style="display:block;font-size:20px;border:0;outline:none;text-decoration:none"></td>
                         </tr>
                         <tr>
                          <td align="center" style="padding:0;Margin:0;font-size:0px"><a target="_blank" href="https://www.devsomeware" style="mso-line-height-rule:exactly;text-decoration:underline;color:#FCA311;font-size:20px"><img src="https://elvwyeu.stripocdn.email/content/guids/CABINET_d29021a75936f7c552e38f2b95ec649c8ce3493e7e1d9dd8bc1a5b9665ffd2c7/images/black_friday_typography_instagram_post_2.png" alt="devsomeware" width="560" title="devsomeware" class="adapt-img" style="display:block;font-size:20px;border:0;outline:none;text-decoration:none"></a></td>
                         </tr>
                         <tr>
        <td align="left" class="es-m-p0r es-m-p0l" style="padding:0;Margin:0;padding-right:40px;padding-bottom:30px;padding-left:40px">
            <p style="Margin:0;mso-line-height-rule:exactly;font-family:lato, 'helvetica neue', helvetica, arial, sans-serif;line-height:30px;letter-spacing:0;color:#FFFFFF;font-size:20px">Hi ${name},</p>
            <p style="Margin:0;mso-line-height-rule:exactly;font-family:lato, 'helvetica neue', helvetica, arial, sans-serif;line-height:30px;letter-spacing:0;color:#FFFFFF;font-size:20px">
                Your journey to growth, learning, and innovation starts here. DevSomeware welcomes you with open arms to an inspiring community of tech enthusiasts, learners, and creators. We're excited to have you on board!
            </p>
            <p style="Margin:0;mso-line-height-rule:exactly;font-family:lato, 'helvetica neue', helvetica, arial, sans-serif;line-height:30px;letter-spacing:0;color:#FFFFFF;font-size:20px">
                Your account has been successfully created! You now have access to:
            </p>
            <ul style="Margin:0;mso-line-height-rule:exactly;font-family:lato, 'helvetica neue', helvetica, arial, sans-serif;line-height:30px;letter-spacing:0;color:#FFFFFF;font-size:20px;padding-left:20px;">
                <li>Exclusive resources and special events.</li>
                <li>Hackathons and mentoring sessions with industry experts.</li>
                <li>All DevSomeware in-house products for free.</li>
                <li>Early access to <b>learn.devsomeware.com</b> (coming soon).</li>
            </ul>
            <p style="Margin:0;mso-line-height-rule:exactly;font-family:lato, 'helvetica neue', helvetica, arial, sans-serif;line-height:30px;letter-spacing:0;color:#FFFFFF;font-size:20px">
                We are thrilled to have you as a part of our community. Let's innovate, create, and grow together! 🚀
            </p>
        </td>
    </tr>
    
                         <tr>
                          <td align="center" style="padding:0;Margin:0"><!--[if mso]><a href="https://chat.whatsapp.com/KCFLsNwapH01LdQ2u5gdy2" target="_blank" hidden>
        <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" esdevVmlButton href="https://chat.whatsapp.com/KCFLsNwapH01LdQ2u5gdy2" style="height:46px; v-text-anchor:middle; width:152px" arcsize="0%" stroke="f"  fillcolor="#9c27b0">
            <w:anchorlock></w:anchorlock>
            <center style='color:#fdfafa; font-family:lato, "helvetica neue", helvetica, arial, sans-serif; font-size:18px; font-weight:700; line-height:18px;  mso-text-raise:1px'>Join Whatsapp Group</center>
        </v:roundrect></a>
    <![endif]--><!--[if !mso]><!-- --><span class="es-button-border msohide" style="border-style:solid;border-color:#2CB543;background:#9c27b0;border-width:0px;display:inline-block;border-radius:0px;width:auto;mso-hide:all"><a href="https://chat.whatsapp.com/KCFLsNwapH01LdQ2u5gdy2" target="_blank" class="es-button" style="mso-style-priority:100 !important;text-decoration:none !important;mso-line-height-rule:exactly;color:#fdfafa;font-size:22px;padding:10px 30px 10px 30px;display:inline-block;background:#9c27b0;border-radius:0px;font-family:lato, 'helvetica neue', helvetica, arial, sans-serif;font-weight:bold;font-style:normal;line-height:26.4px;width:auto;text-align:center;letter-spacing:0;mso-padding-alt:0;mso-border-alt:10px solid #9c27b0">Join Whatsapp Group</a></span><!--<![endif]--></td>
                         </tr>
                       </table></td>
                     </tr>
                   </table></td>
                 </tr>
               </table></td>
             </tr>
           </table>
           <table cellpadding="0" cellspacing="0" align="center" class="es-content" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;width:100%;table-layout:fixed !important">
             <tr>
              <td align="center" style="padding:0;Margin:0">
               <table bgcolor="#1d1d1d" align="center" cellpadding="0" cellspacing="0" class="es-content-body" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#1d1d1d;width:600px" role="none">
                 <tr>
                  <td align="left" bgcolor="#060606" class="es-m-p0r" style="padding:0;Margin:0;padding-right:20px;background-color:#060606" data-custom-paddings="true"><!--[if mso]><table dir="ltr" cellpadding="0" cellspacing="0"><tr><td><table dir="rtl" style="width:580px" cellpadding="0" cellspacing="0"><tr><td dir="ltr" style="width:290px" valign="top"><![endif]-->
                   <table cellpadding="0" cellspacing="0" align="right" class="es-right" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:right">
                     <tr>
                      <td align="left" class="es-m-p20b" style="padding:0;Margin:0;width:290px">
                       <table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                         <tr>
                          <td align="center" class="es-m-p20r es-m-p20l" style="padding:0;Margin:0;padding-top:55px;padding-bottom:15px"><h1 class="es-m-txt-c" style="Margin:0;font-family:lato, 'helvetica neue', helvetica, arial, sans-serif;mso-line-height-rule:exactly;letter-spacing:0;font-size:50px;font-style:normal;font-weight:normal;line-height:75px;color:#9C27B0"><strong> What We Offer ? </strong></h1></td>
                         </tr>
                       </table></td>
                     </tr>
                   </table><!--[if mso]></td><td dir="ltr" style="width:20px"></td><td dir="ltr" style="width:270px" valign="top"><![endif]-->
                   <table cellpadding="0" cellspacing="0" align="left" class="es-left" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:left">
                     <tr>
                      <td align="left" style="padding:0;Margin:0;width:270px">
                       <table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                         <tr>
                          <td align="center" style="padding:0;Margin:0;font-size:0px"><a target="_blank" href="https://viewstripo.email" style="mso-line-height-rule:exactly;text-decoration:underline;color:#FCA311;font-size:20px"><img src="https://elvwyeu.stripocdn.email/content/guids/CABINET_d29021a75936f7c552e38f2b95ec649c8ce3493e7e1d9dd8bc1a5b9665ffd2c7/images/black_purple_modern_boost_productivity_class_instagram_post.png" alt="" width="270" class="adapt-img" style="display:block;font-size:20px;border:0;outline:none;text-decoration:none"></a></td>
                         </tr>
                       </table></td>
                     </tr>
                   </table><!--[if mso]></td></tr></table></td></tr></table><![endif]--></td>
                 </tr>
                 <tr>
                  <td align="left" bgcolor="#060606" class="es-m-p0l" style="padding:0;Margin:0;padding-left:20px;background-color:#060606" data-custom-paddings="true"><!--[if mso]><table style="width:580px" cellpadding="0" cellspacing="0"><tr><td style="width:230px" valign="top"><![endif]-->
                   <table cellpadding="0" cellspacing="0" align="left" class="es-left" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:left">
                     <tr>
                      <td align="left" class="es-m-p20b" style="padding:0;Margin:0;width:230px">
                       <table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                         <tr>
                          <td align="left" class="es-m-p20r es-m-p20l" style="padding:0;Margin:0;padding-top:25px;padding-bottom:5px"><h3 style="Margin:0;font-family:lato, 'helvetica neue', helvetica, arial, sans-serif;mso-line-height-rule:exactly;letter-spacing:0;font-size:24px;font-style:normal;font-weight:normal;line-height:36px;color:#9c27b0"><strong>01&nbsp; Exclusive Tech Events </strong></h3></td>
                         </tr>
                         <tr>
                          <td align="left" class="es-m-p20r es-m-p20l" style="padding:0;Margin:0"><p style="Margin:0;mso-line-height-rule:exactly;font-family:lato, 'helvetica neue', helvetica, arial, sans-serif;line-height:21px;letter-spacing:0;color:#FFFFFF;font-size:14px">Dive into workshops, webinars, and hackathons tailored to fuel your tech journey.</p></td>
                         </tr>
                         <tr>
                          <td align="left" class="es-m-p20r es-m-p20l" style="padding:0;Margin:0;padding-top:15px"><!--[if mso]><a href="https://hashnode.com/@devsomeware" target="_blank" hidden>
        <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" esdevVmlButton href="https://hashnode.com/@devsomeware" style="height:39px; v-text-anchor:middle; width:131px" arcsize="0%" stroke="f"  fillcolor="#9c27b0">
            <w:anchorlock></w:anchorlock>
            <center style='color:#fefdfd; font-family:lato, "helvetica neue", helvetica, arial, sans-serif; font-size:14px; font-weight:700; line-height:14px;  mso-text-raise:1px'>More Info</center>
        </v:roundrect></a>
    <![endif]--><!--[if !mso]><!-- --><span class="es-button-border msohide" style="border-style:solid;border-color:#2CB543;background:#9c27b0;border-width:0px;display:inline-block;border-radius:0px;width:auto;mso-hide:all"><a href="https://hashnode.com/@devsomeware" target="_blank" class="es-button" style="mso-style-priority:100 !important;text-decoration:none !important;mso-line-height-rule:exactly;color:#fefdfd;font-size:16px;padding:10px 30px 10px 30px;display:inline-block;background:#9c27b0;border-radius:0px;font-family:lato, 'helvetica neue', helvetica, arial, sans-serif;font-weight:bold;font-style:normal;line-height:19.2px;width:auto;text-align:center;letter-spacing:0;mso-padding-alt:0;mso-border-alt:10px solid #9c27b0">More Info</a></span><!--<![endif]--></td>
                         </tr>
                       </table></td>
                     </tr>
                     <tr>
                      <td align="left" class="es-m-p20b" style="padding:0;Margin:0;width:230px">
                       <table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                         <tr>
                          <td align="left" class="es-m-p20r es-m-p20l" style="padding:0;Margin:0;padding-top:25px;padding-bottom:5px"><h3 style="Margin:0;font-family:lato, 'helvetica neue', helvetica, arial, sans-serif;mso-line-height-rule:exactly;letter-spacing:0;font-size:24px;font-style:normal;font-weight:normal;line-height:36px;color:#9c27b0"><strong>02&nbsp; Resources &amp; Mentorship </strong></h3></td>
                         </tr>
                         <tr>
                          <td align="left" class="es-m-p20r es-m-p20l" style="padding:0;Margin:0"><p style="Margin:0;mso-line-height-rule:exactly;font-family:lato, 'helvetica neue', helvetica, arial, sans-serif;line-height:21px;letter-spacing:0;color:#FFFFFF;font-size:14px">Access premium learning materials and connect with mentors guiding you to success.</p></td>
                         </tr>
                         <tr>
                          <td align="left" class="es-m-p20r es-m-p20l" style="padding:0;Margin:0;padding-top:15px"><!--[if mso]><a href="https://hashnode.com/@devsomeware" target="_blank" hidden>
        <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" esdevVmlButton href="https://hashnode.com/@devsomeware" style="height:39px; v-text-anchor:middle; width:131px" arcsize="0%" stroke="f"  fillcolor="#9c27b0">
            <w:anchorlock></w:anchorlock>
            <center style='color:#fefdfd; font-family:lato, "helvetica neue", helvetica, arial, sans-serif; font-size:14px; font-weight:700; line-height:14px;  mso-text-raise:1px'>More Info</center>
        </v:roundrect></a>
    <![endif]--><!--[if !mso]><!-- --><span class="es-button-border msohide" style="border-style:solid;border-color:#2CB543;background:#9c27b0;border-width:0px;display:inline-block;border-radius:0px;width:auto;mso-hide:all"><a href="https://hashnode.com/@devsomeware" target="_blank" class="es-button" style="mso-style-priority:100 !important;text-decoration:none !important;mso-line-height-rule:exactly;color:#fefdfd;font-size:16px;padding:10px 30px 10px 30px;display:inline-block;background:#9c27b0;border-radius:0px;font-family:lato, 'helvetica neue', helvetica, arial, sans-serif;font-weight:bold;font-style:normal;line-height:19.2px;width:auto;text-align:center;letter-spacing:0;mso-padding-alt:0;mso-border-alt:10px solid #9c27b0">More Info</a></span><!--<![endif]--></td>
                         </tr>
                       </table></td>
                     </tr>
                     <tr>
                      <td align="left" class="es-m-p20b" style="padding:0;Margin:0;width:230px">
                       <table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                         <tr>
                          <td align="left" class="es-m-p20r es-m-p20l es-text-6209" style="padding:0;Margin:0;padding-top:25px;padding-bottom:5px"><h3 style="Margin:0;font-family:lato, 'helvetica neue', helvetica, arial, sans-serif;mso-line-height-rule:exactly;letter-spacing:0;font-size:24px;font-style:normal;font-weight:normal;line-height:36px;color:#9c27b0"><strong><span class="es-text-mobile-size-24" style="font-size:24px">03&nbsp; Networking Opportunities</span> </strong></h3></td>
                         </tr>
                         <tr>
                          <td align="left" class="es-m-p20r es-m-p20l" style="padding:0;Margin:0"><p style="Margin:0;mso-line-height-rule:exactly;font-family:lato, 'helvetica neue', helvetica, arial, sans-serif;line-height:21px;letter-spacing:0;color:#FFFFFF;font-size:14px">Collaborate and engage with like-minded individuals and industry leaders.</p></td>
                         </tr>
                         <tr>
                          <td align="left" class="es-m-p20r es-m-p20l" style="padding:0;Margin:0;padding-top:15px"><!--[if mso]><a href="https://hashnode.com/@devsomeware" target="_blank" hidden>
        <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" esdevVmlButton href="https://hashnode.com/@devsomeware" style="height:39px; v-text-anchor:middle; width:131px" arcsize="0%" stroke="f"  fillcolor="#9c27b0">
            <w:anchorlock></w:anchorlock>
            <center style='color:#fefdfd; font-family:lato, "helvetica neue", helvetica, arial, sans-serif; font-size:14px; font-weight:700; line-height:14px;  mso-text-raise:1px'>More Info</center>
        </v:roundrect></a>
    <![endif]--><!--[if !mso]><!-- --><span class="es-button-border msohide" style="border-style:solid;border-color:#2CB543;background:#9c27b0;border-width:0px;display:inline-block;border-radius:0px;width:auto;mso-hide:all"><a href="https://hashnode.com/@devsomeware" target="_blank" class="es-button" style="mso-style-priority:100 !important;text-decoration:none !important;mso-line-height-rule:exactly;color:#fefdfd;font-size:16px;padding:10px 30px 10px 30px;display:inline-block;background:#9c27b0;border-radius:0px;font-family:lato, 'helvetica neue', helvetica, arial, sans-serif;font-weight:bold;font-style:normal;line-height:19.2px;width:auto;text-align:center;letter-spacing:0;mso-padding-alt:0;mso-border-alt:10px solid #9c27b0">More Info</a></span><!--<![endif]--></td>
                         </tr>
                       </table></td>
                     </tr>
                   </table><!--[if mso]></td><td style="width:20px"></td><td style="width:330px" valign="top"><![endif]-->
                   <table cellpadding="0" cellspacing="0" align="right" class="es-right" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:right">
                     <tr>
                      <td align="left" style="padding:0;Margin:0;width:330px">
                       <table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                         <tr>
                          <td align="center" style="padding:0;Margin:0;padding-top:30px;font-size:0"><img src="https://elvwyeu.stripocdn.email/content/guids/CABINET_d29021a75936f7c552e38f2b95ec649c8ce3493e7e1d9dd8bc1a5b9665ffd2c7/images/purple_quote_instagram_post_1.png" alt="" height="589" class="adapt-img" style="display:block;font-size:20px;border:0;outline:none;text-decoration:none;border-radius:1px"></td>
                         </tr>
                       </table></td>
                     </tr>
                   </table><!--[if mso]></td></tr></table><![endif]--></td>
                 </tr>
               </table></td>
             </tr>
           </table>
           <table cellpadding="0" cellspacing="0" align="center" class="es-content" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;width:100%;table-layout:fixed !important">
             <tr>
              <td align="center" style="padding:0;Margin:0">
               <table bgcolor="#030302" align="center" cellpadding="0" cellspacing="0" class="es-content-body" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#030302;width:600px" role="none">
                 <tr>
                  <td align="left" data-custom-paddings="true" style="padding:0;Margin:0;padding-right:20px;padding-left:20px;padding-top:40px">
                   <table cellpadding="0" cellspacing="0" width="100%" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                     <tr>
                      <td align="center" valign="top" style="padding:0;Margin:0;width:560px">
                       <table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                         <tr>
                          <td align="center" style="padding:0;Margin:0"><h2 style="Margin:0;font-family:lato, 'helvetica neue', helvetica, arial, sans-serif;mso-line-height-rule:exactly;letter-spacing:0;font-size:34px;font-style:normal;font-weight:normal;line-height:51px;color:#9c27b0"><strong> How to Join the DevSomeware Community. </strong></h2></td>
                         </tr>
                       </table></td>
                     </tr>
                   </table></td>
                 </tr>
                 <tr>
                  <td align="left" class="esdev-adapt-off" data-custom-paddings="true" style="Margin:0;padding-right:20px;padding-left:20px;padding-top:20px;padding-bottom:10px">
                   <table cellpadding="0" cellspacing="0" class="esdev-mso-table" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;width:560px">
                     <tr>
                      <td valign="top" class="esdev-mso-td" style="padding:0;Margin:0">
                       <table cellpadding="0" cellspacing="0" align="left" class="es-left" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:left">
                         <tr>
                          <td align="center" class="es-m-p0r" style="padding:0;Margin:0;width:61px">
                           <table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                             <tr>
                              <td align="center" style="padding:0;Margin:0"><h1 style="Margin:0;font-family:lato, 'helvetica neue', helvetica, arial, sans-serif;mso-line-height-rule:exactly;letter-spacing:0;font-size:50px;font-style:normal;font-weight:normal;line-height:75px;color:#9c27b0">1</h1></td>
                             </tr>
                           </table></td>
                         </tr>
                       </table></td>
                      <td style="padding:0;Margin:0;width:20px"></td>
                      <td valign="top" class="esdev-mso-td" style="padding:0;Margin:0">
                       <table cellpadding="0" cellspacing="0" align="right" class="es-right" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:right">
                         <tr>
                          <td align="center" style="padding:0;Margin:0;width:479px">
                           <table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                             <tr>
                              <td align="left" class="es-m-p10t es-m-p5b" style="padding:0;Margin:0;padding-top:20px;padding-bottom:20px"><p style="Margin:0;mso-line-height-rule:exactly;font-family:lato, 'helvetica neue', helvetica, arial, sans-serif;line-height:30px;letter-spacing:0;color:#FFFFFF;font-size:20px"><strong> Visit our official website . </strong></p></td>
                             </tr>
                           </table></td>
                         </tr>
                       </table></td>
                     </tr>
                   </table></td>
                 </tr>
                 <tr>
                  <td align="left" data-custom-paddings="true" style="Margin:0;padding-right:20px;padding-left:20px;padding-bottom:10px;padding-top:10px">
                   <table cellpadding="0" cellspacing="0" width="100%" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                     <tr>
                      <td align="center" valign="top" style="padding:0;Margin:0;width:560px">
                       <table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                         <tr>
                          <td align="center" style="padding:0;Margin:0;padding-bottom:10px;padding-top:10px;font-size:0">
                           <table border="0" width="100%" height="100%" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                             <tr>
                              <td style="padding:0;Margin:0;border-bottom:1px solid #999999;background:unset;height:1px;width:100%;margin:0px"></td>
                             </tr>
                           </table></td>
                         </tr>
                       </table></td>
                     </tr>
                   </table></td>
                 </tr>
                 <tr>
                  <td align="left" class="esdev-adapt-off" data-custom-paddings="true" style="Margin:0;padding-right:20px;padding-left:20px;padding-bottom:10px;padding-top:10px">
                   <table cellpadding="0" cellspacing="0" class="esdev-mso-table" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;width:560px">
                     <tr>
                      <td valign="top" class="esdev-mso-td" style="padding:0;Margin:0">
                       <table cellpadding="0" cellspacing="0" align="left" class="es-left" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:left">
                         <tr>
                          <td align="center" class="es-m-p0r" style="padding:0;Margin:0;width:61px">
                           <table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                             <tr>
                              <td align="center" style="padding:0;Margin:0"><h1 style="Margin:0;font-family:lato, 'helvetica neue', helvetica, arial, sans-serif;mso-line-height-rule:exactly;letter-spacing:0;font-size:50px;font-style:normal;font-weight:normal;line-height:75px;color:#9c27b0">2</h1></td>
                             </tr>
                           </table></td>
                         </tr>
                       </table></td>
                      <td style="padding:0;Margin:0;width:20px"></td>
                      <td valign="top" class="esdev-mso-td" style="padding:0;Margin:0">
                       <table cellpadding="0" cellspacing="0" align="right" class="es-right" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:right">
                         <tr>
                          <td align="center" style="padding:0;Margin:0;width:479px">
                           <table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                             <tr>
                              <td align="left" class="es-m-p10t es-m-p5b" style="padding:0;Margin:0;padding-top:20px;padding-bottom:20px"><p style="Margin:0;mso-line-height-rule:exactly;font-family:lato, 'helvetica neue', helvetica, arial, sans-serif;line-height:30px;letter-spacing:0;color:#FFFFFF;font-size:20px">Follow our all Social Media Handles.</p></td>
                             </tr>
                           </table></td>
                         </tr>
                       </table></td>
                     </tr>
                   </table></td>
                 </tr>
                 <tr>
                  <td align="left" data-custom-paddings="true" style="Margin:0;padding-right:20px;padding-left:20px;padding-bottom:10px;padding-top:10px">
                   <table cellpadding="0" cellspacing="0" width="100%" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                     <tr>
                      <td align="center" valign="top" style="padding:0;Margin:0;width:560px">
                       <table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                         <tr>
                          <td align="center" style="padding:0;Margin:0;padding-bottom:10px;padding-top:10px;font-size:0">
                           <table border="0" width="100%" height="100%" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                             <tr>
                              <td style="padding:0;Margin:0;border-bottom:1px solid #999999;background:unset;height:1px;width:100%;margin:0px"></td>
                             </tr>
                           </table></td>
                         </tr>
                       </table></td>
                     </tr>
                   </table></td>
                 </tr>
                 <tr>
                  <td align="left" class="esdev-adapt-off" data-custom-paddings="true" style="Margin:0;padding-right:20px;padding-left:20px;padding-bottom:20px;padding-top:10px">
                   <table cellpadding="0" cellspacing="0" class="esdev-mso-table" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;width:560px">
                     <tr>
                      <td valign="top" class="esdev-mso-td" style="padding:0;Margin:0">
                       <table cellpadding="0" cellspacing="0" align="left" class="es-left" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:left">
                         <tr>
                          <td align="center" class="es-m-p0r" style="padding:0;Margin:0;width:61px">
                           <table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                             <tr>
                              <td align="center" style="padding:0;Margin:0"><h1 style="Margin:0;font-family:lato, 'helvetica neue', helvetica, arial, sans-serif;mso-line-height-rule:exactly;letter-spacing:0;font-size:50px;font-style:normal;font-weight:normal;line-height:75px;color:#9c27b0">3</h1></td>
                             </tr>
                           </table></td>
                         </tr>
                       </table></td>
                      <td style="padding:0;Margin:0;width:20px"></td>
                      <td valign="top" class="esdev-mso-td" style="padding:0;Margin:0">
                       <table cellpadding="0" cellspacing="0" align="right" class="es-right" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:right">
                         <tr>
                          <td align="center" style="padding:0;Margin:0;width:479px">
                           <table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                             <tr>
                              <td align="left" class="es-m-p10t es-m-p0b" style="padding:0;Margin:0;padding-right:40px;padding-bottom:5px;padding-top:5px"><p style="Margin:0;mso-line-height-rule:exactly;font-family:lato, 'helvetica neue', helvetica, arial, sans-serif;line-height:30px;letter-spacing:0;color:#FFFFFF;font-size:20px">Join our WhatsApp community by clicking on the&nbsp;</p><p style="Margin:0;mso-line-height-rule:exactly;font-family:lato, 'helvetica neue', helvetica, arial, sans-serif;line-height:30px;letter-spacing:0;color:#FFFFFF;font-size:20px">Join Now Button.</p></td>
                             </tr>
                           </table></td>
                         </tr>
                       </table></td>
                     </tr>
                   </table></td>
                 </tr>
                 <tr>
                  <td align="left" data-custom-paddings="true" style="Margin:0;padding-right:20px;padding-left:20px;padding-bottom:40px;padding-top:20px">
                   <table cellpadding="0" cellspacing="0" width="100%" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                     <tr>
                      <td align="center" valign="top" style="padding:0;Margin:0;width:560px">
                       <table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                         <tr>
                          <td align="center" style="padding:0;Margin:0;padding-bottom:20px"><!--[if mso]><a href="https://www.devsomeware.com/" target="_blank" hidden>
        <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" esdevVmlButton href="https://www.devsomeware.com/" style="height:46px; v-text-anchor:middle; width:236px" arcsize="0%" stroke="f"  fillcolor="#9c27b0">
            <w:anchorlock></w:anchorlock>
            <center style='color:#010101; font-family:lato, "helvetica neue", helvetica, arial, sans-serif; font-size:18px; font-weight:700; line-height:18px;  mso-text-raise:1px'>Visit Our Website</center>
        </v:roundrect></a>
    <![endif]--><!--[if !mso]><!-- --><span class="es-button-border msohide" style="border-style:solid;border-color:#2CB543;background:#9c27b0;border-width:0px;display:inline-block;border-radius:0px;width:auto;mso-hide:all"><a href="https://www.devsomeware.com/" target="_blank" class="es-button" style="mso-style-priority:100 !important;text-decoration:none !important;mso-line-height-rule:exactly;color:#ffffff;font-size:22px;padding:10px 30px 10px 30px;display:inline-block;background:#9c27b0;border-radius:0px;font-family:lato, 'helvetica neue', helvetica, arial, sans-serif;font-weight:bold;font-style:normal;line-height:26.4px;width:auto;text-align:center;letter-spacing:0;mso-padding-alt:0;mso-border-alt:10px solid #9c27b0">Visit Our Website</a></span><!--<![endif]--></td>
                         </tr>
                       </table></td>
                     </tr>
                   </table></td>
                 </tr>
               </table></td>
             </tr>
           </table>
           <table cellpadding="0" cellspacing="0" align="center" class="es-content" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;width:100%;table-layout:fixed !important">
             <tr>
              <td align="center" style="padding:0;Margin:0">
               <table bgcolor="#ffffff" align="center" cellpadding="0" cellspacing="0" class="es-content-body" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#030302;width:600px">
                 <tr>
                  <td align="left" data-custom-paddings="true" style="padding:20px;Margin:0"><!--[if mso]><table style="width:560px" cellpadding="0" cellspacing="0"><tr><td style="width:290px" valign="top"><![endif]-->
                   <table cellpadding="0" cellspacing="0" align="left" class="es-left" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:left">
                     <tr>
                      <td align="center" class="es-m-p0r es-m-p20b" style="padding:0;Margin:0;width:270px">
                       <table cellpadding="0" cellspacing="0" width="100%" bgcolor="#1d1d1d" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#1d1d1d" role="presentation">
                         <tr>
                          <td align="center" bgcolor="#020202" style="Margin:0;padding-top:20px;padding-bottom:20px;padding-right:10px;padding-left:10px"><h1 class="es-m-txt-c" style="Margin:0;font-family:lato, 'helvetica neue', helvetica, arial, sans-serif;mso-line-height-rule:exactly;letter-spacing:0;font-size:51px;font-style:normal;font-weight:normal;line-height:76.5px;color:#9c27b0"><span style="background:#000000">Stay connected with us</span></h1></td>
                         </tr>
                       </table></td>
                      <td class="es-hidden" style="padding:0;Margin:0;width:20px"></td>
                     </tr>
                   </table><!--[if mso]></td><td style="width:125px" valign="top"><![endif]-->
                   <table cellpadding="0" cellspacing="0" align="left" class="es-left" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:left">
                     <tr>
                      <td align="center" class="es-m-p20b" style="padding:0;Margin:0;width:125px">
                       <table cellpadding="0" cellspacing="0" width="100%" bgcolor="#0b5394" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#0b5394" role="presentation">
                         <tr>
                          <td align="center" style="padding:30px;Margin:0;font-size:0">
                           <table cellpadding="0" cellspacing="0" class="es-table-not-adapt es-social" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                             <tr>
                              <td align="center" valign="top" style="padding:0;Margin:0"><a target="_blank" href="https://www.linkedin.com/company/devsomeware/" style="mso-line-height-rule:exactly;text-decoration:underline;color:#FCA311;font-size:20px"><img title="LinkedIn" width="64" src="https://elvwyeu.stripocdn.email/content/assets/img/social-icons/circle-colored/linkedin-circle-colored.png" alt="In" style="display:block;font-size:20px;border:0;outline:none;text-decoration:none"></a></td>
                             </tr>
                           </table></td>
                         </tr>
                       </table></td>
                     </tr>
                     <tr class="es-mobile-hidden">
                      <td align="center" class="es-m-p20b" style="padding:0;Margin:0;width:125px">
                       <table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                         <tr>
                          <td align="center" height="20" style="padding:0;Margin:0"></td>
                         </tr>
                       </table></td>
                     </tr>
                     <tr>
                      <td align="center" class="es-m-p20b" style="padding:0;Margin:0;width:125px">
                       <table cellpadding="0" cellspacing="0" width="100%" bgcolor="#741b47" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#741b47" role="presentation">
                         <tr>
                          <td align="center" style="padding:30px;Margin:0;font-size:0">
                           <table cellpadding="0" cellspacing="0" class="es-table-not-adapt es-social" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                             <tr>
                              <td align="center" valign="top" style="padding:0;Margin:0"><a target="_blank" href="https://www.instagram.com/devsomeware/" style="mso-line-height-rule:exactly;text-decoration:underline;color:#FCA311;font-size:20px"><img src="https://elvwyeu.stripocdn.email/content/assets/img/social-icons/circle-colored/instagram-circle-colored.png" alt="Ig" title="Instagram" width="64" style="display:block;font-size:20px;border:0;outline:none;text-decoration:none"></a></td>
                             </tr>
                           </table></td>
                         </tr>
                       </table></td>
                     </tr>
                   </table><!--[if mso]></td><td style="width:20px"></td><td style="width:125px" valign="top"><![endif]-->
                   <table cellpadding="0" cellspacing="0" align="right" class="es-right" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:right">
                     <tr>
                      <td align="center" style="padding:0;Margin:0;width:125px">
                       <table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                         <tr>
                          <td align="center" bgcolor="#110e0e" style="padding:30px;Margin:0;font-size:0px;background-color:#1d1d1d">
                           <table cellpadding="0" cellspacing="0" class="es-table-not-adapt es-social" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                             <tr>
                              <td align="center" valign="top" style="padding:0;Margin:0"><a target="_blank" href="https://github.com/DevSomware" style="mso-line-height-rule:exactly;text-decoration:underline;color:#FCA311;font-size:20px"><img alt="GitHub" title="GitHub" width="64" src="https://elvwyeu.stripocdn.email/content/assets/img/other-icons/circle-colored/github-circle-colored.png" style="display:block;font-size:20px;border:0;outline:none;text-decoration:none"></a></td>
                             </tr>
                           </table></td>
                         </tr>
                         <tr>
                          <td align="center" height="20" style="padding:0;Margin:0"></td>
                         </tr>
                         <tr>
                          <td bgcolor="#110e0e" align="center" style="padding:30px;Margin:0;background-color:#1d1d1d;font-size:0px">
                           <table cellpadding="0" cellspacing="0" class="es-table-not-adapt es-social" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                             <tr>
                              <td align="center" valign="top" style="padding:0;Margin:0"><a href="https://discord.gg/WPRkBuz8" target="_blank" style="mso-line-height-rule:exactly;text-decoration:underline;color:#FCA311;font-size:20px"><img title="Discord" width="64" src="https://elvwyeu.stripocdn.email/content/assets/img/messenger-icons/circle-colored/discort-circle-colored.png" alt="Discord" style="display:block;font-size:20px;border:0;outline:none;text-decoration:none"></a></td>
                             </tr>
                           </table></td>
                         </tr>
                       </table></td>
                     </tr>
                   </table><!--[if mso]></td></tr></table><![endif]--></td>
                 </tr>
               </table></td>
             </tr>
           </table>
           <table cellpadding="0" cellspacing="0" align="center" class="es-footer" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;width:100%;table-layout:fixed !important;background-color:transparent;background-repeat:repeat;background-position:center top">
             <tr>
              <td align="center" style="padding:0;Margin:0">
               <table cellspacing="0" cellpadding="0" bgcolor="#ffffff" align="center" class="es-footer-body" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#030302;width:600px">
                 <tr>
                  <td align="left" data-custom-paddings="true" style="Margin:0;padding-right:20px;padding-left:20px;padding-top:35px;padding-bottom:35px"><!--[if mso]><table style="width:560px" cellpadding="0" 
                            cellspacing="0"><tr><td style="width:232px" valign="top"><![endif]-->
                   <table cellspacing="0" cellpadding="0" align="left" class="es-left" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:left">
                     <tr>
                      <td align="left" class="es-m-p20b" style="padding:0;Margin:0;width:232px">
                       <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                         <tr>
                          <td align="left" style="padding:0;Margin:0"><h2 style="Margin:0;font-family:lato, 'helvetica neue', helvetica, arial, sans-serif;mso-line-height-rule:exactly;letter-spacing:0;font-size:34px;font-style:normal;font-weight:normal;line-height:51px;color:#9c27b0">Contact Us</h2></td>
                         </tr>
                         <tr>
                          <td align="left" style="padding:0;Margin:0;padding-bottom:5px;padding-top:10px"><p style="Margin:0;mso-line-height-rule:exactly;font-family:lato, 'helvetica neue', helvetica, arial, sans-serif;line-height:21px;letter-spacing:0;color:#FFFFFF;font-size:14px"><a target="_blank" href="mailto:info@examplefoodl.com" style="mso-line-height-rule:exactly;text-decoration:none;color:#FCA311;font-size:14px">support@devsomeware.com</a></p></td>
                         </tr>
                         <tr>
                          <td align="left" style="padding:0;Margin:0;padding-bottom:5px;padding-top:5px"><p style="Margin:0;mso-line-height-rule:exactly;font-family:lato, 'helvetica neue', helvetica, arial, sans-serif;line-height:21px;letter-spacing:0;color:#FFFFFF;font-size:14px">Bhubaneswar, Odisha,</p><p style="Margin:0;mso-line-height-rule:exactly;font-family:lato, 'helvetica neue', helvetica, arial, sans-serif;line-height:21px;letter-spacing:0;color:#FFFFFF;font-size:14px">India.</p></td>
                         </tr>
                       </table></td>
                     </tr>
                   </table><!--[if mso]></td><td style="width:20px"></td><td style="width:308px" valign="top"><![endif]-->
                   <table cellspacing="0" cellpadding="0" align="right" class="es-right" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:right">
                     <tr>
                      <td align="left" style="padding:0;Margin:0;width:308px">
                       <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                         <tr>
                          <td align="center" style="padding:0;Margin:0"><h2 style="Margin:0;font-family:lato, 'helvetica neue', helvetica, arial, sans-serif;mso-line-height-rule:exactly;letter-spacing:0;font-size:34px;font-style:normal;font-weight:normal;line-height:51px;color:#9c27b0">Visit Now!</h2></td>
                         </tr>
                         <tr>
                          <td align="center" style="padding:0;Margin:0;padding-bottom:5px;padding-top:5px"><p style="Margin:0;mso-line-height-rule:exactly;font-family:lato, 'helvetica neue', helvetica, arial, sans-serif;line-height:21px;letter-spacing:0;color:#FFFFFF;font-size:14px">Follow us on our platforms to stay updated on everything tech</p></td>
                         </tr>
                       </table></td>
                     </tr>
                   </table><!--[if mso]></td></tr></table><![endif]--></td>
                 </tr>
               </table></td>
             </tr>
           </table>
           <table cellspacing="0" cellpadding="0" align="center" class="es-footer" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;width:100%;table-layout:fixed !important;background-color:transparent;background-repeat:repeat;background-position:center top">
             <tr>
              <td align="center" style="padding:0;Margin:0">
               <table cellspacing="0" cellpadding="0" bgcolor="#ffffff" align="center" class="es-footer-body" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#030302;width:600px">
                 <tr>
                  <td align="left" data-custom-paddings="true" style="Margin:0;padding-right:20px;padding-left:20px;padding-top:20px;padding-bottom:20px">
                   <table cellspacing="0" cellpadding="0" width="100%" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                     <tr>
                      <td align="left" style="padding:0;Margin:0;width:560px">
                       <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                         <tr>
                          <td align="center" class="es-infoblock made_with" style="padding:0;Margin:0;font-size:0"><a target="_blank" href="https://viewstripo.email/?utm_source=templates&utm_medium=email&utm_campaign=black_friday_4&utm_content=unwrap_delicious_deals" style="mso-line-height-rule:exactly;text-decoration:underline;color:#CCCCCC;font-size:12px"><img src="https://elvwyeu.stripocdn.email/content/guids/CABINET_d29021a75936f7c552e38f2b95ec649c8ce3493e7e1d9dd8bc1a5b9665ffd2c7/images/s.png" alt="" width="155" class="adapt-img" style="display:block;font-size:20px;border:0;outline:none;text-decoration:none"></a></td>
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
    </html>`, // html body
          });
          console.log('Message sent: %s', info.messageId);
    }
    
    catch(err){
        console.log(err);
    }
}
