const express = require("express");
const router = express.Router();

const Product = require("../models/mproduct");
const Department = require("../models/mdepartment");
const Category = require("../models/mcategory");

router.post("/department/create", async (req, res) => {
  try {
    // Reçoit un tableau de départements
    let nbDpt = 0;
    for (let i = 0; i < req.body.length; i++) {
      const newDpt = new Department({ title: req.body[i].title });
      await newDpt.save();
      nbDpt++;
    }
    res.json({ message: `${nbDpt} department(s) created` });
  } catch (error) {
    res.status(400).json({
      message: error.message
    });
  }
});

router.get("/department", async (req, res) => {
  try {
    const departments = await Department.find();
    res.json(departments);
  } catch (error) {
    res.status(400).json({
      message: error.message
    });
  }
});

router.post("/department/update", async (req, res) => {
  // req.query.id

  try {
    const department = await Department.findById(req.query.id);

    // Est-ce que department existe ?
    if (department) {
      department.title = req.body.title;
      await department.save();
      res.json(department);
    } else {
      res.status(400).json({
        message: "Department not found"
      });
    }
  } catch (error) {
    res.status(400).json({
      message: error.message
    });
  }
});

router.post("/department/delete", async (req, res) => {
  try {
    const department = await Department.findById(req.query.id);
    if (department) {
      await department.remove();

      // Supprimer aussi les categories
      const categories = await Category.find({
        department: req.query.id
      });

      // Version 1
      // for (let i = 0; i < categories.length; i++) {
      //   await categories[i].remove();
      // }
      // Version 2
      await categories.remove();

      // TODO
      // Delete categories

      res.json({ message: "Department removed" });
    } else {
      res.status(400).json({
        message: "Department not found"
      });
    }
  } catch (error) {
    res.status(400).json({
      message: error.message
    });
  }
});

module.exports = router;
