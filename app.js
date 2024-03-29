//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://<username>:<password>@cluster0.ack4obt.mongodb.net/todolistDB");

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to my Todolist!"
});

const item2 = new Item({
  name: "Press the '+' button to add a new item."
});

const item3 = new Item({
  name: "⬅  Hit this to delete an item."
});

const defaultItems = [item1, item2, item3]

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);


app.get("/", function(req, res) {

  Item.find({}, function(err, results){
    if (results.length === 0){
      Item.insertMany(defaultItems, function(err){
        if (!err){
          console.log("Successfully submitted entries to DB.");
        }
      });
      res.redirect("/");
    }else{
      res.render("list", {listTitle: "Today", newListItems: results});
    }
  });
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if (listName === "Today"){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name: listName}, function(err, foundList){
      console.log(foundList);
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});


app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
  
  if (listName === "Today"){
    Item.findByIdAndRemove(checkedItemId, function(err){
      if (!err){
        console.log("Successfully deleted item.");
        res.redirect("/");
      };
    });
  }else{
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId }}}, function(err, foundList){
      if(!err){
        res.redirect("/" + listName);
      };
    });
  };
});


app.get("/:customPageTopic", function(req, res){
  const customPageTopic =  _.capitalize(req.params.customPageTopic);

  List.findOne({name: customPageTopic}, function(err, foundList){
    if (!err){
      if(!foundList){
        // Creates a new list
        const list = new List({
          name: customPageTopic,
          items: defaultItems
        });
        list.save();
        res.redirect("/"+ customPageTopic);
      }else{
         // Finds existing list
         res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      };
    };
  });
});


  
app.get("/about", function(req, res){
  res.render("about");
});

app.listen(process.env.PORT || 3000, function(){
  console.log("Server started on port 3000");
});
