const express = require("express");
const bodyParser = require("body-parser");
const urlencoded = require("body-parser/lib/types/urlencoded");
const date = require(__dirname + "/date.js");


const app = express();

const items = ["Buy Food", "Cook Food", "Eat Food"];
const workItems = [];

app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

app.get("/", function(req, res){
    const day = date.getDate();
    res.render("list", {listTopic: day, newListItems: items});
});

app.post("/", function(req, res){
    const item = req.body.listItem;
    if (req.body.list === "Work"){
        workItems.push(item);
        res.redirect("/Work");
    }else{
        items.push(item);
        res.redirect("/");
    }
   
});

app.get("/Work", function(req, res){
    res.render("list", {listTopic:"Work", newListItems: workItems});
});

app.listen(process.env.PORT || 3000, function(){
    console.log("Server is running on port 3000.");
});
