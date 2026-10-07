                                                                                  
                                                                                                                                                                                                                                                                                                                                   
export let user          =null;
export function setUser(value          ){user=value;}
export class ApiError extends Error {status       ;constructor(status       ,message       ){super(message);this.status=status;}}
export async function api       (path       ,method='GET',body         )           {
 let response         ;try{response=await fetch('/api'+path,{method,credentials:'same-origin',headers:{'Content-Type':'application/json',...(user?{'X-CSRF-Token':user.csrf}:{})},...(body===undefined?{}:{body:JSON.stringify(body)})});}catch{throw new ApiError(0,'Không kết nối được server. Kiểm tra terminal và thử lại.');}
 const data=await response.json().catch(()=>({error:'Server trả về dữ liệu không hợp lệ.'}));if(!response.ok)throw new ApiError(response.status,data.message||data.error||'Không thể thực hiện yêu cầu.');return data     ;
}
