const products=[
{id:1,name:"تيشيرت بالينسياجا أبيض",cat:"تيشيرتات",price:450,image:"images/product1.jpg",sizes:["M","L","XL"],colors:["أبيض"],stock:20,description:"تيشيرت أبيض بقصة كاجوال وخامة مناسبة للاستخدام اليومي."},
{id:2,name:"تيشيرت رمادي سادة",cat:"تيشيرتات",price:400,image:"images/product2.jpg",sizes:["M","L","XL","XXL"],colors:["رمادي"],stock:18,description:"تيشيرت رمادي سادة بتصميم بسيط وسهل التنسيق."},
{id:3,name:"تيشيرت Essential أزرق",cat:"تيشيرتات",price:450,image:"images/product3.jpg",sizes:["M","L","XL"],colors:["أزرق"],stock:15,description:"تيشيرت أزرق بطباعة Essential، مناسب للإطلالات اليومية."},
{id:4,name:"تيشيرت بالينسياجا أبيض كلاسيك",cat:"تيشيرتات",price:500,image:"images/product4.jpg",sizes:["M","L","XL"],colors:["أبيض"],stock:12,description:"تيشيرت أبيض بتصميم كلاسيك وطباعة أمامية."}
];

let cart=[];
/* غيّر الرقم التالي إلى رقم واتساب المتجر بصيغة دولية بدون + أو مسافات.
   مثال مصر: 2010XXXXXXXX */
const STORE_WHATSAPP = "201283252003";
const SHIPPING = { "القاهرة":60, "الجيزة":60, "القليوبية":65, "الغربية":60, "الدقهلية":65, "المنوفية":65, "الإسكندرية":70, "البحيرة":70, "الشرقية":65, "كفر الشيخ":70, "دمياط":70, "بورسعيد":75, "الإسماعيلية":75, "السويس":75, "الفيوم":75, "بني سويف":80, "المنيا":85, "أسيوط":90, "سوهاج":95, "قنا":100, "الأقصر":105, "أسوان":110, "مطروح":100, "البحر الأحمر":110, "الوادي الجديد":120, "شمال سيناء":110, "جنوب سيناء":120 };
const grid=document.getElementById("productsGrid"),search=document.getElementById("search");
function render(list=products){
 grid.innerHTML=list.map(p=>`<article class="product">
 <div class="product-img"><img src="${p.image}" alt="${p.name}"></div>
 <div class="product-info">
   <div class="cat">${p.cat}</div>
   <h3>${p.name}</h3>
   <p class="description">${p.description}</p>
   <div class="price">${p.price} ج.م</div>
   <div class="stock">متوفر: ${p.stock} قطعة</div>
   <label class="size-label">المقاس
     <select id="size-${p.id}">${p.sizes.map(s=>`<option value="${s}">${s}</option>`).join("")}</select>
   </label>
   <button class="add" onclick="addToCart(${p.id})">أضف للسلة</button>
 </div></article>`).join("");
}
function addToCart(id){
 const p=products.find(x=>x.id===id);
 const size=document.getElementById(`size-${id}`).value;
 const key=`${id}-${size}`;
 const item=cart.find(x=>x.key===key);
 if(item){item.qty++;}else{cart.push({...p,key,size,qty:1});}
 renderCart();openCart();
}
function removeItem(key){cart=cart.filter(x=>x.key!==key);renderCart()}
function renderCart(){
 document.getElementById("cartCount").textContent=cart.reduce((s,x)=>s+x.qty,0);
 document.getElementById("cartItems").innerHTML=cart.length
 ?cart.map(x=>`<div class="cart-item"><div><b>${x.name}</b><div>المقاس: ${x.size} | الكمية: ${x.qty}</div><div>${x.qty*x.price} ج.م</div></div><button onclick="removeItem('${x.key}')">حذف</button></div>`).join("")
 :"<p style='color:#888;text-align:center;margin-top:40px'>السلة فارغة.</p>";
 updateTotals();
}
function updateTotals(){
 const subtotal=cart.reduce((s,x)=>s+x.price*x.qty,0);
 const city=document.getElementById("customerCity")?.value;
 const shipping=city && SHIPPING[city] ? SHIPPING[city] : 0;
 document.getElementById("subtotal").textContent=subtotal+" ج.م";
 document.getElementById("modalSubtotal").textContent=subtotal+" ج.م";
 document.getElementById("shipping").textContent=(shipping?shipping:0)+" ج.م";
 document.getElementById("modalShipping").textContent=(shipping?shipping:0)+" ج.م";
 document.getElementById("total").textContent=(subtotal+shipping)+" ج.م";
 document.getElementById("modalTotal").textContent=(subtotal+shipping)+" ج.م";
}
function openCart(){document.getElementById("cart").classList.add("open");document.getElementById("overlay").classList.add("open")}
function closeCart(){document.getElementById("cart").classList.remove("open");document.getElementById("overlay").classList.remove("open")}
document.getElementById("cartBtn").onclick=openCart;document.getElementById("closeCart").onclick=closeCart;document.getElementById("overlay").onclick=closeCart;
function filterProducts(){const cat=document.querySelector(".filter.active").dataset.cat,q=search.value.trim();render(products.filter(p=>(cat==="all"||p.cat===cat)&&p.name.includes(q)))}
document.querySelectorAll(".filter").forEach(btn=>btn.onclick=()=>{document.querySelectorAll(".filter").forEach(b=>b.classList.remove("active"));btn.classList.add("active");filterProducts()});
search.oninput=filterProducts;
const orderModal=document.getElementById("orderModal");
const orderForm=document.getElementById("orderForm");
const closeOrder=()=>orderModal.classList.remove("open");

document.getElementById("customerCity").addEventListener("change",updateTotals);

document.getElementById("checkout").onclick=()=>{
  if(!cart.length)return alert("السلة فارغة");
  orderModal.classList.add("open");
};

document.getElementById("closeOrder").onclick=closeOrder;

orderForm.addEventListener("submit",async(e)=>{
  e.preventDefault();
  if(!cart.length)return alert("السلة فارغة");
  const submitBtn=orderForm.querySelector(".order-submit");
  submitBtn.disabled=true; submitBtn.textContent="جاري تسجيل الطلب...";
  const name=document.getElementById("customerName").value.trim();
  const phone=document.getElementById("customerPhone").value.trim();
  const city=document.getElementById("customerCity").value.trim();
  const address=document.getElementById("customerAddress").value.trim();
  const notes=document.getElementById("customerNotes").value.trim();
  const subtotal=cart.reduce((s,x)=>s+x.price*x.qty,0);
  const shipping=SHIPPING[city] || 0;
  const total=subtotal+shipping;
  const payload={customer:{name,phone,city,address,notes},items:cart.map(x=>({name:x.name,size:x.size,qty:x.qty,price:x.price})),subtotal,shipping,total};
  try{
    const r=await fetch("/api/orders",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
    const data=await r.json();
    if(!r.ok) throw new Error(data.error||"تعذر تسجيل الطلب");
    orderForm.reset();
    cart=[]; renderCart(); closeOrder();
    alert(`تم تأكيد طلبك بنجاح ✅\nرقم الطلب: ${data.orderId}\nاحتفظ برقم الطلب للمتابعة.`);
  }catch(err){
    alert("لم يتم تسجيل الطلب. تأكد أن الموقع يعمل من خلال السيرفر، ثم حاول مرة أخرى.\n\n"+err.message);
  }finally{submitBtn.disabled=false; submitBtn.textContent="تأكيد الطلب";}
});

render();renderCart();