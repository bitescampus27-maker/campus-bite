import { createContext, useEffect, useState } from "react";
import { food_list as staticFoodList, menu_list } from "../assets/assets";
import axios from "axios";

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {

    const url = "http://localhost:5000";
    const [food_list, setFoodList] = useState([]);
    const [cartItems, setCartItems] = useState({});
    const [token, setToken] = useState("");
    const currency = "₹";

    // ⭐ DELIVERY FEE FROM BACKEND (default fallback = 10)
    const [deliveryFee, setDeliveryFee] = useState(10);

    // ⭐ Fetch Delivery Fee From Backend
    const fetchDeliveryFee = async () => {
        try {
            const res = await axios.get(`${url}/api/settings/delivery-fee`);
            if (res.data && res.data.deliveryFee !== undefined) {
                setDeliveryFee(res.data.deliveryFee);
            }
        } catch (err) {
            console.error("Delivery fee fetch error:", err);
        }
    };

    const addToCart = async (itemId) => {
        if (!cartItems[itemId]) {
            setCartItems((prev) => ({ ...prev, [itemId]: 1 }));
        } else {
            setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] + 1 }));
        }
        if (token) {
            await axios.post(url + "/api/cart/add", { itemId }, { headers: { token } });
        }
    };

    const removeFromCart = async (itemId) => {
        setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] - 1 }));
        if (token) {
            await axios.post(url + "/api/cart/remove", { itemId }, { headers: { token } });
        }
    };

    const getTotalCartAmount = () => {
        let totalAmount = 0;

        for (const item in cartItems) {
            try {
                if (cartItems[item] > 0) {
                    let itemInfo = food_list.find((product) => product._id === item);
                    totalAmount += itemInfo.price * cartItems[item];
                }
            } catch (error) {}
        }

        return totalAmount;
    };

    const fetchFoodList = async () => {
        const response = await axios.get(url + "/api/food/list");
        setFoodList(response.data.data);
    };

    const loadCartData = async (token) => {
        const response = await axios.post(url + "/api/cart/get", {}, { headers: token });
        setCartItems(response.data.cartData);
    };

    useEffect(() => {
        async function loadData() {
            await fetchFoodList();
            await fetchDeliveryFee(); // ⭐ Load delivery fee on startup

            if (localStorage.getItem("token")) {
                setToken(localStorage.getItem("token"));
                await loadCartData({ token: localStorage.getItem("token") });
            }
        }
        loadData();
    }, []);

    // ⭐ Build items array (used during order placement)
    const buildItemsArray = () => {
        const items = [];
        for (const id in cartItems) {
            try {
                const qty = cartItems[id];
                if (!qty || qty <= 0) continue;

                const info = food_list.find((f) => f._id === id);
                if (!info) continue;

                items.push({
                    _id: info._id,
                    name: info.name || info.title || "Item",
                    price: info.price,
                    quantity: qty
                });
            } catch (err) {}
        }
        return items;
    };

    // ⭐ Place Order Function
    const placeOrder = async (payload) => {
        try {
            const items = buildItemsArray();
            if (items.length === 0) {
                return { success: false, message: "Cart empty" };
            }

            const baseAmount = getTotalCartAmount();
            const amount = baseAmount + (baseAmount === 0 ? 0 : deliveryFee);

            const body = {
                userId: "",
                items,
                amount,
                address: payload.address || {}
            };

            const headers = token ? { headers: { token } } : {};

            if (payload.paymentMethod === "COD") {
                const resp = await axios.post(url + "/api/order/placecod", body, headers);
                if (resp.data && resp.data.success) {
                    setCartItems({});
                    return { success: true, message: resp.data.message || "Order placed" };
                } else {
                    return { success: false, message: resp.data.message || "Order failed" };
                }
            } else {
                const resp = await axios.post(url + "/api/order/place", body, headers);
                if (resp.data && resp.data.success) {
                    return { success: true, session_url: resp.data.session_url };
                } else {
                    return { success: false, message: resp.data.message || "Order failed" };
                }
            }

        } catch (error) {
            console.error("placeOrder error:", error);
            return { success: false, message: "Server error" };
        }
    };

    const contextValue = {
        url,
        food_list,
        menu_list,
        cartItems,
        addToCart,
        removeFromCart,
        getTotalCartAmount,
        token,
        setToken,
        loadCartData,
        setCartItems,
        currency,
        deliveryFee, // ⭐ NEW GLOBAL DELIVERY FEE
        placeOrder
    };

    return (
        <StoreContext.Provider value={contextValue}>
            {props.children}
        </StoreContext.Provider>
    );
};

export default StoreContextProvider;
