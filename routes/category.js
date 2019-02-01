const express = require("express");
const router = express.Router();

const Review = require("../models/mreview");
const Product = require("../models/mproduct");
const Department = require("../models/mdepartment");
const Category = require("../models/mcategory");

// CREATE
router.post("/category/create", async (req, res) => {
  try {
    // Reçoit un tableau de catégories
    let nbCat = 0;
    for (let i = 0; i < req.body.length; i++) {
      const newCat = new Category({ title: req.body[i].title, description: req.body[i].description, department: req.body[i].departmentId });
      await newCat.save();
      nbCat++;
    }
    res.json({ message: `${nbCat} categories created` });
  } catch (error) {
    res.status(400).json({
      message: error.message
    });
  }
});

// READ
router.get("/category", async (req, res) => {
  try {
    const categories = await Category.find().populate("department");
    res.json(categories);
  } catch (error) {
    res.status(400).json({
      message: error.message
    });
  }
});

// UPDATE
router.post("/category/update", async (req, res) => {
  try {
    const category = await Category.findById(req.query.id);
    const department = await Department.findById(req.body.department);

    // Est-ce que la categorie existe ?
    if (category && department) {
      category.title = req.body.title;
      category.description = req.body.description;
      category.department = req.body.department;

      await category.save();
      res.json(category);
    } else {
      res.status(400).json({
        message: "Category or department not found"
      });
    }
  } catch (error) {
    res.status(400).json({
      message: error.message
    });
  }
});

// DELETE
router.post("/category/delete", async (req, res) => {
  try {
    const category = await Category.findById(req.query.id);
    if (category) {
      await category.remove();
      // TODO
      // Delete products
      res.json({ message: "Category removed" });
    } else {
      res.status(400).json({
        message: "Category not found"
      });
    }
  } catch (error) {
    res.status(400).json({
      message: error.message
    });
  }
});

module.exports = router;
