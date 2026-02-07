const express = require("express")
const app = express()
const fs = require("fs")

app.use(express.json())
app.use(express.urlencoded())


const productExists = (req, res, next) => {
    const id = parseInt(req.params.id)

    const data = JSON.parse(
        fs.readFileSync("./products.json", { encoding: "utf-8" })
    )

    const product = data.products.find(p => p.id === id)

    if (!product) {
        return res.redirect("/404")
    }

    req.product = product
    next()
}

const validateProduct = (req, res, next) => {
    const { name, category, subcategory, price } = req.body

    if (!name || !category || !subcategory || price == null) {
        return res.status(400).json({
            message: "Invalid payload"
        })
    }

    next()
}


app.get("/products", (req, res) => {
    const { count, products } = JSON.parse(
        fs.readFileSync("./products.json", { encoding: "utf-8" })
    )

    const { category, subcategory, search } = req.query
    let inventory = products

    if (category) {
        inventory = inventory.filter(
            product => product.category.toLowerCase() === category.toLowerCase()
        )
    }

    if (subcategory) {
        inventory = inventory.filter(
            product => product.subcategory.toLowerCase() === subcategory.toLowerCase()
        )
    }

    if (search) {
        inventory = inventory.filter(
            product => product.name.toLowerCase().includes(search.toLowerCase())
        )
    }

    res.json(inventory)
})

app.post("/products", validateProduct, (req, res) => {
    const { body } = req

    const data = JSON.parse(
        fs.readFileSync("./products.json", { encoding: "utf-8" })
    )

    data.products.push(body)
    data.count = data.products.length

    fs.writeFileSync("./products.json", JSON.stringify(data, null, 2))

    res.status(201).json({ message: "Product added" })
})

app.get("/products/:id", productExists, (req, res) => {
    res.json(req.product)
})

app.put("/products/:id", productExists, validateProduct, (req, res) => {
    const id = parseInt(req.params.id)
    const updatedProduct = req.body

    const data = JSON.parse(
        fs.readFileSync("./products.json", { encoding: "utf-8" })
    )

    const productIndex = data.products.findIndex(
        product => product.id === id
    )

    if (productIndex === -1) {
        return res.status(404).json({ message: "Product not found" })
    }

    data.products[productIndex] = {
        ...data.products[productIndex],
        ...updatedProduct
    }

    fs.writeFileSync("./products.json", JSON.stringify(data, null, 2))

    res.status(200).json({ message: "Product updated" })
})

app.delete("/products/:id", productExists, (req, res) => {
    const id = parseInt(req.params.id)

    const data = JSON.parse(
        fs.readFileSync("./products.json", { encoding: "utf-8" })
    )

    const productIndex = data.products.findIndex(
        product => product.id === id
    )

    if (productIndex === -1) {
        return res.status(404).json({ message: "Product not found" })
    }

    data.products.splice(productIndex, 1)
    data.count = data.products.length

    fs.writeFileSync("./products.json", JSON.stringify(data, null, 2))

    res.status(204).send()
})

app.get("/404", (req, res) => {
    res.status(404).json({ message: "Product not found" })
})

app.listen(9000, () => console.log("Server running on port 9000"))

//