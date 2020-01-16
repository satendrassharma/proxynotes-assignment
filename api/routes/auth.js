const express = require("express");
const router = express.Router();
const { check, body } = require("express-validator");
const sgMail = require("@sendgrid/mail");

const authController = require("../../controller/auth");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

//login
router.post(
  "/login",
  [check("email").isEmail(), check("password").isLength({ min: 5 })],
  authController.login
);

//register
router.post(
  "/register",
  [
    check("name", "name is required")
      .not()
      .isEmpty(),
    check("email", "Enter a vaild email").isEmail(),
    check("password", "password should be of length atleast 5").isLength({
      min: 5
    }),
    // check("confirmpassword").isLength({ min: 5 }),
    body("confirmpassword").custom((value, { req }) => {
      if (value !== req.body.password)
        throw new Error("Password Confirmation does not match password");
      return true;
    })
  ],
  authController.register
);

//forget password
router.post(
  "/forgetpassword",
  [check("email").isEmail()],
  authController.forgetpassword
);

//reset password
router.post(
  "/resetpassword",
  [
    check("email").isEmail(),
    check("code")
      .not()
      .isEmpty(),
    check("password").isLength({ min: 5 })
  ],
  authController.resetpassword
);
module.exports = router;
