import express from "express";
import {jwt, z} from "zod/v4"
import { JWT_SECRET, PORT } from "./config";
import { Content, Link, User } from "./db";
import bcrypt from 'bcrypt';
import Jwt from "jsonwebtoken";
import { middleware } from "./middleware";
import { random } from "./utils";

const app = express();
app.use(express.json())

//sign-in endpoint
app.post("/api/v1/sign-up" ,async (req,res) => {

    try{
        const body = req.body;

        const signInZod = z.object({
                username : z.string().min(3,"Username must be atleat 3 character long").max(20, "Username cannott be more than 10 character long"),
                password : z.string()
                        .min(8, "Password must be atleast 8 character long")
                        .max(20, "Password cannot be more then 20 character long")
                        .refine((val) => {
                                const upperCase = /[A-z]/.test(val)
                                const lowerCase = /[a-z]/.test(val)
                                const hasNumber  = /[0-9]/.test(val)
                                const hasSpecialCharacter = /[!@#$%^&*()_+{}\[\]:;<>,.?~\\|/-]/.test(val);

                                return upperCase && lowerCase && hasNumber && hasSpecialCharacter
                        }, "Password must contain atlest one uppercase, one lowercase, one number and one special character.")
                })

        const result = signInZod.safeParse(body);

        if(!result.success){
                res.status(411).json({
                        msg : "Errors in the inputs",
                        errors : result.error
                });
                return;
        }

        const data = result.data;

        const userFind = await User.findOne({
                username : data.username
        })

        if(userFind){
            res.status(403).json({msg : "User already exists"})
            return;
        }

        const hashPassword = bcrypt.hashSync(data.password,10)
        // console.log(hashPassword);

        await User.create({
            username : data.username,
            password : hashPassword
        });
        res.status(200).json({msg : "User is signed up"});
    
    }catch(err){
        console.log(err);
        res.status(500).json({msg : "Internal server error"});
    }

});

app.post("/api/v1/sign-in", async (req , res) => {
    const username = req.body.username;
    const password = req.body.password;

    const findUser = await User.findOne({ username : username });

    if(!findUser){
        res.status(401).json({ msg : "Username or the password is wronggg" });
        return;
    }

    console.log(findUser.password);

    if(findUser.password){
        const decodePassword = bcrypt.compareSync(password, findUser.password);
        console.log(decodePassword);
        if(decodePassword){

            const token  = Jwt.sign({
                id : findUser._id
            },JWT_SECRET)

            res.status(200).json({ msg : "User is signed in", token : token});
            return;
        } else {
            res.status(401).json({ msg : "Username or the password is wrong2" });
            return;
        }
    } else {
        res.status(401).json({ msg : "Username or the password is wrong3" });
        return;
    }
});  

app.post("/api/v1/content" , middleware , async (req,res) => {
    const link = req.body.link;
    const type = req.body.type;
    const title = req.body.title;

    await Content.create({
        link,
        type,
        title,
        tags : [],
        userId : req.userId
    })

    res.json({msg : "Your Content is Added"});

})

app.get("/api/v1/content" , middleware , async (req,res) => {
    const userId = req.userId;

    const userContent = await Content.find({
        userId : userId
    }).populate("userId" , "username");

    res.status(200).json({
        content : userContent
    });
});

app.delete("/api/v1/content" , middleware , async (req,res) => {
    const contentId = req.body.contentId;
    const userId = req.userId;

    await Content.deleteMany({
        _id : contentId,
        userId
    })

    res.status(200).json({
        message : "Content Entry is Deleted"
    });
});

app.post("/api/v1/brain/share", middleware , async (req, res) => {
    const share = req.body.share;

    if(share){
        const existingLink = await Link.findOne({
            userId : req.userId
        });

        if(existingLink){
            res.json({
                hash : existingLink.hash
            });
        }else{

            const hash  = random(10);

            await Link.create({
                hash : hash,
                userId : req.userId
            });

            res.status(200).json({hash });
            return;
        }
    }else{
        await Link.deleteOne({
            userId : req.userId
        });

        res.json({
            message : "Sharable Link removed"
        })
    }
});


app.get("/api/v1/brain/:shareLink" , middleware , async (req, res) => {
    const hash = req.params.shareLink;

    const link = await Link.findOne({
        hash : hash
    })

    if(!link){
        res.status(411).json({
            message : "Please send right link"
        });
        return;
    };

    const content = await Content.findOne({
        userId : link.userId
    });

    const user = await User.findOne({
        _id : link.userId
    });


    res.json({
        username : user?.username,
        content : content 
    });
})



app.listen(PORT , () => {
        console.log("Server is running on the port " + PORT)
})