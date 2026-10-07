import {transaction,rows} from '../config/database.ts';
import * as model from '../models/cart.model.ts';
import {HttpError} from '../utils/validation.ts';
export const setQuantity=(userId:number,variantId:number,quantity:number)=>transaction(async db=>{const cartId=await model.ensureCart(db,userId);if(quantity===0){await model.deleteLine(db,cartId,variantId);return;}
 const p=(await rows(db,'SELECT v.stock_quantity-v.reserved_quantity AS available,v.status,p.status AS productStatus FROM product_variants v JOIN products p ON p.product_id=v.product_id WHERE v.variant_id=?',[variantId]))[0];
 if(!p||p.status!=='active'||p.productStatus!=='active')throw new HttpError(409,'Sản phẩm không còn bán.');if(quantity>p.available)throw new HttpError(409,'Số lượng vượt tồn kho.');await model.setLine(db,cartId,variantId,quantity);});
