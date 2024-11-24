const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const getAllContacts = async (req,res)=>{
    try{    
        const allContacts = await prisma.contact.findMany();
        return res.status(200).json({
            allContacts : allContacts
        })
    }
    catch(err){
        return res.status(500).json({
            message : "something went wrong while getting all contacts",
            error : err
        })
    }
}

module.exports = getAllContacts;