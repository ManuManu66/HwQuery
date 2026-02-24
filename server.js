const express = require("express")
const app = express()
const fs = require("fs")
const { Sequelize, DataTypes } = require("sequelize")

const STORAGE_TYPE = "db"   // change to fs or db

const conn = new Sequelize('products_inventory', 'root', 'root', {
    host: 'localhost',
    dialect: 'mysql'
})

const Category = conn.define("Category", {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    }
})

const SubCategory = conn.define("SubCategory", {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    category_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
})

const Product = conn.define("Product", {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    price: {
        type: DataTypes.DOUBLE.UNSIGNED,
        allowNull: false,
        defaultValue: 0
    },
    currency: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "USD"
    },
    stock: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0
    },
    rating: {
        type: DataTypes.FLOAT.UNSIGNED,
        allowNull: false,
        defaultValue: 1
    },
    subcategory_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
})

SubCategory.belongsTo(Category, { foreignKey: "category_id" })
Product.belongsTo(SubCategory, { foreignKey: "subcategory_id" })


app.use(express.json())
app.use(express.urlencoded({ extended: true }))


const FileStorage = {

    getAll: () => {
        const data = JSON.parse(
            fs.readFileSync("./products.json", "utf-8")
        )
        return data.products
    },

    getById: (id) => {
        const data = JSON.parse(
            fs.readFileSync("./products.json", "utf-8")
        )
        return data.products.find(p => p.id === id)
    },

    create: (product) => {
        const data = JSON.parse(
            fs.readFileSync("./products.json", "utf-8")
        )

        const newId = data.products.length
            ? Math.max(...data.products.map(p => p.id)) + 1
            : 1

        const newProduct = { id: newId, ...product }

        data.products.push(newProduct)
        data.count = data.products.length

        fs.writeFileSync("./products.json", JSON.stringify(data, null, 2))
        return newProduct
    },

    update: (id, updatedProduct) => {
        const data = JSON.parse(
            fs.readFileSync("./products.json", "utf-8")
        )

        const index = data.products.findIndex(p => p.id === id)
        if (index === -1) return null

        data.products[index] = {
            ...data.products[index],
            ...updatedProduct
        }

        fs.writeFileSync("./products.json", JSON.stringify(data, null, 2))
        return data.products[index]
    },

    delete: (id) => {
        const data = JSON.parse(
            fs.readFileSync("./products.json", "utf-8")
        )

        const index = data.products.findIndex(p => p.id === id)
        if (index === -1) return false

        data.products.splice(index, 1)
        data.count = data.products.length

        fs.writeFileSync("./products.json", JSON.stringify(data, null, 2))
        return true
    }
}


const DBStorage = {

    getAll: async () => {
        return await Product.findAll({
            include: {
                model: SubCategory,
                include: Category
            }
        })
    },

    getById: async (id) => {
        return await Product.findByPk(id)
    },

    create: async (product) => {
        return await Product.create(product)
    },

    update: async (id, updatedProduct) => {
        const product = await Product.findByPk(id)
        if (!product) return null

        await product.update(updatedProduct)
        return product
    },

    delete: async (id) => {
        const product = await Product.findByPk(id)
        if (!product) return false

        await product.destroy()
        return true
    }
}


const storage = STORAGE_TYPE === "db" ? DBStorage : FileStorage



app.get("/products", async (req, res) => {
    const products = await storage.getAll()
    res.json(products)
})


app.get("/products/:id", async (req, res) => {
    const id = parseInt(req.params.id)
    const product = await storage.getById(id)

    if (!product)
        return res.status(404).json({ message: "Product not found" })

    res.json(product)
})


app.post("/products", async (req, res) => {
    const product = await storage.create(req.body)
    res.status(201).json(product)
})


app.put("/products/:id", async (req, res) => {
    const id = parseInt(req.params.id)
    const updated = await storage.update(id, req.body)

    if (!updated)
        return res.status(404).json({ message: "Product not found" })

    res.json(updated)
})


app.delete("/products/:id", async (req, res) => {
    const id = parseInt(req.params.id)
    const deleted = await storage.delete(id)

    if (!deleted)
        return res.status(404).json({ message: "Product not found" })

    res.status(204).send()
})


/*if (STORAGE_TYPE === "db") {
    conn.sync().then(() => {
        app.listen(9000, () => {
            console.log("Running with DATABASE storage")
        })
    })

} 


/* Uncomment below if running for the first time, uncomment above and comment below after the frist run */

/*

if (STORAGE_TYPE === "db") {
    conn.sync({ force: true }).then(() => {
        console.log("Tables created")
        app.listen(9000, () => {
            console.log("Running with DATABASE storage")
        })
    })
} 

/* Uncomment else after uncommenting any of the above*/

/*

else {
    app.listen(9000, () => {
        console.log("Running with FILE storage")
    })
}*/