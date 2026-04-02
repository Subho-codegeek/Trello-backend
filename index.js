//username,password
//organisation
//boards
//issues

const express=require("express");
const jwt = require("jsonwebtoken");
const {authMiddlewear} = require("./middlewear");

const users=[];
const organisations=[/*{
    id:1,
    title:"100xdevs",
    description:"100xdevs is a community of developers.",
    admin:1, //user with ID:1
    members:[2] //user with ID:2 is a member of this organisation
}, {
    id:2,
    title:"Raman's org",
    description:"Experimenting with new ideas.",
    admin:2, //user with ID:2
    members:[]
}*/];
const boards=[/*{
    id:1,
    title:"100x website (frontend)",
    organisationId:1, //board belongs to organisation with ID:1,
}*/];
const issues=[/*{
    id:1,
    title:"Add dark mode",
    boardId:1, //issue belongs to board with ID:1
    state:"IN_PROGRESS" // IN_PROGRESS | DONE | NEXT_UP | ARCHEIVED
}, {
    id:2,
    title:"Fix login bug",
    boardId:1, //issue belongs to board with ID:1
    state:"DONE"

}*/];

let USERS_ID=1;
let ORG_ID=1;
let BOARD_ID=1;
let ISSUE_ID=1;

const app=express();
app.use(express.json());

//CREATE ENDPOINTS
app.post("/signup", (req,res)=>{
    const username = req.body.username;
    const password= req.body.password;

    const userExists = users.find((u => u.username === username));
    if(userExists){
        res.status(411).json({
            message: "User with this username already exists"
        })
        return;
    }

    users.push({
        username,
        password,
        id: USERS_ID++
    })

    res.json({
        message: "User created successfully"
    })
})

app.post("/signin", (req,res)=>{
    const username = req.body.username;
    const password= req.body.password;

    const userExist = users.find(u => u.username === username && u.password === password);

    if(!userExist){
        res.status(401).json({
            message: "Invalid credentails"
        })
    }

    //create a jwt for the user
    const token = jwt.sign({
        userId: userExist.id
    }, "attlasiansupersecret123123password");

    res.json({
        token
    })
    
})

app.post("/organisation", authMiddlewear, (req,res)=>{
    const userId = req.userId;

    organisations.push({
        id: ORG_ID++,
        title: req.body.title,
        description: req.body.description,
        admin: userId,
        members:[]
    })

    res.json({
        message: "Organisation created successfully",
        id: ORG_ID-1
    })
})

app.post("/add-members-to-organisation", authMiddlewear, (req,res)=>{
    const userId = req.userId;
    const organisationId = req.body.organisationId;
    const memberUsername = req.body.memberUsername;

    const organisation = organisations.find(org => org.id === organisationId);

    if(!organisation || organisation.admin !== userId){
        res.status(411).json({
            message: "Either this org does not exist or you are not an admin of this org"
        })
        return;
    }

    const memberUser = users.find(u => u.username === memberUsername);

    if(!memberUser){
        resizeTo.status(411).json({
            message: "No user with this username exists"
        })
        return;
    }

    organisation.members.push(memberUser.id);

    res.json({
        messaage: "Member added successfully"
    })
})

app.post("/board", (req,res)=>{
    
})

app.post("/issue", (req,res)=>{
    
})

// READ ENDPOINTS

app.get("/organisation", authMiddlewear, (req,res)=>{
    const userId = req.userId;
    const organisationId = parseInt(req.query.organisationId);

    const organisation = organisations.find(org => org.id === organisationId);

    if(!organisation || organisation.admin !== userId){
        res.status(411).json({
            message: "Either this org does not exist or you are not an admin of this org"
        })
        return;
    }

    res.json({
        organisation: {
            ...organisation,
            members: organisation.members.map(memberId => {
                const user = users.find(user => user.id === memberId);
                return {
                    id: user.id,
                    username: user.username
                }
            })
        }
    })

})

app.get("/boards", (req,res)=>{
    
})
app.get("/issues", (req,res)=>{
    
})

app.get("/members", (req,res)=>{
    
})

app.put("/issue", (req,res)=>{
    
})

app.delete("/members", authMiddlewear, (req,res)=>{
    const userId = req.userId;
    const organisationId = req.body.organisationId;
    const memberUsername = req.body.memberUsername;

    const organisation = organisations.find(org => org.id === organisationId);

    if(!organisation || organisation.admin !== userId){
        res.status(411).json({
            message: "Either this org does not exist or you are not an admin of this org"
        })
        return;
    }

    const memberUser = users.find(u => u.username === memberUsername);

    if(!memberUser){
        resizeTo.status(411).json({
            message: "No user with this username exists"
        })
        return;
    }

    organisation.members = organisation.members.filter(u => u !== memberUser.id);

    res.json({
        messaage: "Member removed successfully"
    })
})

app.listen(3000);