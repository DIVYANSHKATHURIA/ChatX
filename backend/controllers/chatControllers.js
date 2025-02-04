const asyncHandler = require('express-async-handler');
const Chat = require('../models/chatModel');
const User = require('../models/userModel');

const accessChat = asyncHandler(async(req,res) => {
    const {userId} = req.body;

    if(!userId) {
        console.log("UserId param not sent with request");
        return res.sendStatus(400);
    }

    try {
        // Find if a chat already exists between these users
        let isChat = await Chat.find({
            isGroupChat: false,
            $and: [
                {users: {$elemMatch: {$eq: req.user._id}}},
                {users: {$elemMatch: {$eq: userId}}},
            ],
        })
        .populate("users", "-password")
        .populate("latestMessage");

        isChat = await User.populate(isChat, {
            path: "latestMessage.sender",
            select: "name email",
        });

        if(isChat.length > 0) {
            res.send(isChat[0]);
        } else {
            // Create a new chat
            let chatData = {
                chatName: "sender",
                isGroupChat: false,
                users: [req.user._id, userId],
            };

            const createdChat = await Chat.create(chatData);
            const fullChat = await Chat.findOne({_id: createdChat._id}).populate("users", "-password");

            res.status(200).send(fullChat);
        }
    } catch (error) {
        console.error("Error in accessChat:", error);
        res.status(500).json({ 
            message: "Error accessing chat",
            error: error.message 
        });
    }
})

const fetchChats = asyncHandler(async(req,res) => {
    try{
        Chat.find({users: {$elemMatch: {$eq: req.user._id}}})
        .populate("users", "-password")
        .populate("groupAdmin", "-password")
        .populate({
            path: "latestMessage",
            populate: {
                path: "sender",
                select: "name pic email",
            },
        })
        .sort({updatedAt: -1})
        .then(async(result) => {
            res.status(200).send(result);
        })
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
})

const createGroupChat = asyncHandler(async(req,res) => {
    if(!req.body.users || !req.body.name) {
        return res.status(400).send({message: "Please fill all the fields"});
    }

    var users = JSON.parse(req.body.users);

    if(users.length < 2) {
        return res.status(400).send("More than 2 users are required to form a group chat");
    }
    users.push(req.user._id);

    try {
        const groupChat = await Chat.create({
            chatName: req.body.name,
            users: users,
            isGroupChat: true,
            groupAdmin: req.user,
        });
        const fullGroupChat = await Chat.findOne({_id: groupChat._id}).populate("users", "-password").populate("groupAdmin", "-password");
        res.status(200).json(fullGroupChat);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
})

const renameGroup = asyncHandler(async(req,res) => {
    const {chatId, chatName} = req.body;

    const updatedChat = await Chat.findByIdAndUpdate(chatId, {chatName: chatName}, {new: true})
    .then((updated) => res.status(200).send(updated))
    .catch((err) => res.status(400).send(err));
    if(!updatedChat) {
        res.status(404);
        throw new Error("Chat not found");
    }
    res.json(updatedChat);

})

const removeFromGroup = asyncHandler(async(req,res) => {
    const {chatId, userId} = req.body;
    const removed = await Chat.findByIdAndUpdate(chatId, {
        $pull: {users: userId}
    }, {new: true})
    if(!removed) {
        res.status(404);
        throw new Error("Chat not found");
    }
    res.json(removed);
})

const addToGroup = asyncHandler(async(req,res) => {
    const {chatId, userId} = req.body;
    const added = await Chat.findByIdAndUpdate(chatId, {
        $push: {users: userId}
    }, {new: true})
    if(!added) {
        res.status(404);
        throw new Error("Chat not found");
    }
    res.json(added);

}) 

module.exports = {accessChat, fetchChats, createGroupChat, renameGroup, removeFromGroup, addToGroup};