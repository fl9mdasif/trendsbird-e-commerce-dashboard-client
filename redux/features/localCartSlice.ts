/**
 * localCartSlice — manages the guest (unauthenticated) cart in localStorage.
 * Each item stores the full product + variant info needed to render the cart UI
 * without making API calls.
 */

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { TProduct, TVariant } from "@/types/common";

export interface LocalCartItem {
    productId: string;
    variantId: string;
    quantity: number;
    // Snapshot for rendering (so cart page works offline)
    productName: string;
    productThumbnail: string;
    variantName: string;
    variantSku: string;
    price: number;         // discountPrice ?? price
    originalPrice: number; // variant.price
    stock: number;
    // full product for checkout
    product: TProduct;
    variant: TVariant;
}

interface LocalCartState {
    items: LocalCartItem[];
}

const STORAGE_KEY = "sultan_bazar_guest_cart";

function loadFromStorage(): LocalCartItem[] {
    if (typeof window === "undefined") return [];
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function saveToStorage(items: LocalCartItem[]) {
    if (typeof window === "undefined") return;
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
        // quota exceeded or private mode — silently ignore
    }
}

const initialState: LocalCartState = {
    items: [], // hydrated lazily via loadLocalCart action
};

const localCartSlice = createSlice({
    name: "localCart",
    initialState,
    reducers: {
        // Call this once on app mount to hydrate from localStorage
        loadLocalCart(state) {
            state.items = loadFromStorage();
        },

        addItemToLocalCart(
            state,
            action: PayloadAction<{
                product: TProduct;
                variant: TVariant;
                quantity: number;
            }>
        ) {
            const { product, variant, quantity } = action.payload;
            const existing = state.items.find(
                (i) => i.productId === product._id && i.variantId === variant._id
            );
            const price = variant.discountPrice ?? variant.price;

            if (existing) {
                existing.quantity = Math.min(
                    existing.quantity + quantity,
                    variant.stock
                );
            } else {
                state.items.push({
                    productId: product._id,
                    variantId: variant._id!,
                    quantity,
                    productName: product.name,
                    productThumbnail: product.thumbnail,
                    variantName: variant.name,
                    variantSku: variant.sku,
                    price,
                    originalPrice: variant.price,
                    stock: variant.stock,
                    product,
                    variant,
                });
            }
            saveToStorage(state.items);
        },

        updateLocalCartQty(
            state,
            action: PayloadAction<{
                productId: string;
                variantId: string;
                quantity: number;
            }>
        ) {
            const { productId, variantId, quantity } = action.payload;
            const item = state.items.find(
                (i) => i.productId === productId && i.variantId === variantId
            );
            if (item && quantity >= 1) {
                item.quantity = Math.min(quantity, item.stock);
            }
            saveToStorage(state.items);
        },

        removeItemFromLocalCart(
            state,
            action: PayloadAction<{ productId: string; variantId: string }>
        ) {
            const { productId, variantId } = action.payload;
            state.items = state.items.filter(
                (i) => !(i.productId === productId && i.variantId === variantId)
            );
            saveToStorage(state.items);
        },

        clearLocalCart(state) {
            state.items = [];
            saveToStorage([]);
        },
    },
});

export const {
    loadLocalCart,
    addItemToLocalCart,
    updateLocalCartQty,
    removeItemFromLocalCart,
    clearLocalCart,
} = localCartSlice.actions;

export default localCartSlice.reducer;
