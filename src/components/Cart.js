import {
  AddOutlined,
  RemoveOutlined,
  ShoppingCart,
  ShoppingCartOutlined,
} from "@mui/icons-material";
import { Button, IconButton, Stack } from "@mui/material";
import { Box } from "@mui/system";
import React from "react";
import { useHistory } from "react-router-dom";
import "./Cart.css";

// Definition of Data Structures used
/**
 * @typedef {Object} Product - Data on product available to buy
 *
 * @property {string} name - The name or title of the product
 * @property {string} category - The category that the product belongs to
 * @property {number} cost - The price to buy the product
 * @property {number} rating - The aggregate rating of the product (integer out of five)
 * @property {string} image - Contains URL for the product image
 * @property {string} _id - Unique ID for the product
 */

/**
 * @typedef {Object} CartItem -  - Data on product added to cart
 *
 * @property {string} name - The name or title of the product in cart
 * @property {string} qty - The quantity of product added to cart
 * @property {string} category - The category that the product belongs to
 * @property {number} cost - The price to buy the product
 * @property {number} rating - The aggregate rating of the product (integer out of five)
 * @property {string} image - Contains URL for the product image
 * @property {string} productId - Unique ID for the product
 */


const token = localStorage.getItem("token");

export const generateCartItemsFrom = (cartData, productsData) => {
  if (!cartData) return;
  const nextCart = cartData.map((item) => {
    return {
      ...item,
      ...productsData.find((product) => item.productId === product._id),
    };
  });
  return nextCart;
};


export const getTotalCartValue = (items = []) => {
  if (!items.length) return 0;
  let total = 0;
  items.forEach((item) => {
    total += item.qty * item.cost;
  });
  return total;
};

export const getTotalItems = (items = []) => {
  let totalQty = 0;
  items.forEach((item) => (totalQty += item.qty));
  return totalQty;
};

const ItemQuantity = ({
  value,
  handleAdd,
  handleDelete,
  isReadOnly
}) => {
  if (isReadOnly){
    return <Box> Qty :{value}</Box>;
  }
  return (
    <Stack direction="row" alignItems="center">
      <IconButton size="small" color="primary" onClick={handleDelete}>
        <RemoveOutlined />
      </IconButton>
      <Box padding="0.5rem" data-testid="item-qty">
        {value}
      </Box>
      <IconButton size="small" color="primary" onClick={handleAdd}>
        <AddOutlined />
      </IconButton>
    </Stack>
  );
};

/**
 * Component to display the Cart view
 *
 * @param { Array.<Product> } products
 *    Array of objects with complete data of all available products
 *
 * @param { Array.<Product> } items
 *    Array of objects with complete data on products in cart
 *
 * @param {Function} handleDelete
 *    Current quantity of product in cart
 *
 *
 */
const Cart = ({ products, items = [], handleQuantity, isReadOnly=false,hasCheckoutButton=false, }) => {
  const history = useHistory();

  if (!items.length) {
    return (
      <Box className="cart empty">
        <ShoppingCartOutlined className="empty-cart-icon" />
        <Box color="#aaa" textAlign="center">
          Cart is empty. Add more items to the cart to checkout.
        </Box>
      </Box>
    );
  }
  // {console.log("cart", items)}
  return (
    <>
      <Box className="cart">
        <Box
          padding="1rem"
          display="flex"
          justifyContext="space-between"
          alignItems="center"
          flexDirection="column"
        >
          {items.map((item) => (
          <Box key={item.productId}>
            {item.qty > 0 ?
          <Box display="flex" alignItems="flex-start" padding="1rem">
            <Box className="image-container">
              <img
                // Add product image
                src={item.image}
                // Add product name as alt eext
                alt={item.name}
                width="100%"
                height="100%"
              />
            </Box>
            <Box
              display="flex"
              flexDirection="column"
              justifyContent="space-between"
              height="6rem"
              paddingX="1rem"
            >
              <div>{item.name}</div>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <ItemQuantity 
                isReadOnly={isReadOnly} value={item.qty}
                handleAdd = {() => {
                  handleQuantity(
                    token,
                    items,
                    products,
                    item.productId,
                   
                    item.qty + 1
                  );
                }}
                handleDelete = {() => {
                  handleQuantity(
                    token,
                    items,
                    products,
                    item.productId,
                   
                    item.qty - 1
                  );
                }}
                />
                <Box padding="0.5rem" fontWeight="700">
                  ${item.cost}
                </Box>
              </Box>
            </Box>
          </Box> : null}
          </Box>
        ))}
        </Box>
        {/* TODO: CRIO_TASK_MODULE_CART - Display view for each cart item with non-zero quantity */}

        <Box color="#3C3C3C" alignSelf="center">
          Order total
        </Box>
        <Box
          color="#3C3C3C"
          fontWeight="700"
          fontSize="1.5rem"
          alignSelf="center"
          data-testid="cart-total"
        >
          ${getTotalCartValue(items)}
        </Box>
      </Box>

      
       { hasCheckoutButton && (
        <Box display="flex" justifyContent="flex-end" className="cart-footer">
        <Button
          color="primary"
          variant="contained"
          startIcon={<ShoppingCart />}
          className="checkout-btn"
          onClick={() => {
            history.push("/checkout");
          }}
        >
          Checkout
        </Button>
      </Box>
       )} 
      
       
      {isReadOnly && (
          <Box className="cart" p={2}>
          <h2>Order Details</h2>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <p>Products</p>
            <p>{getTotalItems(items)}</p>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <p>SubTotal</p>
            <p>${getTotalCartValue(items)}</p>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <p>Shipping Charges</p>
            <p>${0}</p>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" , fontSize:"1.25 rem"}}>
            <h3>Total</h3>
            <h3>${getTotalCartValue(items)}</h3>
          </div>
        </Box>
      )}
      
    </>
  );
};

export default Cart;