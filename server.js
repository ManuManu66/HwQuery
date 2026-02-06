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



app.put("/products/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const updatedProduct = req.body;

    const data = JSON.parse(
        fs.readFileSync("./products.json", { encoding: "utf-8" })
    );

    const productIndex = data.products.findIndex(
        product => product.id === id
    );

    if (productIndex === -1) {
        return res.status(404).json({ message: "Product not found" });
    }

    data.products[productIndex] = {
        ...data.products[productIndex],
        ...updatedProduct
    };

    fs.writeFileSync("./products.json", JSON.stringify(data, null, 2));

    res.status(200).json({ message: "Product updated" });
});


app.listen(9000,  () => console.log("Server running on port 9000"))