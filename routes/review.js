const express = require("express");
const router = express.Router();

const Review = require("../models/mreview");
const Product = require("../models/mproduct");
const Department = require("../models/mdepartment");
const Category = require("../models/mcategory");

// --------- //
// FONCTIONS //
// --------- //
// Supprime les valeurs === value du tableau 'arr'
const arrayRemove = (arr, value) => {
  return arr.filter(ele => {
    return ele !== value;
  });
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
        // Ajoute le détail des Reviews à la variable objet 'product'
        await Review.populate(product, {
          path: "reviews",
          model: "Review"
        });
        // Calcul de la moyenne et arrondi à 2 décimales
        product.averageRating = (
          product.reviews.reduce((total, currentReview) => {
            return total + currentReview.rating;
          }, 0) / product.reviews.length
        ).toFixed(2);
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
      const product = await Product.findOne({ reviews: { $in: [req.query.reviewId] } });
      if (product) {
        // IDEM CREATE
        // Ajoute le détail des Reviews à la variable objet 'product'
        await Review.populate(product, {
          path: "reviews",
          model: "Review"
        });
        // Calcul de la moyenne et arrondi à 2 décimales
        product.averageRating = (
          product.reviews.reduce((total, currentReview) => {
            return total + currentReview.rating;
          }, 0) / product.reviews.length
        ).toFixed(2);
      }
      product.save();
      res.json(product);
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
        // console.log("Avant:", product.reviews);
        // IDEM CREATE
        // Ajoute le détail des Reviews à la variable objet 'product'
        await Review.populate(product, {
          path: "reviews",
          model: "Review"
        });
        // Calcul de la moyenne et arrondi à 2 décimales
        // console.log("Après:", product.reviews);
        product.averageRating = (
          product.reviews.reduce((total, currentReview) => {
            return total + currentReview.rating;
          }, 0) / product.reviews.length
        ).toFixed(2);
      }
      product.save();
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
