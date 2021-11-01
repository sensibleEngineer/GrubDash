const e = require("express");
const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass

function orderExists(req, res, next) {
  const { orderId } = req.params;
  const foundOrder = orders.find((order) => orderId == order.id)
  if(foundOrder) {
    res.locals.order = foundOrder;
    return next();
  };
  return next({
    status: 404,
    message: `Order id does not exist: ${orderId}`
  })
}

function validateProperties(req, res, next) {
  const { data: { deliverTo, mobileNumber, dishes } = {} } = req.body;
  if(!deliverTo || deliverTo == "") {
    return next({
        status: 400,
        message: `Order must include a deliverTo`
    })
  }
  if (!mobileNumber || mobileNumber == "") {
    return next({
        status: 400,
        message: `Order must include a mobileNumber`
    });
  }
  if (!dishes) {
    return next({
        status: 400,
        message: `Order must include a dish`
    });
  }
  if (!Array.isArray(dishes) || dishes.length <= 0) {
    return next({
      status: 400,
      message: `Order must include at least one dish`,
    });
  }
  dishes.forEach((dish, index) => {
    if ( !dish.quantity || dish.quantity <= 0 || !Number.isInteger(dish.quantity) ) {
      return next({
        status: 400,
        message: `Dish ${index} must have a quantity that is an integer greater than 0`,
      });
    }
  });
  return next();
}

function list(req, res, next) {
res.json({ data: orders })
}

function create(req, res, next) {
const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;
const createdOrder = {
    id: nextId(),
    deliverTo,
    mobileNumber,
    status,
    dishes
}
orders.push(createdOrder);
res.status(201).json({ data: createdOrder})
}

function read(req, res, next) {
  res.json({ data: res.locals.order })
}


function update  (req, res, next)  {
    const { orderId } = req.params;
    const originalOrder = res.locals.order;
    const {
      data: { id, deliverTo, mobileNumber, status, dishes },
    } = req.body;
    if (id && id !== orderId)
      return next({
        status: 400,
        message: `Order id does not match route id. Order: ${id}, Route: ${orderId}`,
      });
    if (!status || status == "")
      return next({ status: 400, message: `Order must include a status` });
    if (status === "invalid")
      return next({ status: 400, message: `Order status must be valid` });
    if (status === "delivered")
      return next({
        status: 400,
        message: `A delivered order cannot be changed.`,
      });
    res.locals.order = {
      id: originalOrder.id,
      deliverTo: deliverTo,
      mobileNumber: mobileNumber,
      status: status,
      dishes: dishes,
    };
    res.json({ data: res.locals.order });
  };
  
function destroy (req, res, next) {
    if (res.locals.order.status !== "pending")
      return next({
        status: 400,
        message: `An order cannot be deleted unless it is pending`,
      });
    const { orderId } = req.params;
    const index = orders.findIndex((order) => order.id == orderId);
    if (index > -1) orders.splice(index, 1);
    res.sendStatus(204);
  };
  

module.exports = {
    list,
    create: [validateProperties, create],
    read: [orderExists, read],
    update: [orderExists, validateProperties, update],
    delete: [orderExists, destroy]
  }