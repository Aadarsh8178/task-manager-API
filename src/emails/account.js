const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email,name)=>{
    sgMail.send({
        to : email,
        from : 'vaadarsh@gmail.com',
        subject : 'Welcome email',
        text : `Hey!! ${name} Welcome to the app,Let me know how can i help you with the app`
    })
}
const sendCancellationEmail = (email,name)=>{
    sgMail.send({
        to : email,
        from : 'vaadarsh@gmail.com',
        subject : 'Account Cancellation email',
        text : `Hey! ${name} sorry for the inconvenience let me know what went wrong` 
    })
}

module.exports = {
    sendWelcomeEmail,
    sendCancellationEmail
}