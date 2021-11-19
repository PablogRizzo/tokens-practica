// import cors from "cors";
// import MethodOverride  from 'method-override';
// import express from "express";
// import path from "path";
const methodOverride = require("method-override");
const cors = require("cors");
const express = require("express");
const multer = require("multer");
const path = require("path");
const {v4:uuid} = require("uuid");
const dayjs = require("dayjs");
//
const server = express();
const axios = require("axios");
const log = console.log;

let PORT = process.env.PORT || 3000;

server.use(cors());
server.use(methodOverride());
server.use(express.urlencoded({extended:true}))
server.use(express.json());

const juan = axios.create({
    baseURL: 'https://devplace.free.beeceptor.com'
})

let users = [
    {email:"JuanJose@gmail.com", name:"Juan Jose", password:"555555555"},
    {email:"JaneDoe@gmail.com", name:"Jane Doe", password:"123456789"},
    {email:"NN@gmail.com", name:"Natalia Natalia", password:"123456789"}
];

server.get("/",(req,res)=>{
    res.sendFile(path.join(__dirname,"/view/index.html"))
})

//--------Golpe API de Juan-------------//
server.get("/getUsers",(req,res)=>{
    juan.get('/users')
    .then(response=>{users.push(response)})
    .catch(err=>console.log(err));

    res.send("usuarios agregados!");
})

//---------------1---------------//
server.get("/users",(req,res)=>{
    res.send(users);
});

//---------------2--------------//
server.get("/mail/:email",(req,res)=>{
    let mail = req.params.email;
    for(let i=0;i<users.length;i++){
        if(mail == users[i].email){
            res.send(users[i]);
        }
    }
});

//---------------3--------------//
server.get("/usersEmail/:email",(req,res)=>{
    let email= req.params.email;
    let arrayEmail=email.split(",");

    let response=[];

    arrayEmail.forEach((email)=>{
        users.forEach((user)=>{
            if(user.email==email){
                response.push(user)
            }
        })
    })
    res.send(response);
})

//---------------4--------------//
server.get("/users/name",(req,res)=>{
    let arrayNombre= req.query.nombre;
    let resul=[];
    arrayNombre.forEach((nombre)=>{
        users.forEach((element)=>{
            if(nombre== element.name){
                resul.push(element)
            }
        })
    })
    res.send(resul)
})

//---------------5--------------//
server.post("/user/create",(req,res) => {
    let nombre = req.body.nombre;
    let email = req.body.email;
    let password = req.body.password;

    let user = {"email":email, "name":nombre, "password":password};
    users.push(user);

    res.send("Usuario creado!");
});

//---------------7--------------//
server.delete("/users/delete",(req,res)=>{
    let mail = req.query.mail;
    console.log(mail);
    mail.forEach(para => {   
        users = users.filter((elemento)=>elemento.email!=para) 
    })
    res.send("usuarios eliminados")
})

//------------Ejercicio #2---------------//
const multerConfig = multer.diskStorage({ 
    destination:function(req,file,cb){    
        cb(null, "./bucket"); 
    },
    filename:function(req,file,cb){
        let idImage = uuid().split("-")[0];
        let day = dayjs().format('DD-MM-YYYY');    
    
        cb(null, `${day}.${idImage}.${file.originalname}`);
    },
});

const multerMiddle = multer({storage:multerConfig});


server.post("/registro/usuario",multerMiddle.single("imagefile"),(req,res)=>{ 
    let email = req.body.email;
    let nombre = req.body.nombre;
    let pass = req.body.pass;

    let user = {"email":email, "name":nombre, "password":pass};
    users.push(user);

    if(req.file){
        res.send("usuario creado!");
    }else{
        res.send("error al cargar la imagen../posiblemente no fue recibida");
    }
});

server.listen(3000,()=>{
    log("start server");
});