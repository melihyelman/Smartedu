const Category = require('../models/Category');
const Course = require('../models/Course');

exports.createCourse = async (req, res) => {
  try {
    const course = await Course.create(req.body);

    res.status(201).json({
      status: 'Success',
      course,
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      error,
    });
  }
};

exports.getAllCourses = async (req, res) => {
  try {
    const categorySlug = req.query.categories;

    const category = await Category.findOne({ slug: categorySlug });

    let filter = {};

    categorySlug ? (filter = { category: category._id }) : null;

    const courses = await Course.find(filter).sort('-createdAt');
    const categories = await Category.find();

    res.status(200).render('courses', {
      courses,
      categories,
      pageName: 'courses',
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      error,
    });
  }
};

exports.getCourse = async (req, res) => {
  try {
    const course = await Course.findOne({ slug: req.params.slug });
    const categories = await Category.find();

    res.status(200).render('course', {
      course,
      categories,
      pageName: 'courses',
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      error,
    });
  }
};