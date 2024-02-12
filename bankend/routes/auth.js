const express = require('express');
const router = express.Router();
const User = require('../models/User')
const { body,validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var fetchuser = require('../middleware/fetchuser');

const JWT_SECRET = 'harryisagoodboy';

// ROUTE 1 : create a user using : POST "/api/auth/createuser". No login required
router.post('/createuser',[
    body('name', 'Enter valid name').isLength({min : 3}),
    body('email' , ' Enter valid email').isEmail(),
    body('password', 'Enter valid password').isLength({min:5})

], async (req,res)=>{
  let success = false;

  // if there is any errors, return bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success , errors: errors.array() });
    }
    try {
      // check wether the user with this email exist already
    let user = await User.findOne({email: req.body.email});
    if(user){
      return res.status(400).json({ success , error: 'sorry a user with this email already exists'}) 
    }
    const salt = await bcrypt.genSalt(10);
    const secPass = await bcrypt.hash( req.body.password ,salt);

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
    const authtoken = jwt.sign(data,JWT_SECRET);

    success = true;
    res.json({ success, authtoken})

    // res.json({user})
  } catch (error) {
      console.error(error.message)
      res.status(500).send("Internal Server ErrorLo");
  }
})

// Route 2 : Authenticate a user using : POST "/api/auth/login". No login required
router.post('/login',[
  body('email' , ' Enter valid email').isEmail(),
  body('password' , 'Password cannot be blank').exists(),

], async (req,res)=>{
  let success = false;
  // if there is any errors, return bad request and the errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {email,password} = req.body;
  try {
    let user = await User.findOne({email})
    if(!user){
      success = false;
      console.log(error)
      return res.status(400).json({error: "please try to login with correct credentials"});
    }

    const passwordCompare = await bcrypt.compare(password, user.password);
    if(!passwordCompare){
      success = false;
      return res.status(400).json({success , error: "please try to login with correct credentials"});
    }

    const data = {
      user: {
        id: user.id
      }
    }
    const authtoken = jwt.sign(data,JWT_SECRET);
    success = true;
    res.json({success, authtoken})

  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
}
})


// Route 3 : get loggedin user details using : POST "/api/auth/getuser". login required
router.post('/getuser', fetchuser , async (req,res)=>{
try {
  userId = req.user.id;
  const user = await User.findById(userId).select("-password")
  res.send(user)
} catch (error) {
  console.error(error.message);
  res.status(500).send("Internal Server Error");
}
})

module.exports = router;
