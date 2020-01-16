To run program on localhost
Run the progrom using below command in sequence

        yarn install
        yarn run server

.env file should have this fields
        SENDGRID_API_KEY
        MONGO_URI

        //for cloud config
        CLOUD_NAME
        API_KEY
        API_SECRET

        JWT_SECRET
        MY_MAIL

login user- /api/auth/login
body:
        email:"<Your email>"
        password:"<Your password>"

register user- /api/auth/register
body:
        name:"<Your name>"
        email:"<Your email>"
        password:"<Your password>"
        confirmpassword:"<Your confirmPassword>"

forget password- /api/auth/forgetpassword
body:
        email:"<Your email>"

reset password- /api/auth/resetpassword
body:
        email:"<Your email>"
        newpassword:"<Your newpassword>"
        code:"<Code from the email>"

upload video - /api/media/upload
file:
        video:<your file>
header:
        x-auth-token:<your login token>

get all video -/api/media
header:
        x-auth-token:<your login token>
