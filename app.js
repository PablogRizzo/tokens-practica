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
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const axios = require("axios");
const { appendFile } = require("fs");
const log = console.log;

let PORT = process.env.PORT || 3500;

server.use(cors());
server.use(methodOverride());
server.use(express.urlencoded({extended:true}))
server.use(express.json());

const juan = axios.create({
    baseURL: 'https://devplace.free.beeceptor.com'
})

let users = [
    {email:"JuanJose@gmail.com", name:"Juan", password:"555555555"},
    {email:"JaneDoe@gmail.com", name:"Jane", password:"123456789"},
    {email:"NN@gmail.com", name:"Natalia", password:"123456789"}
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
        }else{
            res.send("usuario no encontrado");
        }
    }
});

//---------------3--------------//
server.get("/usersEmail/:email",(req,res)=>{
    let email = req.params.email;
    let arrayEmail = email.split(",");

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
    let arrayNombre = req.query.nombre;
    let resul=[];

    arrayNombre.forEach((nombre)=>{
        users.forEach(element => {
            if(nombre == element.name){
                resul.push(element);
            }
        })
    })
    
    res.send(resul);
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

//---------------6--------------//

server.delete("/user/delete/:email",(req,res) => {
    let mail = req.params.email;
    let result = users.filter(element => element.email != mail);
    res.send("usuario eliminado");
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

//----------TOKEN---------//


//---------ACTIVIDAD-----------//

const SALT = 10;
const roles = ["1","2","3","4"];
let usuarios = [];

//1-GET /usuarios
server.get("/usuarios",(req,res)=>{
    res.send(usuarios);
});

//2-GET /user/:email
server.get("/usuario/:email",(req,res)=>{
    let mail = req.params.email;

    usuarios.forEach(elemento => {
        if(elemento.email == mail){
            res.send(elemento);
        }else{
            res.send("usuario no encontrado...");
        }
    })
});

//3-POST CREAR USUARIO
server.post("/user/:email/:name/:pass/:role",(req,res)=>{
    let {email,name,pass,role} = req.params; //Directamente uso los atributos

    let flag = -1;
    roles.forEach(elemento => { //Busco que el usuario tenga un rol asignado
        if(elemento == role){
            flag = 1;
        }
    });
    if(flag==1){
        let usuario = {email,name,pass,role};

        bcrypt.hash(usuario.pass,SALT,(err,hash)=>{ //encripto la clave y agrego
            if(!err){                            //al usuario
                usuario.pass = hash;
                usuarios.push(usuario);
            }
        });
        const payload = { 
            user:usuario.nombre,
            user:usuario.role,
            country:"arg",
            lang:"es"
        };
        jwt.sign(payload,usuario.pass,(err,token)=>{ //genero el token
            if(!err){
                res.send(token);
            }
            else{
                res.send("error");
            }
        })
    }
    else{
        res.send("ingrese un rol valido");
    }
});

//4- VERIFY
server.post("/user/:email/:pass",(req,res)=>{
    let {email,pass} = req.params;
    let usuario = usuarios.find(user =>{
        if(user.email == email){
            bcrypt.compare(pass,user.pass,(err,validate)=>{ //verifica que los hash
                if(!err){                                   //coincidan
                    res.send(`verify ${validate}`); 
                }
            });
        }
    });
});

server.listen(3500,()=>{
    log("start server");
});