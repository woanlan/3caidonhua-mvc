import mysql from 'mysql2/promise';
export const dbOptions = {host:process.env.DB_HOST||'127.0.0.1',port:Number(process.env.DB_PORT||3306),user:process.env.DB_USER||'root',password:process.env.DB_PASSWORD||'',database:process.env.DB_NAME||'gundamshop_mvc',charset:'utf8mb4',decimalNumbers:true,timezone:'Z',waitForConnections:true,connectionLimit:10};
export const pool=mysql.createPool(dbOptions);
export type DB = mysql.Pool | mysql.PoolConnection;
export async function rows<T = Record<string, any>>(db:DB,sql:string,args:any[]=[]):Promise<T[]>{const [r]=await db.execute(sql,args);return r as T[];}
export async function execute(db:DB,sql:string,args:any[]=[]){const [r]=await db.execute<mysql.ResultSetHeader>(sql,args);return r;}
export async function transaction<T>(fn:(db:mysql.PoolConnection)=>Promise<T>):Promise<T>{const c=await pool.getConnection();try{await c.beginTransaction();const v=await fn(c);await c.commit();return v;}catch(e){await c.rollback();throw e;}finally{c.release();}}
