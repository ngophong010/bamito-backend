import { Product } from "../models/product.js";
import type {  ProductAttributes } from "../models/product.js";
import { Favourite } from "../models/favourite.js";

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
