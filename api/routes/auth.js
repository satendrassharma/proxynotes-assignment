const express = require("express");
const router = express.Router();
const { check, validationResult, body } = require("express-validator");
const User = require("../../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

//login
router.post(
  "/login",
  [check("email").isEmail(), check("password").isLength({ min: 5 })],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ errors: [{ msg: "user not found" }] });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res
          .status(400)
          .json({ errors: [{ msg: "invalid authentication details" }] });
      }

      const payload = {
        email,
        id: user._id
      };

      const token = await jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: 60 * 60
      });

      return res.json({ msg: "login successfull", token });
    } catch (err) {
      return res.status(500).json({
        errors: [{ msg: err.message }]
      });
    }
  }
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
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const { email, password, name } = req.body;
    try {
      let user = await User.findOne({ email });
      if (user) {
        // console.log(user.name);
        return res
          .status(400)
          .json({ errors: [{ msg: "user already exists" }] });
      }

      user = new User({
        email,
        password,
        name
      });

      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(password, salt);

      user.password = hash;

      const registeredUser = await user.save();
      res.json({
        msg: "user registration successfull",
        user: registeredUser
      });
    } catch (err) {
      return res.status(500).json({
        errors: [{ msg: err.message }]
      });
    }
  }
);

const getRandomCode = () => {
  let code = "";
  for (let i = 0; i < 4; i++) {
    const a = String.fromCharCode(97 + Math.floor(Math.random() * 26));
    code += a;
  }
  return code;
};

//forget password
router.post("/forgetpassword", [check("email").isEmail()], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  //generate a random code
  const code = getRandomCode();
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ errors: [{ msg: "no user found" }] });
    }

    //use sendgrid to send code to the email
    const msg = {
      to: email,
      from: process.env.MY_MAIL,
      subject: "Password Reset Request Code",
      html: `<div>
      <h4>Paste the below code to reset your password</h4>
      <h1>${code}</h1>
      </div>`
    };
    sgMail.send(msg);
    req.session.email = email;
    req.session.code = code;
    // console.log(req.session);
    res.json({ msg: "An email is sent to reset the password" });
  } catch (err) {
    return res.status(500).json({
      errors: [{ msg: err.message }]
    });
  }
});

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
  async (req, res) => {
    console.log(req.session);
    const { email, password, code } = req.body;
    if (email !== req.session.email || code !== req.session.code) {
      return res.status(422).json({ errors: [{ msg: "invalid inputs" }] });
    }
    try {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(password, salt);
      const user = await User.findOneAndUpdate(
        { email },
        { password: hash },
        { new: true }
      );
      req.session.destroy();
      return res.json({
        msg: "reset password successfull",
        user
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        errors: [{ msg: err.message }]
      });
    }
  }
);
module.exports = router;
