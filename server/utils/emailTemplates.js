const baseTemplate = (title, content) => {
    return `
    <div style="font-family: Arial, sans-serif; background-color:#f4f4f7; padding:20px;">
        <div style="max-width:500px; margin:auto; background:white; border-radius:12px; overflow:hidden; box-shadow:0 5px 15px rgba(0,0,0,0.05);">

            <!-- HEADER -->
            <div style="background: linear-gradient(90deg, #f00073, #833ab4, #fd1d1d); padding:20px; text-align:center; color:white;">
                <h2 style="margin:0;">SocialApp</h2>
            </div>

            <!-- BODY -->
            <div style="padding:30px; text-align:center;">
                <h3 style="margin-bottom:15px;">${title}</h3>
                <p style="color:#555; margin-bottom:25px;">
                    ${content.text}
                </p>

                <a href="${content.buttonLink}" 
                   style="
                        display:inline-block;
                        padding:12px 20px;
                        background:linear-gradient(90deg,#f00073,#833ab4);
                        color:white;
                        text-decoration:none;
                        border-radius:8px;
                        font-weight:bold;
                   ">
                    ${content.buttonText}
                </a>

                <p style="margin-top:20px; font-size:12px; color:#999;">
                    If the button doesn’t work, use this link:<br/>
                    <a href="${content.buttonLink}">${content.buttonLink}</a>
                </p>
            </div>

            <!-- FOOTER -->
            <div style="padding:15px; text-align:center; font-size:12px; color:#aaa;">
                © ${new Date().getFullYear()} SocialApp. All rights reserved.
            </div>

        </div>
    </div>
    `;
};

const verificationEmailTemplate = (username, link) => {
    return baseTemplate("Verify your email", {
        text: `Hi ${username}, welcome to SocialApp! Please verify your email to activate your account.`,
        buttonText: "Verify Email",
        buttonLink: link,
    });
};

const resetPasswordTemplate = (username, link) => {
    return baseTemplate("Reset your password", {
        text: `Hi ${username}, click below to reset your password. This link expires in 15 minutes.`,
        buttonText: "Reset Password",
        buttonLink: link,
    });
};


module.exports = {
    verificationEmailTemplate,
    resetPasswordTemplate,
};