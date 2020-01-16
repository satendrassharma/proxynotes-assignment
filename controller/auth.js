const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sgMail = require("@sendgrid/mail");

const User = require("../models/User");
const Code = require("../models/Code");

const util = require("../util");

const login = async (req, res) => {
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
};

const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const { email, password, name } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) {
      // console.log(user.name);
      return res.status(400).json({ errors: [{ msg: "user already exists" }] });
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
};

const forgetpassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  //generate a random code
  const code = util.getRandomCode();
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
      <strong>the is valid for 15 min</strong>
      </div>`
    };
    sgMail.send(msg);
    await Code.deleteMany({ email });

    const CodeData = new Code({
      email,
      code,
      time: Date.now()
    });

    await CodeData.save();
    // console.log({ CodeData });

    res.json({ msg: "An email is sent to reset the password" });
  } catch (err) {
    return res.status(500).json({
      errors: [{ msg: err.message }]
    });
  }
};

const resetpassword = async (req, res) => {
  const { email, newpassword, code } = req.body;
  try {
    const ncode = await Code.findOne({ email });
    console.log(ncode);
    if (!ncode) {
      return res.status(422).json({ errors: [{ msg: "invalid inputs" }] });
    }
    if (ncode.code === code) {
      if (util.isExpired(ncode.time)) {
        return res.status(400).json({ errors: [{ msg: "code expired" }] });
      }
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(newpassword, salt);
      const user = await User.findOneAndUpdate(
        { email },
        { password: hash },
        { new: true }
      );
      await Code.deleteOne({ email });
      return res.json({
        msg: "reset password successfull",
        user
      });
    } else {
      return res.status(422).json({ errors: [{ msg: "invalid inputs" }] });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      errors: [{ msg: err.message }]
    });
  }
};
module.exports = {
  login,
  register,
  forgetpassword,
  resetpassword
};
