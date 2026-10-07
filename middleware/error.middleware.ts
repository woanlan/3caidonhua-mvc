import type {ErrorRequestHandler} from 'express';
import {HttpError} from '../utils/validation.ts';
export const errorHandler:ErrorRequestHandler=(err,req,res,next)=>{
 if(res.headersSent){next(err);return;}
 if(err instanceof HttpError){res.status(err.status).json({error:err.message});return;}
 if(err.code==='ER_DUP_ENTRY'){res.status(409).json({error:'Email, slug hoặc SKU đã tồn tại.'});return;}
 if(['ER_ROW_IS_REFERENCED_2','ER_NO_REFERENCED_ROW_2'].includes(err.code)){res.status(409).json({error:'Dữ liệu đang được sử dụng hoặc tham chiếu không tồn tại.'});return;}
 if(err.type==='entity.parse.failed'){res.status(400).json({error:'JSON không hợp lệ.'});return;}
 if(err.type==='entity.too.large'){res.status(413).json({error:'Nội dung quá lớn.'});return;}
 console.error(err.code||err.message);res.status(500).json({error:'Không thể xử lý yêu cầu. Kiểm tra kết nối database và terminal server.'});
};
