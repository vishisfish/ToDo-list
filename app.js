const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const date = require(__dirname + "/date.js");

const app = express();

app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static("public"));

app.set("view engine", "ejs");

// var items = ["get to the sea", "catch a fish", "say hi",];
// var workItems = [];

mongoose.connect("mongodb+srv://vishisfish:Vishva10@cluster0.4lmea.mongodb.net/todolistDB?retryWrites=true&w=majority");

const itemSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
  name: "get to the sea"
});

const item2 = new Item({
  name: "catch a fish"
});

const item3 = new Item({
  name: "say hi"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemSchema]
}

const List = mongoose.model("List", listSchema);


app.get("/", function(req, res){

  var day = date.getDate();

  Item.find({}, function(err, foundItems){
    if (err) {
      console.log(err);
    }
    else {

      if(foundItems.length === 0){

        Item.insertMany(defaultItems, function(err){
          if (err) {
            console.log(err);
          }
          else {
            console.log("successfully inserted");
          }
        });

        res.redirect("/");

      }
      else {
        res.render("list", {ListTitle: day, newListItems: foundItems});
      }
    }
  })
});


app.get("/:customListName", function(req, res){

  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}, function(err, foundList){
    if (!err){
      if(!foundList){
        //Create a new list
        const list = new List({
          name: customListName,
          items: defaultItems
        });

        list.save();

        res.redirect("/" + customListName);
      }
      else{
        //Show an existing list

        res.render("list", {ListTitle: foundList.name, newListItems: foundList.items});
      }
    }
  })

});



app.post("/", function(req, res){

  const itemName = req.body.newItem;  //name of the input box in form is "newItem".

  const listName = req.body.list;    //name of the button in submit form is "list".

  const item = new Item({
    name: itemName
  });

  var day = date.getDate();

  if(listName === day){
    item.save();

    res.redirect("/");
  }
  else {
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);

      foundList.save();
      res.redirect("/" + listName);
    })
  }

  // if(req.body.list === "Work List"){
  //
  //   item = req.body.newItem;
  //
  //   workItems.push(item);
  //
  //   res.redirect("/work");
  //
  // }
  // else{
  //
  //   item = req.body.newItem;
  //
  //   items.push(item);
  //
  //   res.redirect("/");
  // }

});

app.post("/delete", function(req, res){
  const checkedItemID = req.body.checkbox;
  const listName = req.body.listName;

  var day = date.getDate();

  if(listName === day){
    Item.deleteOne({_id: checkedItemID}, function(err){
      if (err) {
        console.log(err);
      }
      else {
        console.log("successfully removed");
        res.redirect("/");
      }
    })
  }
  else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemID}}}, function(err, foundList){
      //$pull deletes a entire document with specified _id (in this case).
      if(!err){
        res.redirect("/" + listName);
      }
    })
  }

});

// app.get("/work", function(req, res){
//
//   res.render("list", {ListTitle: "Work List", newListItems: workItems});
//
// });

app.get("/about", function(req, res){

  res.render("about");

});


let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function(){
  console.log("Server is now running successfully");
});
