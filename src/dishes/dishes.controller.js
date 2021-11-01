const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// Validation middleware

function dishExists(req, res, next) {
  const { dishId } = req.params;
  const foundDish = dishes.find((dish) => dishId === dish.id);
  if(foundDish) {
      res.locals.dish = foundDish;
      return next()
  };
  next({
    status: 404,
    message:`Dish does not exist ${dishId}`
})
}

function validateName(req, res, next) {
  const { data: { name } = {} } = req.body;
  if(name) {
      return next()
  };
  next({
      status: 400,
      message: `Dish must include a name`
  })
}

function validateDes(req, res, next) {
    const { data: { description } = {} } = req.body;
    if(description) {
        return next()
    };
    next({
        status: 400,
        message: `Dish must include a description`
    })
  }

function validatePrice(req, res, next) {
    const { data: { price } = {} } = req.body;
    if(!price) {  
        next({
            status: 400,
            message: `Dish must include a price`
        })
    };
    if(Number(price) < 1 || !Number.isInteger(price) ) {
        next({
            status: 400,
            message: `Dish must have a price that is an integer greater than 0`
        })
    };
    return next();
  }

function validateImgUrl(req, res, next) {
    const { data: { image_url } = {} } = req.body;
    if(image_url) {
        return next()
    };
    next({
        status: 400,
        message: `Dish must include a image_url`
    })
  }

// List of /dishes handlers

function list(req, res, next) {
res.json({ data: dishes})
}

function read(req, res, next) {
  res.json({ data: res.locals.dish })
}

function create(req, res, next) {
  const { data: { name, description, price, image_url } = {} } = req.body;
  const newDish = {
    id: nextId(),
    name,
    description,
    price: Number(price),
    image_url
    };
  dishes.push(newDish)
  res.status(201).json( {data: newDish})
}

function update(req, res, next) {
  const { dishId } = req.params; 
  const { data: { id, name, description, price, image_url } = {} } = req.body;
  const updatedDish = {
      id: dishId,
      name,
      description,
      price,
      image_url
  }
  if(id && id !== dishId) {
    return next({
        status: 400,
        message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`
    })
  }
  res.json({ data: updatedDish })
}

module.exports = {
    read: [dishExists, read],
    update: [dishExists, validateName, validateDes, validatePrice, validateImgUrl, update],
    list,
    create: [validateName, validateDes, validatePrice, validateImgUrl, create]
}
