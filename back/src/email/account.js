const mailjet = require('node-mailjet').connect(process.env.MAILJET_PUBLIC_KEY, process.env.MAILJET_PRIVATE_KEY)

const sendWelcomeEmail = (email, name) => {
    mailjet.post("send", {'version': 'v3.1'}).request({
        "Messages":[{
            "From": {
                "Email": "yanakushneriova@gmail.com",
                "Name": "Task-Manager"
            },
            "To": [{
                "Email": email
            }],
            "Subject": "Task-Manager service",
            "TextPart": "Thanks for joining our service!",
            "HTMLPart": "<h3>Dear " + name + ",<br>welcome to the Task-Manager service!</h3><br />Hope you will enjoy it!"
        }]
    })
}

const sendCancelationEmail = (email, name) => {
    mailjet.post("send", {'version': 'v3.1'}).request({
        "Messages":[{
            "From": {
                "Email": "yanakushneriova@gmail.com",
                "Name": "Task-Manager"
            },
            "To": [{
                "Email": email
            }],
            "Subject": "Task-Manager service",
            "TextPart": "Dear user, your account is cancelled! We are really sorry to see you go!",
            "HTMLPart": "<h3>Hi " + name + ",<br></h3><br />This email confirms that your account was cancelled. We are really sorry. Thanks for being our customer.<br>Help us improve: <a>pomogite.pzh</a>"
        }]
    })
}

module.exports = {
    sendWelcomeEmail,
    sendCancelationEmail
}
