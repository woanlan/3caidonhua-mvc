import {randomUUID} from 'node:crypto';
import {transaction,rows,execute} from '../config/database.ts';
import * as carts from '../models/cart.model.ts';
import * as orders from '../models/order.model.ts';
import {text,HttpError,assertTransition} from '../utils/validation.ts';
export async function placeOrder(userId:number,body:Record<string,unknown>){
 const address={recipient:text(body.recipient,'Người nhận',100),phone:text(body.phone,'Số điện thoại',20),address:text(body.address,'Địa chỉ',500)};
 if(!/^[0-9+ ()-]{9,20}$/.test(address.phone))throw new HttpError(400,'Số điện thoại không hợp lệ.');
 return transaction(async db=>{
  const cartId=await carts.ensureCart(db,userId);const lines=await carts.listLocked(db,cartId);if(!lines.length)throw new HttpError(409,'Giỏ hàng trống hoặc đơn đã được tạo.');
  // Fixed lock ordering: cart -> products by ID -> variants by ID.
  const refs=await rows(db,'SELECT DISTINCT v.product_id FROM cart_items ci JOIN product_variants v ON v.variant_id=ci.variant_id WHERE ci.cart_id=? ORDER BY v.product_id',[cartId]);
  for(const ref of refs){const p=(await rows(db,'SELECT status FROM products WHERE product_id=? FOR UPDATE',[ref.product_id]))[0];if(p.status!=='active')throw new HttpError(409,'Một sản phẩm đã ngừng bán.');}
  let total=0;const checked:any[]=[];
  for(const line of lines){const p=(await rows(db,'SELECT v.*,p.name FROM product_variants v JOIN products p ON p.product_id=v.product_id WHERE variant_id=? FOR UPDATE',[line.variantId]))[0];if(!p||p.status!=='active'||p.stock_quantity-p.reserved_quantity<line.quantity)throw new HttpError(409,'Sản phẩm không đủ tồn kho.');total+=p.price*line.quantity;checked.push({...p,quantity:line.quantity});}
  const code='3CN-'+randomUUID().slice(0,12).toUpperCase();const orderId=await orders.insertOrder(db,userId,code,address,total);
  for(const p of checked){await orders.insertItem(db,orderId,p,p.quantity);await execute(db,'UPDATE product_variants SET stock_quantity=stock_quantity-? WHERE variant_id=?',[p.quantity,p.variant_id]);}
  await execute(db,'INSERT INTO payments(order_id,method,provider,amount) VALUES(?,?,?,?)',[orderId,'cod','manual',total]);await carts.clear(db,cartId);return{id:orderId,code,total,status:'pending'};
 });
}
export async function changeStatus(orderId:number,status:string){return transaction(async db=>{const o=await orders.lockedOrder(db,orderId);if(!o)throw new HttpError(404,'Không tìm thấy đơn.');assertTransition(o.status,status);
 if(status==='cancelled'){const items=await rows(db,'SELECT variant_id,quantity FROM order_items WHERE order_id=? ORDER BY variant_id',[orderId]);for(const x of items)await execute(db,'UPDATE product_variants SET stock_quantity=stock_quantity+? WHERE variant_id=?',[x.quantity,x.variant_id]);await execute(db,'UPDATE payments SET status="cancelled" WHERE order_id=? AND status="pending"',[orderId]);}
 await orders.setStatus(db,orderId,status);return{ok:true};});}
