const mongoose = require("mongoose");

const Product = mongoose.model("Product", {
  title: {
    type: String,
    minlength: 5,
    maxlength: 25,
    required: true
  },
  description: {
    type: String,
    minlength: 0,
    maxlength: 500,
    default: "",
    required: true
  },
  price: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category"
  },
  // Ci-dessous, nous faisons en sorte qu'un produit puisse être lié à plusieurs avis (remarquez la présence du tableau)
  reviews: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Review"
    }
  ],
  averageRating: {
    type: Number,
    min: 0,
    max: 5
  }
});

module.exports = Product;
