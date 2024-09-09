import React, { useEffect, useState, useRef } from 'react';
import { getProducts, createCheckoutSession, getPrices } from '../services/StripeService';
import { Grid, Button, Typography, Stack } from '@mui/material';
import {useAuth} from "../hooks/useAuth.jsx";

const ProductListView = () => {
  const [products, setProducts] = useState([]);
  const [prices, setPrices] = useState([]);
  const hasFetchedProducts = useRef(false);

  const fetchProducts = async () => {
    const productsList = await getProducts();
    productsList.map(async (product) => {
      product.price = (await getPrices(product.id));
      setPrices((prev) => [...prev, product.price]);
    });

    setProducts(productsList);
  };

  const getPrice = (productId) => {
    if (!prices) return 0;
    const price = prices.find((price) => price.product === productId);
    if(!price) return 0;
    return price.unit_amount / 100;
  }

  useEffect(() => {
    if (!hasFetchedProducts.current) {
      fetchProducts();
      hasFetchedProducts.current = true;
    }
  }, []);

  const {user} = useAuth();

  const handleBuy = async (productId) => {
    await createCheckoutSession(productId);
    //TODO da levare quando implementiamo il backend
    user.subscriptionId = ""
  };

  return (
    <Stack spacing={2} sx={{ padding: '3rem'}}>
      <Typography variant="h5" fontWeight="bold" textAlign="center">Available Products</Typography>
      <Grid container spacing={2}>
        {products.map((product) => (
            product.active &&
          <Grid item xs={12} sm={6} md={4} key={product.id}>
            <Stack spacing={1} sx={{ padding: '1rem', border: '1px solid #ccc', borderRadius: '8px' }}>
              <Typography variant="h6">{product.name}</Typography>
              <Typography variant="h6" color="primary">{getPrice(product.id)}€</Typography>
              <Typography variant="body2" color="textSecondary">{product.description}</Typography>
              <Button variant="contained" color="primary" onClick={() => handleBuy(product.id)}>
                Buy
              </Button>
            </Stack>
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
};

export default ProductListView;
