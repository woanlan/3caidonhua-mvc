import type {RequestHandler} from 'express';
import {createHash} from 'node:crypto';
import {getSession} from '../models/user.model.ts';
import {HttpError} from '../utils/validation.ts';
export const tokenHash=(token:string)=>createHash('sha256').update(token).digest('hex');
export function readToken(cookie=''){return cookie.split(';').map(s=>s.trim()).find(s=>s.startsWith('session='))?.slice(8)||'';}
export const authenticate:RequestHandler=async(req,res,next)=>{const token=readToken(req.headers.cookie);const user=token?await getSession(tokenHash(token)):null;if(!user)throw new HttpError(401,'Vui lòng đăng nhập.');res.locals.user=user;if(!['GET','HEAD','OPTIONS'].includes(req.method)&&req.get('X-CSRF-Token')!==user.csrf)throw new HttpError(403,'Phiên yêu cầu không hợp lệ. Hãy tải lại trang.');next();};
export const adminOnly:RequestHandler=(req,res,next)=>{if(res.locals.user.role!=='admin')throw new HttpError(403,'Chỉ quản trị viên được thực hiện thao tác này.');next();};
// Reject cross-origin browser writes even on unauthenticated login/register routes.
export const sameOrigin:RequestHandler=(req,res,next)=>{if(!['GET','HEAD','OPTIONS'].includes(req.method)){const origin=req.get('origin');if(origin&&origin!==`${req.protocol}://${req.get('host')}`)throw new HttpError(403,'Không chấp nhận yêu cầu từ website khác.');}next();};
const attempts=new Map<string,{count:number;reset:number}>();
export const loginLimit:RequestHandler=(req,res,next)=>{const key=req.ip||'local';const now=Date.now();for(const [k,v] of attempts)if(v.reset<now)attempts.delete(k);const x=attempts.get(key)||{count:0,reset:now+600000};if(++x.count>30)throw new HttpError(429,'Thử đăng nhập quá nhiều. Vui lòng thử lại sau 10 phút.');attempts.set(key,x);next();};
