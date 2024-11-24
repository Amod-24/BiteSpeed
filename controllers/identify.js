const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const identify = async (req,res)=>{
    let {email,phoneNumber} = req.body;
    if(!phoneNumber) phoneNumber = null;
    if(!email) email = null;

    if(!email && !phoneNumber){
        return res.status(404).json({
            message : "phone number and email both are missing"
        })
    }

    let primaryIds = {};
    let primaryEmail = {};
    let primaryPhoneNumber = {};
    try{
        if(email){
            try{
                const emailMatching = await prisma.Contact.findMany({
                    where : {
                        email : email
                    }
                })
                if(emailMatching.length != 0){
                    primaryEmail = await prisma.Contact.findUnique({
                        where : {
                            id : (emailMatching[0].linkedId != null ? emailMatching[0].linkedId : emailMatching[0].id)
                        }
                    })
                    primaryIds[primaryEmail.id] = primaryEmail.createdAt;
    
                }
            }
            catch(err){
                console.log(err)
            }
        }

        if(phoneNumber){
            const phoneNumberMatching = await prisma.Contact.findMany({
                where : {
                    phoneNumber : phoneNumber
                }
            })
            if(phoneNumberMatching.length != 0){
                primaryPhoneNumber = await prisma.Contact.findUnique({
                    where : {
                        id : (phoneNumberMatching[0].linkedId != null ? phoneNumberMatching[0].linkedId : phoneNumberMatching[0].id)
                    }
                })
            
                primaryIds[primaryPhoneNumber.id] = primaryPhoneNumber.createdAt;
            }
            
        }

        primaryIds = Object.entries(primaryIds);
        primaryIds.sort((d1,d2)=> new Date(d1[1]) - new Date(d2[1]));
        primaryIds = primaryIds.map(item => {
            item[0] = parseInt(item[0])
            return item
        });

        if(primaryIds.length == 2){
            try{
                await prisma.Contact.update({
                    where : {
                        id : primaryIds[1][0]
                    },
                    data : {
                        linkedId : primaryIds[0][0],
                        linkPrecedence : "secondary"
                    }
                })
                await prisma.Contact.update({
                    where : {
                        linkedId : primaryIds[1][0]
                    },
                    data : {
                        linkedId : primaryIds[0][0]
                    }
                })
            }
            catch(err){
                return res.status(500).json({
                    message : "something went worng while updating the existing data",
                    error : err
                })
            }
            // primaryIds.pop()

        }
        const bothExists = await prisma.Contact.findMany({
            where : {
                email : email,
                phoneNumber : phoneNumber
            }
        })

        const numberOfPrimaryIds = primaryIds.length;
        if((bothExists.length == 0) && ((numberOfPrimaryIds == 0) || ((email != null) && (phoneNumber != null) && (numberOfPrimaryIds == 1)))){
            const newEntry = await prisma.Contact.create({
                data : { 
                    email : email,
                    phoneNumber : phoneNumber,
                    ...(numberOfPrimaryIds != 0 && {linkedId : primaryIds[0][0]}),
                    ...(numberOfPrimaryIds != 0 && {linkPrecedence : "secondary"})
                }
            })
            console.log(newEntry);
            if(numberOfPrimaryIds == 0){
                primaryIds.push([newEntry.id,newEntry.createdAt])
            }
        }
        const allSecondaryContacts = await prisma.Contact.findMany({
            where : {
                OR : [
                    {linkedId : primaryIds[0][0]},
                    {id : primaryIds[0][0]}
                ]
            }
        })
        const output = {
            primaryContactId : primaryIds[0][0],
            emails : [],
            phoneNumbers : [],
            secondaryContactIds : []
        }
        try{
            const onlyEmails = {}
            const onlyPhoneNumbers = {}

            allSecondaryContacts.forEach(item => {
                if(item.email) onlyEmails[item.email] = 1;
                if(item.phoneNumber) onlyPhoneNumbers[item.phoneNumber] = 1;
                if(item.linkedId) output.secondaryContactIds.push(item.id);
            });

            output.emails = [...Object.keys(onlyEmails)];
            output.phoneNumbers = [...Object.keys(onlyPhoneNumbers)];
            console.log("fine till now")
            return res.status(200).json({
                contact : output
            })
        }
        catch(er){
            return res.status(500).json({
                message : "something went wrong while arranging the fimal output",
                error : er
            })
        }
        
    }
    catch(err){
        return res.status(500).json({
            message : "internal server error",
            error : err.name
        })
    }

}
module.exports = identify;