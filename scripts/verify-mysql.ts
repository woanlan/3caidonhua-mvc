import {spawnSync} from 'node:child_process';
const main=process.env.DB_NAME||'gundamshop_mvc';const name=main.endsWith('_test')?main:main+'_test';
if(!/^[a-zA-Z0-9_]+_test$/.test(name))throw new Error('Tên database test không hợp lệ.');
console.log('Integration test database:',name);
const env={...process.env,DB_NAME:name,TEST_MYSQL:'1'};
for(const args of [['scripts/init-db.ts'],['--test','tests/mysql.integration.test.ts']]){const result=spawnSync(process.execPath,args,{env,stdio:'inherit'});if(result.status!==0)process.exit(result.status||1);}
