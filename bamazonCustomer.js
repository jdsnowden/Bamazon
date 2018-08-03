// Initialize mysql and inquirer 
var inquirer = require('inquirer');
var mysql = require("mysql");

var connection = mysql.createConnection({
    host: "localhost",

    // Your port; if not 3306
    port: 3306,

    // Your username
    user: "root",

    // Your password
    password: "root",
    database: "bamazon_db"
});


connection.connect(function (err) {
    if (err) throw err;
    purchase();
});


//First prompt to order item and quantity
function purchase() {
    connection.query("SELECT * FROM products", function (err, results) {
        if (err) throw err;
        inquirer.prompt([
            {
                type: "rawlist",
                message: "What item would you like to purchase?",
                name: "userChoice",
                choices: function () {
                    var arr = []
                    for (let i = 0; i < results.length; i++) {
                        arr.push(JSON.stringify(results[i]))
                    }
                    return arr;
                }
            },
            {
                type: "input",
                message: "How many would you like to purchase?",
                name: "quantity"
            }
        ])
            .then(answers => {
                var wantedItem = 0
                var wantedId = JSON.parse(answers.userChoice).ID;
                //console.log(answers.userChoice)
                for (let i = 0; i < results.length; i++) {
                    //console.log(results[i].ID, typeof results[i].ID)
                    if (results[i].ID === wantedId) {
                        //console.log("item found");
                        wantedItem = results[i]
                    }
                }
                if (parseInt(answers.quantity) > wantedItem.Stock_Quantity) {
                    console.log("There are not enough of that item in stock")
                    purchase()
                } else if (parseInt(answers.quantity) < wantedItem.Stock_Quantity) {
                    var newQuant = wantedItem.Stock_Quantity - parseInt(answers.quantity)
                    let currentStock = "UPDATE products SET Stock_Quantity = " + newQuant + " WHERE ID = " + wantedItem.ID
                    connection.query(currentStock, function (err, results) {
                        if (err) throw err;
                        console.log("Thank you for your business. n/Your item will ship in 1-2 business days!!")
                    })

                    connection.end()
                }
            });
    })
}



