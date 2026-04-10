//username,password
//organisation
//boards
//issues

const express=require("express");
const jwt = require("jsonwebtoken");
const {authMiddlewear} = require("./middlewear");
const {userModel, organisationModel, boardModel, issueModel} = require("./models");

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

let BOARD_ID=1;
let ISSUE_ID=1;

const app=express();
app.use(express.json());

//CREATE ENDPOINTS
app.post("/signup", async (req,res)=>{
    const username = req.body.username;
    const password= req.body.password;

    //const userExists = users.find((u => u.username === username));
    const userExists =  await userModel.findOne({
        username: username,
    });

    if(userExists){
        res.status(411).json({
            message: "User with this username already exists"
        })
        return;
    }

    // users.push({
    //     username,
    //     password,
    //     id: USERS_ID++
    // })
    const newUser = await userModel.create({
        username,
        password
    })

    res.json({
        message: "User created successfully"
    })
})

app.post("/signin", async (req,res)=>{
    const username = req.body.username;
    const password= req.body.password;

    //const userExist = users.find(u => u.username === username && u.password === password);
    const userExist = await userModel.findOne({
        username: username,
        password: password
    })

    if(!userExist){
        res.status(401).json({
            message: "Invalid credentails"
        })
        return;
    }

    //create a jwt for the user
    const token = jwt.sign({
        userId: userExist._id
    }, "attlasiansupersecret123123password");

    res.json({
        token
    })
    
})

app.post("/organisation", authMiddlewear, async (req,res)=>{
    const userId = req.userId;

    const newOrganisation = await organisationModel.create({
        title: req.body.title,
        description: req.body.description,
        admin: userId,
        members:[]
    })
    // organisations.push({
    //     id: ORG_ID++,
    //     title: req.body.title,
    //     description: req.body.description,
    //     admin: userId,
    //     members:[]
    // })

    res.json({
        message: "Organisation created successfully",
        id: newOrganisation._id
    })
})

app.post("/add-members-to-organisation", authMiddlewear, async (req,res)=>{
    const userId = req.userId;
    const organisationId = req.body.organisationId;
    const memberUsername = req.body.memberUsername;

    //const organisation = organisations.find(org => org.id === organisationId);
    const organisation = await organisationModel.findOne({
        _id: organisationId
    })

    if(!organisation || organisation.admin.toString() !== userId){
        res.status(411).json({
            message: "Either this org does not exist or you are not an admin of this org"
        })
        return;
    }

    //const memberUser = users.find(u => u.username === memberUsername);
    const memberUser = await userModel.findOne({
        username: memberUsername
    })

    if(!memberUser){
        res.status(411).json({
            message: "No user with this username exists"
        })
        return;
    }

    const isAlreadyMember = organisation.members.find(m => m.toString() === memberUser._id.toString());

    if(isAlreadyMember){
        res.status(411).json({
            message: "User is already a member of this organisation"
        })
        return;
    }

    //organisation.members.push(memberUser.id);
    await organisationModel.findByIdAndUpdate(organisationId, {
        $push: {
            members: memberUser._id
        }
    })

    res.json({
        messaage: "Member added successfully"
    })
})

app.post("/board", authMiddlewear, async (req,res)=>{

    const userId = req.userId;

    const title = req.body.title;
    const organisationId = req.query.organisationId;

    const organisation = await organisationModel.findOne({
        _id: organisationId
    })
    
    if(!organisation || organisation.admin.toString() !== userId.toString()){
        res.status(411).json({
            message: "Either this org does not exist or you are not an admin of this org"
        })
        return;
    }

    const newBoard = await boardModel.create({
        title,
        organisationId
    })

    res.json({
        message: "Board created successfully",
        id: newBoard._id
    })
})

app.post("/issue", authMiddlewear, async (req,res)=>{
    
    const userId = req.userId;
    const title = req.body.title;
    const state = req.body.state;
    const boardId = req.query.boardId;

    const board = await boardModel.findOne({
        _id: boardId
    })

    if(!board){
        res.status(411).json({
            message: "Board with this ID does not exist"
        })
        return;
    }

    const organisation = await organisationModel.findOne({
        _id: board.organisationId
    })

    if(!organisation.members.find(m => m.toString() === userId.toString()) || organisation.admin.toString() !== userId.toString()){
        res.status(411).json({
            message: "You are not a member of this organisation or admin of this organisation"
        })
        return;
    }

    const newIssue = await issueModel.create({
        title,
        boardId,
        state
    })

    res.json({
        message: "Issue created successfully",
        id: newIssue._id
    })
})

// READ ENDPOINTS

app.get("/organisation", authMiddlewear, async (req,res)=>{
    const userId = req.userId;
    const organisationId = req.query.organisationId;

    //const organisation = organisations.find(org => org.id === organisationId);
    const organisation = await organisationModel.findOne({
        _id: organisationId
    })

    if(!organisation || organisation.admin.toString() !== userId){
        res.status(411).json({
            message: "Either this org does not exist or you are not an admin of this org"
        })
        return;
    }

    const members = await userModel.find({
        _id: organisation.members
    });

    res.json({
        organisation: {
            title: organisation.title,
            description: organisation.description,
            members: members.map(m => ({
                username: m.username,
                id: m._id
            }))
        }
    })

})

app.get("/boards", authMiddlewear, async (req,res)=>{
    const userId = req.userId;

    // const title = req.body.title;
    const organisationId = req.query.organisationId;

    const organisation = await organisationModel.findOne({
        _id: organisationId
    })

    if(!organisation || organisation.admin.toString() !== userId.toString()){
        res.status(411).json({
            message: "Either this org does not exist or you are not an admin of this org"
        })
        return;
    }

    if(!organisation.members.find(m => m.toString() === userId.toString())){
        res.status(411).json({
            message: "You are not a member of this organisation"
        })
        return;
    }

    const boards = await boardModel.find({
        organisationId: organisationId
    })

    res.json({
        boards
    })
})

app.get("/issues", authMiddlewear, async (req,res)=>{

    const userId = req.userId;
    const boardId = req.query.boardId;

    const board = await boardModel.findOne({
        _id: boardId
    })

    if(!board){
        res.status(411).json({
            message: "Board with this ID does not exist"
        })
        return;
    }

    const organisation = await organisationModel.findOne({
        _id: board.organisationId
    })

    if(!organisation.members.find(m => m.toString() === userId.toString()) || organisation.admin.toString() !== userId.toString()){
        res.status(411).json({
            message: "You are not a member of this organisation or admin of this organisation"
        })
        return;
    }

    const issues = await issueModel.find({
        boardId: boardId
    })

    res.json({
        issues
    })
})

app.get("/members", authMiddlewear, async (req,res)=>{

    const userId = req.userId;
    const organisationId = req.query.organisationId;

    const organisation = await organisationModel.findOne({
        _id: organisationId
    })

    if(!organisation || organisation.admin.toString() !== userId){
        res.status(411).json({
            message: "Either this org does not exist or you are not an admin of this org"
        })
        return;
    }

    const members = await userModel.find({
        _id: organisation.members
    });

    res.json({
        members: members.map(m=>({
            username: m.username,
            id: m._id
        }))
    })
    
})

app.put("/issue", authMiddlewear, async (req,res)=>{

    const userId = req.userId;
    const issueId = req.body.issueId;
    const newState = req.body.state;

    const issue = await issueModel.findOne({
        _id: issueId
    })

    if(!issue){
        res.status(411).json({
            message: "Issue with this ID does not exist"
        })
        return;
    }

    const board = await boardModel.findOne({
        _id: issue.boardId
    })

    if(!board){
        res.status(411).json({
            message: "Board with this ID does not exist"
        })
        return;
    }

    const organisation = await organisationModel.findOne({
        _id: board.organisationId
    })

    if(!organisation.members.find(m => m.toString() === userId.toString()) || organisation.admin.toString() !== userId.toString()){
        res.status(411).json({
            message: "You are not a member of this organisation or admin of this organisation"
        })
        return;
    }

    // await issueModel.findByIdAndUpdate(issueId, {
    //     state: newState
    // })

    issue.state = newState;
    await issue.save();

    res.json({
        message: "Issue state updated successfully"
    })
    
})

app.delete("/members", authMiddlewear, async (req,res)=>{
    const userId = req.userId;
    const organisationId = req.body.organisationId;
    const memberUsername = req.body.memberUsername;

    //const organisation = organisations.find(org => org.id === organisationId);
    const organisation = await organisationModel.findOne({
        _id: organisationId
    })

    if(!organisation || organisation.admin.toString() !== userId){
        res.status(411).json({
            message: "Either this org does not exist or you are not an admin of this org"
        })
        return;
    }

    //const memberUser = users.find(u => u.username === memberUsername);
    const memberUser = await userModel.findOne({
        username: memberUsername
    })

    if(!memberUser){
        res.status(411).json({
            message: "No user with this username exists"
        })
        return;
    }

    //organisation.members = organisation.members.filter(u => u !== memberUser.id);
    await organisationModel.findByIdAndUpdate(organisationId, {
        $pullAll: {
            members: [memberUser._id]
        }
    })

    res.json({
        message: "Member removed successfully"
    })
})

app.listen(3000);