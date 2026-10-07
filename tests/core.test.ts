import test from 'node:test';import assert from 'node:assert/strict';
import {productInput,integer,assertTransition,slug} from '../utils/validation.ts';
import {hashPassword,verifyPassword} from '../utils/password.ts';
import {app} from '../app.ts';import {pool} from '../config/database.ts';
test('Reject invalid prices, stock, IDs and slugs',()=>{for(const x of [-1,1.2,'abc',null,undefined,'',true])assert.throws(()=>integer(x,'Giá',0));assert.throws(()=>slug('../../secret'));assert.throws(()=>productInput({name:'Kit',price:100}));assert.equal(integer('12000','Giá',0),12000);});
test('Order transition protects final states and prevents repeated cancellation',()=>{assertTransition('pending','confirmed');assertTransition('confirmed','cancelled');assert.throws(()=>assertTransition('cancelled','cancelled'));assert.throws(()=>assertTransition('completed','pending'));assert.throws(()=>assertTransition('pending','completed'));});
test('Passwords are salted and verified, never plaintext',async()=>{const password='ExamplePassword123!';const a=await hashPassword(password),b=await hashPassword(password);assert.notEqual(a,b);assert.ok(!a.includes(password));assert.equal(await verifyPassword(password,a),true);assert.equal(await verifyPassword('wrong password',a),false);});
test('HTTP static assets, video ranges and unauthorized API protections',async()=>{
 const server=app.listen(0,'127.0.0.1');await new Promise<void>(resolve=>server.once('listening',resolve));const addr=server.address();if(typeof addr!=='object'||!addr)throw new Error('No address');const base='http://127.0.0.1:'+addr.port;
 try{
  const page=await fetch(base+'/');assert.equal(page.status,200);assert.match(await page.text(),/hero-video/);
  const css=await fetch(base+'/css/style.css');assert.equal(css.status,200);
  const js=await fetch(base+'/js/app.js');assert.equal(js.status,200);
  const range=await fetch(base+'/assets/hero.mp4',{headers:{Range:'bytes=0-1023'}});assert.equal(range.status,206);assert.equal((await range.arrayBuffer()).byteLength,1024);
  for(const path of ['/api/admin/products','/api/admin/orders','/api/cart','/api/orders','/api/auth/me']){assert.equal((await fetch(base+path)).status,401,path);}
  const forbidden=await fetch(base+'/api/auth/login',{method:'POST',headers:{Origin:'https://other.example','Content-Type':'application/json'},body:'{}'});assert.equal(forbidden.status,403);
  const malformed=await fetch(base+'/api/products',{method:'POST',headers:{'Content-Type':'application/json'},body:'['});assert.equal(malformed.status,400);
  const empty=await fetch(base+'/api/products',{method:'POST',headers:{'Content-Type':'application/json'},body:'[]'});assert.equal(empty.status,400);
  assert.equal((await fetch(base+'/.env')).status,404);assert.equal((await fetch(base+'/config/database.ts')).status,404);
 }finally{await new Promise<void>((resolve,reject)=>server.close(e=>e?reject(e):resolve()));await pool.end();}
});
