import { Product } from "../models/product.js";
import type {  ProductAttributes } from "../models/product.js";
import { ProductType } from "../models/productType.js";
import { ProductSize } from "../models/productSize.js";
import { Size } from "../models/size.js";
import { Favourite } from "../models/favourite.js";
import { Cart } from "../models/cart.js";
import { CartDetail } from "../models/cartDetail.js";


export interface FilterOptions {
  brandId?: number[];
  price?: [number, number];
}

export interface ProductWithRating extends Product {
  dataValues: ProductAttributes & { averageRating: string | null };
}

export interface ProductWithRatingAttributes extends ProductAttributes {
  averageRating: string | null;
}

export interface FavouriteWithProduct extends Favourite {
  ProductFavouriteData: ProductWithRating;
}

export interface UnreviewedItem {
    productId: number;
    orderId: number;
    quantity: number;
    totalPrice: number;
    SizeOrderDetailData: { sizeId: number; sizeName: string; };
    ProductDetailData: { image: string; name: string; price: number; discount: number; };
}

// Level 4: The deepest nested data
export interface EnrichedProduct extends Product {
  productTypeData: ProductType;
}

// Level 3: The shape of each item in the cart
export interface EnrichedCartDetail extends CartDetail {
  productData: EnrichedProduct;
  sizeData: Size;
  stockData: ProductSize | null; // Can be null if no inventory entry exists
}

// Level 2: The shape of the main Cart object
export interface EnrichedCart extends Cart {
  cartDetails: EnrichedCartDetail[]; // The cart includes an array of enriched details
}