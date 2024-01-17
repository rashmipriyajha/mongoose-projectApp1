const express = require("express");
// const users = require("./MOCK_DATA.json");
const fs = require("fs");
const mongoose = require("mongoose");

const app = express();
const PORT = 8000;

// Connection 
mongoose.connect('mongodb://127.0.0.1:27017/project-mongoose-app1')
.then(()=> console.log('MongoDB Connected'))
.catch(err => console.log('Mongo Error', err));

//Schema
const userSchema = new mongoose.Schema({
    fristName: {
        type: String,
        require: true,
    },
    lastName: {
        type: String,
    },
    email: {
        type: String,
        require: true,
        unique: true,
    },
    jobTitle: {
        type: String,
    },
    gender: {
        type: String,
    }
}, {timestamps: true} );


const User = mongoose.model('user',userSchema)

// Middleware: Pluging
app.use(express.urlencoded({ extended: false }))

app.use((req, res, next) => {
    fs.appendFile(
        'log.txt',
        `\n${Date.now()}: ${req.method}: ${req.path}\n`,
        (err, data) => {
            next();
        }
    );
});


// Routes
//15:27

app.get('/users', async(req, res) => {
    const allDbUsers = await User.find({});
    const html = `
    <ul>
        ${allDbUsers.map(user => `<li>${user.fristName} - ${user.email}</li>`).join("")}
    </ul>`
    res.send(html);
});

// REST API
app.get('/api/users', async(req, res) => {
    const allDbUsers = await User.find({});
    return res.json(allDbUsers);
});


app
    .route('/api/users/:id')
    .get(async(req, res) => {
        const user = await User.findById(req.params.id);
        if(!user)return res.status(404).json({error: 'user not found'})
        return res.json(user);
    })
    .patch(async(req, res) => {
        // Edit user with id
        await User.findByIdAndUpdate(req.params.id,{lastName: 'Changed'})
        return res.json({ status: "Success" });
    })
    .delete(async(req, res) => {
        // Delete user with id
        await User.findByIdAndDelete(req.params.id)
        return res.json({ status: "Success" });
    });


app.post('/api/users', async(req, res) => {
    //To do : Create new user
    const body = req.body;
    if (!body || 
        !body.first_name || 
        !body.last_name || 
        !body.email || 
        !body.gender || 
        !body.job_title
        ) {
        return res.status(400).json({ msg: 'All fields are req...' });
    }
    // users.push({ ...body, id: users.length + 1 });
    // fs.writeFile('./MOCK_DATA.json', JSON.stringify(users), (err, data) => {
    //     return res.status(201).json({ status: "success", id: users.length });
    // });
    const result =  await User.create({
        fristName: body.first_name ,
        lastName: body.last_name ,
        email: body.email,
        gender: body.gender,
        jobTitle: body.job_title,
    });
    
    return res.status(201).json({msg: "success"});
});
app.patch('/api/users/:id', (req, res) => {
    //To do : Edit the user with id
    return res.json({ status: "pending" });
});
app.delete('/api/users/:id', (req, res) => {
    //To do : Delete the user with id
    return res.json({ status: "pending" });
});
app.listen(PORT, () => console.log(`Server Started at Port : ${PORT}`));