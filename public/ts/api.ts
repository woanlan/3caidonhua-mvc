export interface User {id:number;name:string;email:string;role:string;csrf:string}
export interface Product {id:number;variantId:number;name:string;slug:string;description:string;categoryId:number;brandId:number;gradeId:number|null;seriesId:number|null;grade:string|null;scale:string;sku:string;price:number;stock:number;status:string;brand:string;series:string|null;category?:string|null;reserved?:number}
export let user:User|null=null;
export function setUser(value:User|null){user=value;}
export class ApiError extends Error {status:number;constructor(status:number,message:string){super(message);this.status=status;}}
export async function api<T=any>(path:string,method='GET',body?:unknown):Promise<T>{
 let response:Response;try{response=await fetch('/api'+path,{method,credentials:'same-origin',headers:{'Content-Type':'application/json',...(user?{'X-CSRF-Token':user.csrf}:{})},...(body===undefined?{}:{body:JSON.stringify(body)})});}catch{throw new ApiError(0,'Không kết nối được server. Kiểm tra terminal và thử lại.');}
 const data=await response.json().catch(()=>({error:'Server trả về dữ liệu không hợp lệ.'}));if(!response.ok)throw new ApiError(response.status,data.error||'Không thể thực hiện yêu cầu.');return data as T;
}
