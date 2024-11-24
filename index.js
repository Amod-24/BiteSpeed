const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();
app.use(cors());
app.use(express.json());
const {connectDB} = require('./config/database');
const port = 3300;
const identify = require("./controllers/identify");
const getAllContacts = require("./controllers/getAllContacts");

app.get("/check", (req,res)=>{
    res.status(200).json({
        message : "its working"
    })
})
app.post("/identify", identify);
app.get("/allContacts", getAllContacts);






connectDB().then(() => {
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
        console.log(`http://localhost:${port}`);
    });
});