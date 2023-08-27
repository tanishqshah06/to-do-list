//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose")
const _ = require("lodash")

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

// mongoose.connect("mongodb://127.0.0.1:27017/todolistDB?directConnection=true")
mongoose.connect("mongodb+srv://itstanishq06:Test123@cluster0.ede443j.mongodb.net/todolistDB")

const itemsSchema = {
  name: String
}

const Item = mongoose.model("Item", itemsSchema)

const item1 = new Item({
  name: "Welcome to your todolist!"
})

const item2 = new Item({
  name: "Hit the + button to aff a new item"
})

const item3 = new Item({
  name: "<-- Hit this to delete an item"
})

const defaultItems = [item1, item2, item3]

const listSchema = {
  name: String,
  items: [itemsSchema]
}

const List = mongoose.model("List", listSchema)

app.get("/", function(req, res){
  
  Item.find({}).then((foundItems)=>{
    
    if(foundItems.length === 0){
      Item.insertMany(defaultItems).then(()=> 
        console.log("Successfully saved default items to DB.")
      )
      res.redirect("/")
    }
    else{
      res.render("list", {listTitle: "Today", newListItems: foundItems})
    }
  }).catch((error) => {
    console.error("Error in database query:", error);
    // Handle the error appropriately, e.g., send an error response to the client.
  });
})



app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName,
  })

  if(listName === "Today"){
    item.save();
    res.redirect("/")
  }
  else{
    List.findOne({name: listName}).then((foundList)=> {

      foundList.items.push(item)
      foundList.save();
      res.redirect("/" + listName)
    }).catch((error) => {
      console.error("Error in database query:", error);
      // Handle the error appropriately, e.g., send an error response to the client.
    });
  }



});

app.get("/:customListName", function(req, res){
  const customListName = _.capitalize(req.params.customListName)


  List.findOne({name: customListName}).then((foundList)=> {

    if(!console.error()){

      if(!foundList){
        const list = new List ({
          name: customListName,
          items: defaultItems
        })
        list.save();
        res.redirect("/" + customListName)
        // console.log("Doesnt exist")
      }
      else{
        // console.log(" exist")
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items})
      }
    }
  })

  


})


app.post("/delete", function(req, res){
  const checkItemId = (req.body.checkbox)
  const listName = (req.body.listName)

  if(listName === "Today"){
    Item.findByIdAndRemove(checkItemId).then(()=>{
  
      console.log("Successfully Deleted the chosen Item")
      res.redirect("/")
    }
    )
  }
  else{

    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkItemId}}}).then((foundList)=>{

      if(!console.error()){
        res.redirect("/" + listName)
      }
    })
  }

})



app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
