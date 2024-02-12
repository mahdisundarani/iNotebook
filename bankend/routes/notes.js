const express = require('express');
const router = express.Router();
let fetchuser = require('../middleware/fetchuser');
const Note = require('../models/Note')
const { body,validationResult } = require('express-validator');


// Route 1 : get all the Note using : GET "/api/auth/fetchallnotes". login required
router.get('/fetchallNotes', fetchuser , async(req,res)=>{
    try {
    const note = await Note.find({user: req.user.id})
    res.json(note)  
    } catch (error) {
    console.error(error.message)
    res.status(500).send("Internal Server ErrorLo");
    }   
})

// Route 2 : add a new note using : POST "/api/note/addnote". login required
router.post('/addnote', fetchuser , [
    body('title', 'Enter valid title').isLength({min : 3}),
    body('description' , 'Enter valid description').isLength({min : 5}),
], async(req,res)=>{
    try {
    const {title,description,tag} = req.body
    // if there is any errors, return bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
    }
    const note = new Note({
        title, description, tag, user: req.user.id
    })
    const savedNote = await note.save()
    res.json(savedNote)         
    }catch (error) {
    console.error(error.message)
    res.status(500).send("Internal Server ErrorLo");
    }
})

// Route 3 : update an existing Note using : PUT "/api/note/updatenote". login required
router.put('/updatenote/:id', fetchuser, async(req,res)=>{
    const {title,description,tag}= req.body;
    try {
    // create newnote object
    const newNote = {};
    if(title){newNote.title = title}
    if(description){newNote.description = description}
    if(tag){newNote.tag = tag}

    // find the note to be updated and update it 
    let note = await Note.findById(req.params.id);
    if(!note){return res.status(404).send("Not found")}

    if(note.user.toString() !== req.user.id){
        return res.status(401).send("Not Allowed")
    }
    note = await Note.findByIdAndUpdate(req.params.id, {$set:newNote}, {new:true})
    res.json({note});
    }catch (error) {
    console.error(error.message)
    res.status(500).send("Internal Server ErrorLo");
    }   
})

// Route 4 : delete an existing Note using : DELETE "/api/note/deletenote". login required
router.delete('/deletenote/:id', fetchuser, async(req,res)=>{
    const {title,description,tag}= req.body;
    try{
    // find the note to be deleted and delete it 
    let note = await Note.findById(req.params.id);
    if(!note){return res.status(404).send("Not found")}

    // allow deletion if only user owns this note
    if(note.user.toString() !== req.user.id){
        return res.status(401).send("Not Allowed")
    }
    note = await Note.findByIdAndDelete(req.params.id)
    res.json({"success" : "note has been deleted", note: note});
    }catch (error) {
    console.error(error.message)
    res.status(500).send("Internal Server ErrorLo");
    }

})
module.exports = router;

