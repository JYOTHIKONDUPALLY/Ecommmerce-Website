import { Search, SentimentDissatisfied } from "@mui/icons-material";
import { act } from 'react-dom/test-utils';
import {
  CircularProgress,
  Grid,
  InputAdornment,
  TextField,
} from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import { config } from "../App";
import Footer from "./Footer";
import Header from "./Header";
import "./Products.css";
import ProductCard from "./ProductCard";
import Cart, { generateCartItemsFrom } from "./Cart";

const Products = () => {
  let token = localStorage.getItem("token");
  const [items, setItems] = useState([]);
  const { enqueueSnackbar } = useSnackbar();
  const [searchText, setSearchText] = useState("");
  const [debouncieTimeout, setDebounceTimeout] = useState(0);
  const [isLoading, setLoading] = useState(false);
  const [isCartLoad, setCartLoad] = useState(false);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);

  
  // TODO: CRIO_TASK_MODULE_PRODUCTS - Fetch products data and store it

  const performAPICall = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${config.endpoint}/products`);
      setLoading(false);
      setProducts(response.data);
      setFilteredProducts(response.data);
      setCartLoad(true);
      // let items = await fetchCart(token);
      // setItems(generateCartItemsFrom(items, response.data));
    } catch (e) {
      setLoading(false);

      if (e.response && e.response.status === 500) {
        enqueueSnackbar(e.response.data.message, { varient: "error" });
        return null;
      } else {
        enqueueSnackbar(
          "could not fetch products. Check that the backen is running, reachable and returns valid JSON.",
          { varient: "error" }
        );
      }
    }
  };
  useEffect(() => {
    performAPICall();
  }, []);

  // TODO: CRIO_TASK_MODULE_PRODUCTS - Implement search logic

  const performSearch = async (text) => {
    try {
      const response = await axios.get(
        `${config.endpoint}/products/search?value=${text}`
      );
      setFilteredProducts(response.data);
    } catch (e) {
      if (e.response) {
        if (e.response.status === 404) {
          setFilteredProducts([]);
        }
        if (e.response.status === 500) {
          enqueueSnackbar(e.response.data.message, { varient: "error" });
          setFilteredProducts([...products]);
        }
      } else {
        enqueueSnackbar(
          "Could not fetch products. Check that the backend is running, reachable and return valid JSON ",
          { varient: "error" }
        );
      }
    }
  };

  // TODO: CRIO_TASK_MODULE_PRODUCTS - Optimise API calls with debounce search implementation

  const debounceSearch = (event, debounceTimeout) => {
    const value = event.target.value;

    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }
    const timeout = setTimeout(() => {
      performSearch(value);
    }, 500);
    setDebounceTimeout(timeout);
  };

  useEffect(() => {
    fetchCart(token)
      .then((cartData) => generateCartItemsFrom(cartData, products))
      .then((cartItems) => setItems(cartItems));
  }, [isCartLoad]);

  const fetchCart = async (token) => {
    if (!token) return;

    try {
      // TODO: CRIO_TASK_MODULE_CART - Pass Bearer token inside "Authorization" header to get data from "GET /cart" API and return the response data
      let response = await axios.get(`${config.endpoint}/cart`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (e) {
      if (e.response && e.response.status === 400) {
        enqueueSnackbar(e.response.data.message, { variant: "error" });
      } else {
        enqueueSnackbar(
          "Could not fetch cart details. Check that the backend is running, reachable and returns valid JSON.",
          {
            variant: "error",
          }
        );
      }
      return null;
    }
  };

  // TODO: CRIO_TASK_MODULE_CART - Return if a product already exists in the cart

  const isItemInCart = (items, productId) => {
    //console.log(items, productId);
    // return !!items.find((item)=>item.productId===productId)
    let isIn = false;

    items.forEach((item) => {
      if (item.productId === productId) isIn = true;
    });
    return isIn;
  };

  // const updateCartItems = (cartData, products) => {
  //   console.log("updateCartItems", cartData, products);
  //   const cartItems = generateCartItemsFrom(cartData, products);
  //   console.log("cartItems", cartItems);
  //   setItems(cartItems);
  //   return cartItems;
  // };

  const addToCart = async (
    token,
    items,
    products,
    productId,
    qty,
    options = { preventDuplicate: false }
  ) => {
    token=localStorage.getItem("token")
    // console.log(token, items, products, productId, qty);
    if (!token) {
      enqueueSnackbar("login to add an item to cart", {
        variant: "error",
      });
    }
    //  console.log("items", items)
     console.log("token", localStorage.getItem("token"))
    try {
      if (options.preventDuplicate) {
        if (isItemInCart(items, productId)) {
          enqueueSnackbar("item already in cart", {
            variant: "error",
          });
          return;
        }
      }

      const body = {
        productId: productId,
        qty: qty,
      };
      let response = await axios.post(`${config.endpoint}/cart`, body, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const cartItems = generateCartItemsFrom(response.data, products);
      //console.log(cartItems, "sdasdasdasdasdsadasd");
      
        setItems(cartItems);
      
      // updateCartItems(response.data, products);
    } catch (e) {
      if (e.response && e.response.status === 400) {
        enqueueSnackbar(e.response.data.message, { variant: "error" });
      } else {
        enqueueSnackbar(
          "Could not additems to cart. Check that the backend is running, reachable and returns valid JSON.",
          {
            variant: "error",
          }
        );
      }
      return null;
    }
  };

  return (
    <div>
      <Header>
        {/* TODO: CRIO_TASK_MODULE_PRODUCTS - Display search bar in the header for Products page */}
        <TextField
          className="search-desktop"
          size="small"
          fullWidth
          InputProps={{
            className: "search",
            endAdornment: (
              <InputAdornment position="end">
                <Search color="primary" />
              </InputAdornment>
            ),
          }}
          placeholder="Search for items/categories"
          name="search"
          value={searchText}
          onChange={(e) => {
            setSearchText(e.target.value);
            debounceSearch(e, debouncieTimeout);
          }}
        />
      </Header>

      {/* Search view for mobiles */}
      <TextField
        className="search-mobile"
        size="small"
        value={searchText}
        fullWidth
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Search color="primary" />
            </InputAdornment>
          ),
        }}
        placeholder="Search for items/categories"
        name="search"
        onChange={(e) => {
          setSearchText(e.target.value);
          debounceSearch(e, debouncieTimeout);
        }}
      />

      <Grid container>
        <Grid
          item
          xs={12}
          md={token && products.length ? 9 : 12}
          className="product-grid"
        >
          <Box className="hero">
            <p className="hero-heading">
              India’s <span className="hero-highlight">FASTEST DELIVERY</span>{" "}
              to your door step
            </p>
          </Box>

          {isLoading ? (
            <Box className="loading">
              <CircularProgress />
              <h4>Loading Products ...</h4>
            </Box>
          ) : (
            <Grid container marginY="1rem" paddingX="1rem" spacing={2}>
              {filteredProducts.length ? (
                filteredProducts.map((product) => (
                  <Grid item xs={6} md={3} key={product._id}>
                    {/* {console.log("items", items)} */}
                    <ProductCard
                      product={product}
                      handleAddToCart={async () => {
                        await addToCart(
                          token,
                          items,
                          products,
                          product._id,
                          1,
                          { preventDuplicate: true }
                        );
                      }}
                    />
                  </Grid>
                ))
              ) : (
                <Box className="loading">
                  <SentimentDissatisfied color="action" />
                  <h4 style={{ color: "#636363" }}>No products found</h4>
                </Box>
              )}
            </Grid>
          )}
        </Grid>
        {token && (
          <Grid
            container
            item
            xs={12}
            md={3}
            style={{ backgroundColor: "#E9F5E1", height: "100vh" }}
          >
            <Cart
              hasCheckoutButton
              products={products}
              items={items}
              handleQuantity={addToCart}
            />
          </Grid>
        )}
      </Grid>

      <Footer />
    </div>
  );
};

export default Products;
