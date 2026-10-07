import test from 'node:test';import assert from 'node:assert/strict';
import {app} from '../app.ts';import {pool,execute,rows} from '../config/database.ts';
// Only runs against an explicitly prepared test database. Never run with production DB_NAME.
test('MySQL CRUD, role/CSRF enforcement, persistent cart, order snapshots and stock rollback',{skip:process.env.TEST_MYSQL!=='1'},async()=>{
 if(!(process.env.DB_NAME||'').endsWith('_test'))throw new Error('Integration tests require DB_NAME ending _test.');
 const server=app.listen(0,'127.0.0.1');await new Promise<void>(resolve=>server.once('listening',resolve));const a=server.address() as {port:number};const base='http://127.0.0.1:'+a.port;
 const tag=Date.now().toString();let admin:any,customer:any,productId=0,categoryId=0,orderId=0;
 async function request(path:string,method='GET',body?:any,auth?:any,csrf=true){const response=await fetch(base+'/api'+path,{method,headers:{'Content-Type':'application/json',...(auth?{Cookie:auth.cookie,...(csrf?{'X-CSRF-Token':auth.csrf}:{})}:{})},...(body===undefined?{}:{body:JSON.stringify(body)})});const data=await response.json();return{status:response.status,data,cookie:response.headers.get('set-cookie')?.split(';')[0]};}
 try{
  const adminReg=await request('/auth/register','POST',{name:'Test Admin',email:`admin-${tag}@example.test`,password:'TestingPassword123!'});assert.equal(adminReg.status,201);admin={...adminReg.data,cookie:adminReg.cookie};await execute(pool,'UPDATE users SET role="admin" WHERE user_id=?',[admin.id]);
  const customerReg=await request('/auth/register','POST',{name:'Test Customer',email:`customer-${tag}@example.test`,password:'TestingPassword123!'});assert.equal(customerReg.status,201);customer={...customerReg.data,cookie:customerReg.cookie};
  const metadata=(await request('/metadata')).data;
  let r=await request('/categories','POST',{name:'Test '+tag,slug:'test-'+tag},admin);assert.equal(r.status,201);categoryId=r.data.id;
  const payload={name:'Kit Test',slug:'kit-'+tag,categoryId,brandId:metadata.brands[0].id,gradeId:metadata.grades[0].id,sku:'SKU-'+tag,price:100000,stock:2};
  assert.equal((await request('/products','POST',payload,customer)).status,403);
  assert.equal((await request('/products','POST',payload,admin,false)).status,403);
  r=await request('/products','POST',payload,admin);assert.equal(r.status,201);productId=r.data.id;const variantId=r.data.variantId;
  assert.equal((await request('/categories/'+categoryId,'DELETE',undefined,admin)).status,409);
  assert.equal((await request('/cart/items/'+variantId,'PUT',{quantity:3},customer)).status,409);
  assert.equal((await request('/cart/items/'+variantId,'PUT',{quantity:2},customer)).status,200);
  const secondRead=await request('/cart','GET',undefined,customer);assert.equal(secondRead.data[0].quantity,2);
  r=await request('/orders','POST',{recipient:'Test',phone:'0900000000',address:'Test address'},customer);assert.equal(r.status,201);orderId=r.data.id;assert.equal(r.data.total,200000);
  assert.equal((await request('/products/'+productId)).data.stock,0);
  assert.equal((await request('/orders','POST',{recipient:'Test',phone:'0900000000',address:'Test address'},customer)).status,409);
  assert.equal((await request('/products/'+productId,'PUT',{...payload,price:150000,stock:0},admin)).status,200);
  assert.equal((await request('/orders','GET',undefined,customer)).data[0].items[0].price,100000);
  assert.equal((await request('/admin/orders/'+orderId+'/status','PATCH',{status:'cancelled'},admin)).status,200);
  assert.equal((await request('/products/'+productId)).data.stock,2);
  assert.equal((await request('/admin/orders/'+orderId+'/status','PATCH',{status:'cancelled'},admin)).status,409);
  assert.equal((await request('/products/'+productId,'DELETE',undefined,admin)).status,200);
  assert.equal((await request('/products/'+productId)).status,404);
  assert.equal((await request('/auth/logout','POST',{},customer)).status,200);
  assert.equal((await request('/orders','GET',undefined,customer)).status,401);
 }finally{
  // Delete only records created by this test in the dedicated test database.
  if(orderId){await execute(pool,'DELETE FROM payments WHERE order_id=?',[orderId]);await execute(pool,'DELETE FROM order_items WHERE order_id=?',[orderId]);await execute(pool,'DELETE FROM orders WHERE order_id=?',[orderId]);}
  for(const u of [admin,customer])if(u){await execute(pool,'DELETE ci FROM cart_items ci JOIN carts c ON ci.cart_id=c.cart_id WHERE c.user_id=?',[u.id]);await execute(pool,'DELETE FROM carts WHERE user_id=?',[u.id]);await execute(pool,'DELETE FROM sessions WHERE user_id=?',[u.id]);await execute(pool,'DELETE FROM users WHERE user_id=?',[u.id]);}
  if(productId){await execute(pool,'DELETE FROM product_variants WHERE product_id=?',[productId]);await execute(pool,'DELETE FROM products WHERE product_id=?',[productId]);}if(categoryId)await execute(pool,'DELETE FROM categories WHERE category_id=?',[categoryId]);
  await new Promise<void>(resolve=>server.close(()=>resolve()));await pool.end();
 }
});
