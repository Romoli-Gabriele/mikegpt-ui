import Stripe from 'stripe';
import {useAuth} from "../hooks/useAuth.jsx";

const sk = "sk_test_51OYqUwJ7S8yxZLrWWoV2MdH8JUa6ASOPAxpNSrsi9mz2eCvX2VWzkmlUhjm3paqWI8CqqEHdsYYwKvepM2gNqnM400znIifH0D";

const stripe = new Stripe(sk, {
    apiVersion: '2024-06-20',
});

export const getProducts = async () => {
    const products= await stripe.products.list();
    return products.data;
}

export const getPrices = async (productId) => {
    const prices = await stripe.prices.list({
        product: productId,
    });
    return prices.data[0];
}

export const checkSubscriptionActive = async (subscriptionId) => {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    return subscription.status === 'active';
}


export const createCheckoutSession = async (productId) => {

    const price = await getPrices(productId);


    const session =  await stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [
            {
                price: price.id,
                quantity: 1,
            },
        ],
        success_url: window.location.origin + '/',
        //TODO aggiungere url al backend per salvare i dati dell'utente (subscriptionId) e poi fare redirect alla home
        cancel_url: window.location.origin + '/products',
    });

    window.open(session.url, "_self");

}

export const unsubscribeStripe = async (subscriptionId) => {
    return await stripe.subscriptions.cancel(subscriptionId);
}


