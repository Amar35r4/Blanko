const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'change-this-password';
const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, 'data');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(ORDERS_FILE)) fs.writeFileSync(ORDERS_FILE, '[]', 'utf8');

function readOrders(){ try { return JSON.parse(fs.readFileSync(ORDERS_FILE,'utf8')); } catch { return []; } }
function writeOrders(orders){ fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders,null,2), 'utf8'); }
function json(res,status,data){ res.writeHead(status, {'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}); res.end(JSON.stringify(data)); }
function body(req){ return new Promise((resolve,reject)=>{ let s=''; req.on('data',c=>{s+=c;if(s.length>1e6) req.destroy();}); req.on('end',()=>{try{resolve(JSON.parse(s||'{}'))}catch(e){reject(e)}}); req.on('error',reject); }); }
function auth(req){ return req.headers['x-admin-password'] === ADMIN_PASSWORD; }
function safeText(v,max=500){ return typeof v==='string' ? v.trim().slice(0,max) : ''; }

const server=http.createServer(async (req,res)=>{
  try{
    if(req.method==='POST' && req.url==='/api/orders'){
      const b=await body(req);
      const customer=b.customer||{};
      const items=Array.isArray(b.items)?b.items:[];
      if(!safeText(customer.name,120)||!safeText(customer.phone,40)||!safeText(customer.city,80)||!safeText(customer.address,500)||!items.length) return json(res,400,{ok:false,error:'بيانات الطلب غير مكتملة'});
      const order={
        id:'ST-'+Date.now().toString(36).toUpperCase()+'-'+crypto.randomBytes(2).toString('hex').toUpperCase(),
        createdAt:new Date().toISOString(), status:'جديد',
        customer:{name:safeText(customer.name,120),phone:safeText(customer.phone,40),city:safeText(customer.city,80),address:safeText(customer.address,500),notes:safeText(customer.notes,500)},
        items:items.map(x=>({name:safeText(x.name,150),size:safeText(x.size,30),qty:Math.max(1,Math.min(99,Number(x.qty)||1)),price:Math.max(0,Number(x.price)||0)})),
        subtotal:Math.max(0,Number(b.subtotal)||0), shipping:Math.max(0,Number(b.shipping)||0), total:Math.max(0,Number(b.total)||0)
      };
      const orders=readOrders(); orders.unshift(order); writeOrders(orders);
      return json(res,201,{ok:true,orderId:order.id});
    }
    if(req.method==='GET' && req.url==='/api/orders'){
      if(!auth(req)) return json(res,401,{ok:false,error:'غير مصرح'});
      return json(res,200,{ok:true,orders:readOrders()});
    }
    if(req.method==='PATCH' && req.url.startsWith('/api/orders/')){
      if(!auth(req)) return json(res,401,{ok:false,error:'غير مصرح'});
      const id=decodeURIComponent(req.url.split('/').pop()); const b=await body(req); const orders=readOrders(); const o=orders.find(x=>x.id===id);
      if(!o) return json(res,404,{ok:false,error:'الطلب غير موجود'});
      if(['جديد','تم التأكيد','قيد التجهيز','تم الشحن','تم التسليم','ملغي'].includes(b.status)) o.status=b.status;
      writeOrders(orders); return json(res,200,{ok:true});
    }
    if(req.method==='GET' && req.url==='/api/health') return json(res,200,{ok:true});

    let urlPath = decodeURIComponent(req.url.split('?')[0]);
    if(urlPath==='/') urlPath='/index.html';
    const filePath=path.resolve(ROOT,'.'+urlPath);
    if(!filePath.startsWith(path.resolve(ROOT)+path.sep)) return res.writeHead(403).end();
    fs.stat(filePath,(err,st)=>{
      if(err || !st.isFile()) return res.writeHead(404).end('Not found');
      const ext=path.extname(filePath).toLowerCase();
      const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.json':'application/json; charset=utf-8','.txt':'text/plain; charset=utf-8'};
      res.writeHead(200,{'Content-Type':types[ext]||'application/octet-stream'}); fs.createReadStream(filePath).pipe(res);
    });
  }catch(e){ console.error(e); json(res,500,{ok:false,error:'حدث خطأ في الخادم'}); }
});
server.listen(PORT,()=>console.log(`Stailek store running on port ${PORT}`));
