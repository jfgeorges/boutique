const express = require("express");
const router = express.Router();

const Review = require("../models/mreview");
const Product = require("../models/mproduct");
const Department = require("../models/mdepartment");
const Category = require("../models/mcategory");

// --------- //
// FONCTIONS //
// --------- //

// Création du filtre produit à partir de la requêtes 'req' reçue du client
// Retourne l'objet contenant les filtres
const createFilters = req => {
  const where = {};

  if (req.query.categoryId) {
    where.category = req.query.categoryId;
  }
  if (req.query.title) {
    where.title = new RegExp(req.query.title, "i"); // trouve une partie du titre sans tenir compte de la casse
  }
  if (req.query.priceMin) {
    where.price = { $gte: req.query.priceMin };
    //   where.price.$gte = req.query.priceMin; // Ne peut pas créer une propriété $gte si l'objet 'price' n'existe pas déjà
  }
  if (req.query.priceMax) {
    if (where.price) {
      where.price.$lte = req.query.priceMax;
    } else {
      where.price = { $lte: req.query.priceMax };
    }
  }
  return where;
};

// ------ //
// ROUTES //
// ------ //
// CREATE
router.post("/product/create", async (req, res) => {
  try {
    // Reçoit un tableau de produits
    let nbProducts = 0;
    for (let i = 0; i < req.body.length; i++) {
      const newProduct = new Product({
        title: req.body[i].title,
        description: req.body[i].description,
        price: req.body[i].price,
        category: req.body[i].categoryId
      });
      await newProduct.save();
      nbProducts++;
    }
    res.json({ message: `${nbProducts} products created` });
  } catch (error) {
    res.status(400).json({
      message: error.message
    });
  }
});

// READ
router.get("/product", async (req, res) => {
  try {
    const filters = createFilters(req);

    // Construction de la recherche, Product.find() renvoie une promesse
    // qui ne sera exécutée qu'avec l'instruction await
    const search = Product.find(filters)
      .populate("category")
      .populate({ path: "category", populate: { path: "department" } })
      .populate({ path: "reviews", populate: { path: "review" } }); // Populate imbriqué pour récupérer le département: produit -> catégorie -> département

    // Ajout du tri
    if (req.query.sort === "price-asc") {
      search.sort({ price: 1 });
    } else if (req.query.sort === "price-desc") {
      search.sort({ price: -1 });
    } else if (req.query.sort === "rating-asc") {
      search.sort({ averageRating: 1 });
    } else if (req.query.sort === "rating-desc") {
      search.sort({ averageRating: -1 });
    }

    // Ajout de la pagination
    if (req.query.page) {
      search.limit(5).skip(5 * (req.query.page - 1));
    }

    // Exécution de la recherche
    const products = await search;

    res.json(products);
  } catch (error) {
    res.status(400).json({
      message: error.message
    });
  }
});

// UPDATE
router.post("/product/update", async (req, res) => {
  try {
    const product = await Product.findById(req.query.id);
    // Est-ce que le produit existe ?
    if (product) {
      product.title = req.body.title;
      product.description = req.body.description;
      product.price = req.body.price;
      product.category = req.body.category;

      await product.save();
      res.json(product);
    } else {
      res.status(400).json({
        message: "Product not found"
      });
    }
  } catch (error) {
    res.status(400).json({
      message: error.message
    });
  }
});

// DELETE
router.post("/product/delete", async (req, res) => {
  try {
    const product = await Product.findById(req.query.id);
    if (product) {
      await product.remove();
      res.json({ message: "Product removed" });
    } else {
      res.status(400).json({
        message: "Product not found"
      });
    }
  } catch (error) {
    res.status(400).json({
      message: error.message
    });
  }
});

module.exports = router;
