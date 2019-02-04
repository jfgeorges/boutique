const express = require("express");
const router = express.Router();

const Review = require("../models/mreview");
const Product = require("../models/mproduct");
const Department = require("../models/mdepartment");
const Category = require("../models/mcategory");

// --------- //
// FONCTIONS //
// --------- //

// Calcule la moyenne des notes d'un produit
const ratingCalculate = async objProduct => {
  // Ajoute le détail des Reviews à la variable objet 'product'
  await Review.populate(objProduct, {
    path: "reviews",
    model: "Review"
  });
  // Calcul de la moyenne et arrondi à 2 décimales
  objProduct.averageRating = (
    objProduct.reviews.reduce((total, currentReview) => {
      return total + currentReview.rating;
    }, 0) / objProduct.reviews.length
  ).toFixed(2);
};

// CREATE
router.post("/review/create", async (req, res) => {
  try {
    // Reçoit un tableau de reviews
    let nbReviews = 0;
    for (let i = 0; i < req.body.length; i++) {
      const product = await Product.findById(req.body[i].productId);

      if (product) {
        const newReview = new Review({
          rating: req.body[i].rating,
          comment: req.body[i].comment,
          username: req.body[i].username
        });

        if (product.reviews === undefined) {
          product.reviews = [];
        }

        // const reviewCreated = await newReview.save(); // Sauvegarde de la Review pour récupérer son ID
        // product.reviews.push(reviewCreated._id);
        product.reviews.push(await newReview.save()); // Changé pour sauver la Review et enregistrer l'Id en une seule étape
        // Calcul de la note moyenne
        await ratingCalculate(product);
        // Sauvegarde du produit noté
        await product.save();
        nbReviews++;
      } else {
        return res.status(400).json({
          message: "Product not found"
        });
      }
    }
    return res.json({ message: `${nbReviews} reviews created` });
  } catch (error) {
    res.status(400).json({
      message: error.message
    });
  }
});

// UPDATE
router.post("/review/update", async (req, res) => {
  try {
    const review = await Review.findById(req.query.reviewId);

    if (review) {
      review.rating = req.body.rating;
      review.comment = req.body.comment;
      await review.save();

      // MAJ de la note moyenne du produit
      // Identifie le produit à partir de l'Id review
      const product = await Product.findOne({ reviews: { $in: [req.query.reviewId] } });
      if (product) {
        // Calcul de la moyenne
        await ratingCalculate(product);
        product.save();
        res.json(product);
      } else {
        res.status(400).json({
          message: "Review not found"
        });
      }
    }
  } catch (error) {
    res.status(400).json({
      message: error.message
    });
  }
});

// DELETE
router.post("/review/delete", async (req, res) => {
  try {
    const review = await Review.findById(req.query.reviewId);
    if (review) {
      // MAJ de la note moyenne du produit
      const product = await Product.findOne({ reviews: { $in: [req.query.reviewId] } });
      if (product) {
        const newReviews = [];
        for (let i = 0; i < product.reviews.length; i++) {
          if (String(product.reviews[i]._id) !== req.query.reviewId) {
            newReviews.push(product.reviews[i]);
          }
        }
        if (newReviews.length > 0) {
          product.reviews = newReviews;
        }
        // Calcul de la note moyenne du produit
        await ratingCalculate(product);
        product.save();
      }
      await review.remove();
      res.json({ message: "Review removed" });
    } else {
      res.status(400).json({
        message: "Review not found"
      });
    }
  } catch (error) {
    res.status(400).json({
      message: error.message
    });
  }
});

module.exports = router;
