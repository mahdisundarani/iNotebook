const express = require('express');
const router = express.Router();
const User = require('../models/User')
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var fetchuser = require('../middleware/fetchuser');
var nodemailer = require('nodemailer');

const JWT_SECRET = 'harryisagoodboy';

// ROUTE 1 : create a user using : POST "/api/auth/createuser". No login required
router.post('/createuser', [
  body('name', 'Enter valid name').isLength({ min: 3 }),
  body('email', ' Enter valid email').isEmail(),
  body('password', 'Enter valid password').isLength({ min: 5 })

], async (req, res) => {
  let success = false;

  // if there is any errors, return bad request and the errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success, errors: errors.array() });
  }
  try {
    // check wether the user with this email exist already
    let user = await User.findOne({ email: req.body.email });
    if (user) {
      return res.status(400).json({ success, error: 'sorry a user with this email already exists' })
    }
    const salt = await bcrypt.genSalt(10);
    const secPass = await bcrypt.hash(req.body.password, salt);

    //  create a new user
    user = await User.create({
      name: req.body.name,
      password: secPass,
      email: req.body.email,
    })

    const data = {
      user: {
        id: user.id
      }
    }
    const authtoken = jwt.sign(data, JWT_SECRET);

    success = true;
    res.json({ success, authtoken })

    // res.json({user})
  } catch (error) {
    console.error(error.message)
    res.status(500).send("Internal Server ErrorLo");
  }
})

// Route 2 : Authenticate a user using : POST "/api/auth/login". No login required
router.post('/login', [
  body('email', 'Enter a valid email').isEmail(),
  body('password', 'Password cannot be blank').exists(),
], async (req, res) => {
  let success = false;
  // If there are errors, return Bad request and the errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (!user) {
      success = false
      return res.status(400).json({ error: "Please try to login with correct credentials" });
    }

    const passwordCompare = await bcrypt.compare(password, user.password);
    if (!passwordCompare) {
      success = false
      return res.status(400).json({ success, error: "Please try to login with correct credentials" });
    }

    const data = {
      user: {
        id: user.id
      }
    }
    const authtoken = jwt.sign(data, JWT_SECRET);
    success = true;
    res.json({ success, authtoken })

  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }

});


// Route 3 : get loggedin user details using : POST "/api/auth/getuser". login required
router.post('/getuser', fetchuser, async (req, res) => {
  try {
    userId = req.user.id;
    const user = await User.findById(userId).select("-password")
    res.send(user)
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
})


// Route 4 : Forgot password using : POST "/api/auth/forgotpass". No login required
router.post('/forgotpass',   (req, res) => {
  const {email} = req.body;
   let user = User.findOne({ email })
  .then(user=>{
    if(!user){
      return res.send({Status: "user not existed"})
    }
    const token = jwt.sign({id: user._id},JWT_SECRET)
    var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'mahdi.sundarani@gmail.com',
        pass: 'dect qqof scyy nkon'
      }
    });
    
    var mailOptions = {
      from: 'sundarani@gmail.com',
      to: 'mahdi.sundarani@gmail.com',
      subject: 'Reset your password',
      text: `http://localhost:3000/reset-password/${user._id}/${token}`
    };
    
    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
      } else {
        return res.send({Status:"success"})
      }
    });
  })
});


// Route 5 : Forgot password using : POST "/api/auth/reset-password". No login required
router.post('/reset-password/:id/:token', (req, res) => {
  const {id, token} = req.params
  const {password} = req.body
  
  console.log("reset pass");
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if(err) {
          return res.json({Status: "Error with token"})
      } else {
          bcrypt.hash(password, 10)
          .then(hash => {
              User.findByIdAndUpdate({_id: id}, {password: hash})
              .then(u => res.send({Status: "Success"}))
              .catch(err => res.send({Status: err}))
          })
          .catch(err => res.send({Status: err}))
      }
  })
})

// Route 6 : Change password using : POST "/api/auth/change-password". No login require
router.post('/change-pass', async(req,res)=>{
  const {CurrentPassword , NewPassword} = req.body
  const token = req.header('authentication')
  if(!token){res.status(404).json({message: 'unautorized'})}

 try {
    const decoded = jwt.verify(token,JWT_SECRET)
    const userId = decoded.user.id
    // console.log(decoded)

    const user = await User.findById(userId)
    if(!user){res.status(404).json('user not found')}
    // console.log(user)

    const isPasswordValid = await bcrypt.compare(CurrentPassword, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid old password' });
        }


    const hashedPassword = await bcrypt.hash(NewPassword,10)
    user.password = hashedPassword
    await user.save();

    res.status(200).json('password changed successfull')
 } catch (error) {
    console.error(error)
    res.status(500).json({message: 'internal server error'})
 }

})


module.exports = router;
