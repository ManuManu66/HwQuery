const express = require("express")
const app = express()
const fs = require("fs")

app.use(express.json())
app.use(express.urlencoded())
 
 
app.get("/products", (req, res) => {
    const {count, products} = JSON.parse(fs.readFileSync("./products.json", {encoding:"utf-8"}))    

    const { category, subcategory, search } = req.query;
    let inventory = products;

    if (category) {
        inventory = inventory.filter(
            product => product.category.toLowerCase() === category.toLowerCase()
        );
    }

    if (subcategory) {
        inventory = inventory.filter(
            product => product.subcategory.toLowerCase() === subcategory.toLowerCase()
        );
    }

    if (search) {
        inventory = inventory.filter(
            product => product.name.toLowerCase().includes(search.toLowerCase())
        );
    }

    res.json(inventory);
});

    app.post("/products", (req, res) => {
    const {body } = req;

    const data = JSON.parse(fs.readFileSync("./products.json", {encoding:"utf-8"}))   

    data.products.push(body)
    data.count = data.products.length

    fs.writeFileSync("./products.json",JSON.stringify(data, null, 2))

    res.status(201).json({ message: "Product added" })
})

app.listen(9000,  () => console.log("Server running on port 9000"))