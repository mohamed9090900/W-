/* إدارة البوفيه — 1.5.0 (فئات قابلة للإدارة ومنيو مجمّع) */
const STORAGE_KEY='siwa-admin-state-v1',CLOUD_KEY='siwa-admin-cloud-v1',SESSION_KEY='siwa-admin-session-v1';
// Publishable key is intentionally public; access to private records is enforced by Supabase Auth + RLS.
const SIWA_CLOUD={url:'https://foqysttszgnecdzpkhql.supabase.co',key:'sb_publishable_bGsNzUZO5lovYEkezbFR8A_OWOt1V-W'};
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const number=x=>x==null||x===''?null:(Number.isFinite(Number(x))?Number(x):null);
const fmt=n=>new Intl.NumberFormat('ar-EG',{maximumFractionDigits:2}).format(n||0);
const money=n=>n==null?'غير محدد':fmt(n)+' ج';
// Internal quantities are always grams / millilitres / pieces.
// Buying units can be kg or litres without changing recipe or stock arithmetic.
const BASE_UNIT={'كيلو':'جرام','لتر':'مل','جرام':'جرام','مل':'مل','قطعة':'قطعة','كرتونة':'قطعة','عبوة':'قطعة'};
const FACTOR={'كيلو':1000,'لتر':1000,'جرام':1,'مل':1,'قطعة':1,'كرتونة':1,'عبوة':1};
const baseUnit=u=>BASE_UNIT[u]||'قطعة';
const compatibleUnits=u=>baseUnit(u)==='جرام'?['جرام','كيلو']:baseUnit(u)==='مل'?['مل','لتر']:['قطعة','عبوة','كرتونة'];
const canConvert=(from,to)=>baseUnit(from)===baseUnit(to);
const toBaseQty=(n,unit,base)=>canConvert(unit,base)?Number(n)*FACTOR[unit]:null;
const fromBaseQty=(n,unit,base)=>canConvert(unit,base)?Number(n)/FACTOR[unit]:Number(n);
const packDisplay=o=>{const u=o.purchaseUnit||o.unit||'قطعة',q=o.packSize||1;if(baseUnit(u)==='قطعة'&&['كرتونة','عبوة'].includes(u))return `${esc(u)} (${fmt(q)} ${esc(o.unit||'قطعة')})`;return `${fmt(fromBaseQty(q,u,o.unit||'قطعة'))} ${esc(u)}`};
function priceChange(p){const delta=number(p.priceDelta);if(delta==null||Math.abs(delta)<0.000001)return '';
 const higher=delta>0;return `<span class="price-delta ${higher?'rise':'fall'}" title="فرق آخر تعديل للسعر" aria-label="${higher?'زيادة':'نقصان'} ${fmt(Math.abs(delta))} جنيه">${higher?'<span aria-hidden="true">↑</span>':'<span aria-hidden="true">↓</span>'}<b dir="ltr">${higher?'+':'−'}${fmt(Math.abs(delta))}</b></span>`;}
function refreshPurchaseUnitOptions(){const base=$('#f-unit')?.value,select=$('#f-purchaseUnit');if(!base||!select)return;
 const previous=select.value,options=compatibleUnits(base);select.innerHTML=options.map(u=>`<option value="${u}">${u}</option>`).join('');select.value=options.includes(previous)?previous:options[0];select.dataset.previousUnit=select.value;}
function adjustPurchaseQuantity(sel){const oldUnit=sel.dataset.previousUnit||sel.value,nextUnit=sel.value,field=$('#f-packSize'),qty=number(field?.value);if(field&&qty!=null&&canConvert(oldUnit,nextUnit)){const changed=qty*FACTOR[oldUnit]/FACTOR[nextUnit];field.value=String(Math.round(changed*1000000)/1000000);}sel.dataset.previousUnit=nextUnit;}

const uid=()=>globalThis.crypto?.randomUUID?.()||`id-${Date.now()}-${Math.random().toString(36).slice(2)}`;
const when=()=>Date.now();
const icons={home:'<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',menu:'<path d="M4 5h16M4 12h16M4 19h16"/>',cart:'<circle cx="9" cy="20" r="1"/><circle cx="19" cy="20" r="1"/><path d="M2 3h2l2.5 12h12L21 6H5"/>',recipe:'<path d="M4 20h16M6 17a6 6 0 0 1 12 0v3H6zM12 4v2M5 8l1 1M19 8l-1 1"/>',store:'<path d="M3 10h18l-2-6H5zM5 10v10h14V10M9 20v-7h6v7"/>',tools:'<path d="m14.5 6.5 3 3M13 8l-8 8a2 2 0 1 0 3 3l8-8M13 3a6 6 0 0 0 8 8l-5 5-8-8 5-5z"/>',ideas:'<path d="M8 18h8M9 22h6M9 14a7 7 0 1 1 6 0l-1 4h-4z"/>',settings:'<circle cx="12" cy="12" r="3"/><path d="M10 2h4l.7 2.7 2 .8 2.4-1.4 2.8 2.8-1.4 2.4.8 2L24 12v1l-2.7.7-.8 2 1.4 2.4-2.8 2.8-2.4-1.4-2 .8L14 23h-4l-.7-2.7-2-.8-2.4 1.4-2.8-2.8 1.4-2.4-.8-2L0 13v-2l2.7-.7.8-2-1.4-2.4 2.8-2.8 2.4 1.4 2-.8z"/>',edit:'<path d="m16 4 4 4-12 12H4v-4z"/>',plus:'<path d="M12 5v14M5 12h14"/>',down:'<path d="m6 9 6 6 6-6"/>',check:'<path d="m4 12 5 5L20 6"/>',clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',archive:'<path d="M3 5h18v4H3zM5 9v12h14V9M10 13h4"/>',box:'<path d="M3 7 12 2l9 5v10l-9 5-9-5zM3 7l9 5 9-5M12 12v10"/>',copy:'<rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/>',sync:'<path d="M20 8a8 8 0 0 0-14-3L3 8M3 3v5h5M4 16a8 8 0 0 0 14 3l3-3M21 21v-5h-5"/>',trash:'<path d="M4 7h16M10 4h4M6 7l1 14h10l1-14M10 11v6M14 11v6"/>',warning:'<path d="m12 2 10 19H2zM12 9v5M12 18h.01"/>',cloud:'<path d="M8 19H6a5 5 0 0 1-1-10 7 7 0 0 1 14-1 5 5 0 0 1-1 11z"/>',search:'<circle cx="10" cy="10" r="6"/><path d="m15 15 6 6"/>',save:'<path d="M4 3h14l3 3v15H3V3zM7 3v6h10V3M7 21v-8h10v8"/>',back:'<path d="m15 18-6-6 6-6"/>'};
const ico=(name,size=20)=>`<svg aria-hidden="true" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${icons[name]||icons.box}</svg>`;
const NAV=[['home','الرئيسية','home'],['menu','المنيو','menu'],['planner','مشتريات 7 أيام','cart'],['recipes','الوصفات والخامات','recipe'],['suppliers','الموردون','store'],['equipment','المعدات','tools'],['decisions','التجارب والقرارات','ideas'],['settings','الإعدادات والنسخ','settings']];
const CATEGORIES=['بسكوت وكيك','شاي وقهوة','شيبسي وفشار','كانز وعصير','مأكولات وحلويات','فطار وسندوتشات'];
const STATUS={active:'شغال',trial:'تحت التجربة',paused:'مؤجل',cancelled:'ملغي'};
const DEC_STATUS={trial:'تحت الدراسة',active:'معتمد',paused:'مؤجل',cancelled:'ملغي'};
const item=(id,name,category,price,extra={})=>({id,name,category,price,weekly:null,stock:null,packSize:1,packLabel:'قطعة',unit:'قطعة',purchaseUnit:'قطعة',priceDelta:null,buyPrice:null,place:'',perishable:false,status:'active',updatedAt:1,...extra});
function initialState(){
 const p=[];let n=0;const add=(name,cat,price,extra)=>p.push(item(`p${++n}`,name,cat,price,extra));
 for(const [a,b] of [['مولتو',11],['أولكر عجوة',8],['أولكر شاي صغير',6],['أولكر شاي كبير',11],['هوهوز كينج',11],['توينكز صغير',6],['توينكز كبير',11],['بسكوت هالي',11],['أوريو صغير',6],['أوريو كبير',11],['فريسكا',6],['بسكريم',11],['بسكوت شوفان',11]])add(a,'بسكوت وكيك',b);
 for(const [a,b] of [['شاي',5],['قهوة',15],['أعشاب',5],['كوفي ميكس',10],['نسكافيه 3 في 1',10],['نمرة سكر',1],['سحلب',null],['هوت شوكلت',null]])add(a,'شاي وقهوة',b,{place:''});
 for(const [a,b] of [['شيبسي',11],['شيتوس',11],['دوريتوس',11],['فشار',11],['صن بايتس',16]])add(a,'شيبسي وفشار',b);
 for(const [a,b] of [['كانز',20],['عصير',10],['مياه كبيرة',10]])add(a,'كانز وعصير',b);
 for(const [a,b] of [['إندومي',10],['كاستر',15],['أم علي',null],['رز بلبن',null],['جلاش',null]])add(a,'مأكولات وحلويات',b,{place:'',perishable:['أم علي','رز بلبن','جلاش'].includes(a)});
 const ing=(id,name,unit,packSize,packPrice,extra={})=>({id,name,unit,packSize,packPrice,purchaseUnit:unit==='جرام'&&packSize>=1000&&packSize%1000===0?'كيلو':unit==='مل'&&packSize>=1000&&packSize%1000===0?'لتر':unit,stock:null,place:'',perishable:false,updatedAt:1,...extra});
 const ingredients=[ing('i-milk','لبن','مل',1000,50,{perishable:true}),ing('i-sugar','سكر','جرام',1000,null),ing('i-wheat-dry','قمح بليلة ناشف','جرام',1000,40),ing('i-wheat-cooked','بليلة مسلوقة','مل',250,null,{perishable:true}),ing('i-starch','نشا ذرة','جرام',1000,null),ing('i-rice','أرز','جرام',1000,null),ing('i-pastry','ملفيه أم علي','جرام',1000,null,{place:''}),ing('i-vanilla','فانيليا','جرام',50,null),ing('i-coconut','جوز هند','جرام',1000,null),ing('i-cup','طبق تقديم','قطعة',50,null,{place:''})];
 const recipes=[
  {id:'r-omali',name:'أم علي',status:'active',servings:null,notes:'الصنف شغال. لم نعتمد المقادير داخل البرنامج بعد.',items:[],updatedAt:1},
  {id:'r-rice',name:'رز بلبن',status:'active',servings:null,notes:'الصنف شغال. لم نعتمد المقادير داخل البرنامج بعد.',items:[],updatedAt:1},
  {id:'r-balila',name:'بليلة باللبن (تجربة)',status:'trial',servings:0,notes:'مقادير تجربة فقط. 250 مل قمح مسلوق لا يساوي 250 جرام. مطلوب قياس ناتج السلق قبل حساب مشتريات القمح الناشف.',items:[{ingredientId:'i-wheat-cooked',qty:250},{ingredientId:'i-milk',qty:150},{ingredientId:'i-sugar',qty:12},{ingredientId:'i-starch',qty:3}],updatedAt:1},
  {id:'r-foul',name:'سندوتش فول',status:'paused',servings:0,notes:'مخطط للمناقشة والاعتماد قبل الشراء',items:[],updatedAt:1},
  {id:'r-falafel',name:'سندوتش طعمية',status:'paused',servings:0,notes:'مخطط: نحدد مصدر الطعمية والعيش والإضافات والمعدات',items:[],updatedAt:1}
 ];
 const decisions=[
  {id:'d-balila',title:'تجربة البليلة في البيت',category:'حلويات',status:'trial',notes:'ربع كيلو قمح ناشف. نحدد كمية القمح بعد السلق ثم نراجع القوام الكريمي والتكلفة.',tasks:[{title:'سلق ربع كيلو بليلة',done:false},{title:'قياس الناتج بالكوب',done:false},{title:'تجربة اللبن والنشا',done:false},{title:'اعتماد أو رفض الصنف',done:false}],updatedAt:1},
  {id:'d-couscous',title:'الكسكسي الحلو',category:'حلويات',status:'paused',notes:'فكرة مؤجلة حتى انتهاء تجربة البليلة.',tasks:[],updatedAt:1},
  {id:'d-falafel',title:'سندوتش الطعمية',category:'فطار',status:'trial',notes:'هنحدد المصدر والعيش وطريقة التجهيز والسعر قبل الاعتماد.',tasks:[{title:'تحديد مصدر الطعمية',done:false},{title:'اختيار العيش',done:false},{title:'حساب تكلفة السندوتش',done:false},{title:'تجربة وتحديد سعر البيع',done:false}],updatedAt:1},
  {id:'d-foul',title:'سندوتش الفول',category:'فطار',status:'trial',notes:'فكرة مستقبلية قبل الاعتماد',tasks:[],updatedAt:1},
  {id:'d-feteer',title:'الفطير بالعسل الأسود',category:'حلويات',status:'cancelled',notes:'ملغي بسبب صعوبة النقل.',tasks:[],updatedAt:1}
 ];
 const equipment=[{id:'e-hotplate',name:'عين تسخين كهربائية',state:'موجود',priority:'مهم',notes:'تستخدم للطاسة والحلة',updatedAt:1},{id:'e-fridge',name:'ثلاجة',state:'موجود',priority:'مهم',notes:'لحفظ المكونات المبردة',updatedAt:1},{id:'e-measure',name:'كوب معياري',state:'مطلوب',priority:'مهم',notes:'لقياس البليلة واللبن',updatedAt:1}];
 return {version:2,products:p,ingredients,recipes,suppliers:[],equipment,decisions,purchases:[],quotes:[],categories:CATEGORIES.map((name,i)=>({id:`cat-${i+1}`,name,updatedAt:1})),prefs:{name:'إدارة البوفيه',updatedAt:1}};
}
function normalizeState(value){const base=initialState();if(!value||typeof value!=='object')return base;
 for(const key of ['products','ingredients','recipes','suppliers','equipment','decisions','purchases','quotes'])if(Array.isArray(value[key]))base[key]=value[key];
 // Upgrade old cloud/local payloads without touching their product IDs or financial data.
 if(Array.isArray(value.categories))base.categories=value.categories;
 else {const names=[...new Set([...CATEGORIES,...base.products.filter(x=>!x.deletedAt).map(x=>x.category).filter(Boolean)])];base.categories=names.map((name,i)=>({id:CATEGORIES.includes(name)?`cat-${CATEGORIES.indexOf(name)+1}`:`legacy-${encodeURIComponent(name)}`,name,updatedAt:1}));}
 if(!base.categories.length&&(!Array.isArray(value.categories)))base.categories=initialState().categories;
 if(Array.isArray(value.categories)){const known=new Set(base.categories.filter(c=>!c.deletedAt).map(c=>c.name));for(const p of base.products.filter(p=>!p.deletedAt)){if(p.category&&!known.has(p.category)&&!base.categories.some(c=>c.name===p.category)){base.categories.push({id:`legacy-${encodeURIComponent(p.category)}`,name:p.category,updatedAt:1});known.add(p.category)}}}
 // Only blank untouched legacy demo place defaults; never change an edited user value.
 for(const obj of [...base.products,...base.ingredients]){if(Number(obj.updatedAt)===1&&['أكتوبر','سيوة'].includes(obj.place))obj.place='';}
 if(value.prefs&&typeof value.prefs==='object')base.prefs=value.prefs;
 if(base.prefs.name==='بوفيه سيوة'&&Number(base.prefs.updatedAt)===1)base.prefs.name='إدارة البوفيه';
 for(const obj of [...base.products,...base.ingredients]){
  if(!obj.unit)obj.unit='قطعة';
  if(obj.unit==='كيلو'||obj.unit==='لتر'){
   const original=obj.unit, factor=FACTOR[original];obj.unit=baseUnit(original);obj.purchaseUnit=original;
   if(number(obj.packSize)!=null)obj.packSize*=factor;
   if(number(obj.stock)!=null)obj.stock*=factor;
   if(base.products.includes(obj)&&number(obj.weekly)!=null)obj.weekly*=factor;
   if(base.ingredients.includes(obj))for(const recipe of base.recipes)for(const part of recipe.items||[])if(part.ingredientId===obj.id&&number(part.qty)!=null)part.qty*=factor;
   for(const purchase of base.purchases)if(purchase.itemId===obj.id&&number(purchase.quantity)!=null)purchase.quantity*=factor;
   for(const quote of base.quotes)if(quote.itemId===obj.id&&number(quote.packQty)!=null)quote.packQty*=factor;
  }
  if(!obj.purchaseUnit||!canConvert(obj.purchaseUnit,obj.unit))obj.purchaseUnit=obj.unit;
 }
 return base;
}
let state;try{state=normalizeState(JSON.parse(localStorage.getItem(STORAGE_KEY)))}catch{state=initialState()}
const prevCloud=readLocal(CLOUD_KEY);
let screen='home',filter='',category='all',menuStatus='active',activeModal=null,syncTimer=null,syncBusy=false,
 cloud={...SIWA_CLOUD,email:prevCloud?.email||''},
 session=prevCloud?.url===SIWA_CLOUD.url?readLocal(SESSION_KEY):null;
if(prevCloud?.url!==SIWA_CLOUD.url)localStorage.removeItem(SESSION_KEY);
function readLocal(k){try{return JSON.parse(localStorage.getItem(k))}catch{return null}}
function persist(sync=true){localStorage.setItem(STORAGE_KEY,JSON.stringify(state));if(sync)queueSync();}
function toast(s){const e=$('#toast');e.textContent=s;e.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>e.classList.remove('show'),2500)}
function statusTag(s,type='normal'){return `<span class="tag ${esc(s)}">${esc(type==='decision'?DEC_STATUS[s]||s:STATUS[s]||s)}</span>`}
function changeScreen(s){screen=s;filter='';category='all';menuStatus='active';$('#sidebar').classList.remove('open');render();window.scrollTo({top:0,behavior:'instant'});}
function header(t,desc='',button=''){return `<div class="section-head"><div><h2>${t}</h2><p>${desc}</p></div>${button}</div>`}
function renderNav(){const nav=link=>`<button class="nav-item ${screen===link[0]?'active':''}" data-action="nav" data-screen="${link[0]}">${ico(link[2])}<span>${link[1]}</span></button>`;$('#sideNav').innerHTML=NAV.map(nav).join('');$('#bottomNav').innerHTML=NAV.filter(x=>['home','menu','planner','recipes','decisions'].includes(x[0])).map(x=>`<button data-action="nav" data-screen="${x[0]}" class="${screen===x[0]?'active':''}">${ico(x[2])}<span>${x[1].replace(' 7 أيام','')}</span></button>`).join('');$('#pageTitle').textContent=NAV.find(x=>x[0]===screen)?.[1]||'الرئيسية';}
function render(){renderNav();const fn={home:renderHome,menu:renderMenu,planner:renderPlanner,recipes:renderRecipes,suppliers:renderSuppliers,equipment:renderEquipment,decisions:renderDecisions,settings:renderSettings}[screen];$('#view').innerHTML=fn();updateSyncStatus();}
function actionBtn(label,kind,cls='outline-btn',id='',other=''){return `<button type="button" class="${cls}" data-action="${kind}" ${id?`data-id="${esc(id)}"`:''} ${other}>${label}</button>`}
function renderHome(){
 const missing=state.products.filter(x=>!x.deletedAt&&x.status==='active'&&x.price==null),open=state.decisions.filter(x=>!x.deletedAt&&x.status==='trial');
 return `<div class="hero hero-v11"><div><div class="eyebrow">BUFFET • OPERATIONS</div><h2>إدارة البوفيه</h2><p>المنيو · المشتريات · الوصفات · الموردون · المعدات</p></div>${actionBtn('مشتريات 7 أيام','nav','primary-btn','',`data-screen="planner"`)}</div>
 <div class="section-label">الأقسام</div><div class="shortcuts">${NAV.filter(x=>!['home','settings'].includes(x[0])).map(x=>`<button class="shortcut" data-action="nav" data-screen="${x[0]}">${ico(x[2],28)}<div><strong>${x[1]}</strong><div><small>${({'menu':'الأصناف والأسعار','planner':'قائمة شراء أسبوعية','recipes':'المقادير والخامات','suppliers':'الأسعار والمصادر','equipment':'الأدوات والتجهيزات','decisions':'المهام والقرارات'})[x[0]]}</small></div></div></button>`).join('')}</div>
 <div class="twocol"><div class="panel"><div class="line"><h3>أسعار غير محددة</h3><span class="tag">${missing.length}</span></div>${missing.length?missing.slice(0,5).map(x=>`<div class="activity"><div><b>${esc(x.name)}</b><small>${esc(x.category)}</small></div>${actionBtn('تسعير','edit-product','sm-btn',x.id)}</div>`).join(''):'<div class="good">الأسعار مكتملة.</div>'}</div><div class="panel"><div class="line"><h3>تجارب قائمة</h3><span class="tag">${open.length}</span></div>${open.slice(0,5).map(x=>`<div class="activity"><div><b>${esc(x.title)}</b><small>${esc(x.category)}</small></div>${actionBtn('فتح','edit-decision','sm-btn',x.id)}</div>`).join('')||'<div class="muted">لا توجد تجارب حالية.</div>'}</div></div>`;
}
function renderMenu(){
 const all=state.products.filter(x=>!x.deletedAt);
 const visible=all.filter(p=>(menuStatus==='all'||p.status===menuStatus)&&(p.name.includes(filter)||p.category.includes(filter)));
 const categories=state.categories.filter(c=>!c.deletedAt);
 const groups=categories.map(c=>({category:c,products:visible.filter(p=>p.category===c.name)}))
   .filter(g=>!filter||g.products.length);
 const row=p=>`<tr><td class="menu-name"><b>${esc(p.name)}</b>${menuStatus==='all'?`<small class="menu-inline-status">${esc(STATUS[p.status]||p.status)}</small>`:''}</td><td class="menu-price ${p.price==null?'warning':''}">${money(p.price)}</td><td class="menu-change">${priceChange(p)}</td><td>${actionBtn(`${ico('edit',14)} تعديل`,'edit-product','sm-btn',p.id)}</td></tr>`;
 return `${header('المنيو','الأصناف وأسعار البيع',`<div class="right-tools menu-actions">${actionBtn(`${ico('plus',16)} صنف جديد`,'add-product','primary-btn')}${actionBtn(`${ico('plus',16)} فئة جديدة`,'add-category','outline-btn')}</div>`)}
 <div class="toolbar menu-toolbar"><input class="input search" placeholder="ابحث عن صنف أو فئة..." id="menuSearch" value="${esc(filter)}"><span class="muted">${all.length} صنف</span></div>
 <div class="filter-row menu-status-tabs"><button class="chip ${menuStatus==='active'?'active':''}" data-action="menu-status" data-status="active">المنيو الشغال</button><button class="chip ${menuStatus==='all'?'active':''}" data-action="menu-status" data-status="all">كل الحالات</button></div>
 <div class="category-groups">${groups.map(({category:c,products})=>`<section class="category-section" aria-label="فئة ${esc(c.name)}">
  <div class="category-heading"><div class="category-heading-title"><span class="category-symbol" aria-hidden="true">✦</span><h3>${esc(c.name)}</h3></div><div class="category-heading-tools"><span class="category-count">${products.length} صنف</span>${actionBtn(`${ico('edit',14)} تعديل الفئة`,'edit-category','sm-btn',c.id)}</div></div>
  <div class="menu-table-wrap"><table class="data-table menu-table"><thead><tr><th scope="col">الصنف</th><th scope="col">سعر البيع</th><th scope="col">فرق السعر</th><th scope="col">تعديل</th></tr></thead><tbody>${products.map(row).join('')||'<tr><td colspan="4" class="category-empty">لا توجد أصناف في هذه الفئة حاليًا.</td></tr>'}</tbody></table></div>
 </section>`).join('')}</div>
 ${groups.length?'':'<div class="empty">مفيش أصناف مطابقة للبحث.</div>'}`;
}
// Use the most recent dated count as the baseline. Every subsequent purchase is counted;
// intervening demand is an estimate, never a confirmed stock figure.
function effectiveStock(obj,kind){
 const observed=number(obj.stock),at=number(obj.stockAt);
 if(observed==null||!at)return null;
 const elapsed=Math.max(0,(when()-at)/86400000);
 const buys=state.purchases.filter(p=>!p.deletedAt&&p.kind===kind&&p.itemId===obj.id&&Number(p.purchasedAt||p.updatedAt)>at).reduce((n,p)=>n+(number(p.quantity)||0),0);
 const weekly=kind==='products'?number(obj.weekly):ingredientWeekly(obj.id);
 if(weekly==null)return null;
 return Math.max(0,Math.round((observed+buys-weekly*elapsed/7)*100)/100);
}
function ingredientWeekly(id){let total=0,any=false;for(const r of state.recipes){if(r.deletedAt||r.status!=='active'||number(r.servings)==null)continue;for(const i of (r.items||[])){if(i.ingredientId===id){any=true;total+=(number(i.qty)||0)*number(r.servings)}}}return any?total:null;}
function purchaseName(x){return (state[x.kind]||[]).find(o=>o.id===x.itemId)?.name||'صنف غير موجود'}

function planRows(){
 const rows=[];
 for(const p of state.products.filter(x=>!x.deletedAt&&x.status==='active')){
  const weekly=number(p.weekly),stock=effectiveStock(p,'products'),reserve=p.perishable?0:(weekly??0)*2/7;
  const wanted=weekly==null?null:Math.ceil(Math.max(0,weekly+reserve-(stock??0)));
  const packSize=number(p.packSize)||1,packs=wanted==null?null:Math.ceil(wanted/packSize);
  rows.push({id:p.id,type:'products',name:p.name,unit:p.unit||'قطعة',weekly,stock,needed:wanted,packs,packSize,purchaseUnit:p.purchaseUnit||p.unit||'قطعة',packLabel:p.packLabel||'عبوة',packPrice:number(p.buyPrice),place:p.place?.trim()||'غير محدد',perishable:p.perishable,price:p.price});
 }
 const needs=new Map();for(const r of state.recipes.filter(x=>!x.deletedAt&&x.status==='active'&&number(x.servings)>0)){
  for(const comp of r.items||[]){needs.set(comp.ingredientId,(needs.get(comp.ingredientId)||0)+(number(comp.qty)||0)*number(r.servings));}
 }
 for(const [id,qty]of needs){const ing=state.ingredients.find(x=>x.id===id&&!x.deletedAt);if(!ing)continue;
  const stock=effectiveStock(ing,'ingredients'),reserve=ing.perishable?0:qty*2/7,wanted=Math.ceil(Math.max(0,qty+reserve-(stock??0)));
  const packSize=number(ing.packSize)||1,packs=Math.ceil(wanted/packSize);
  rows.push({id,type:'ingredients',name:ing.name,unit:ing.unit,weekly:qty,stock,needed:wanted,packs,packLabel:ing.unit,purchaseUnit:ing.purchaseUnit||ing.unit,packPrice:number(ing.packPrice),packSize,place:ing.place?.trim()||'غير محدد',perishable:ing.perishable});
 }
 return rows;
}
function renderPlanner(){const rows=planRows(),actionable=rows.filter(x=>x.needed!=null&&x.needed>0),unknown=rows.filter(x=>x.weekly==null),sum=actionable.reduce((n,x)=>n+(x.packPrice==null?0:x.packs*x.packPrice),0),unpriced=actionable.filter(x=>x.packPrice==null).length;const ready=actionable.filter(x=>x.type==='products'),ingredients=actionable.filter(x=>x.type==='ingredients');return `${header('مشتريات الأسبوع','التخطيط ثابت 7 أيام. رقم الاستهلاك الأسبوعي هو أساس الحساب.',`<div class="right-tools">${actionBtn('إدخال جرد من النص','stock-import','outline-btn')}${actionBtn('تسجيل مشتريات','add-purchase','outline-btn')}</div>`)}
 <div class="planner-summary"><div class="total-card"><small>أصناف مطلوب شراؤها</small><strong>${actionable.length}</strong></div><div class="total-card"><small>التكلفة المعروفة فقط</small><strong>${money(sum)}</strong></div><div class="total-card"><small>منتجات بدون استهلاك</small><strong>${unknown.length}</strong></div></div>
 <div class="hint-box"><b>طريقة الحساب:</b> استهلاك 7 أيام + احتياطي يومين للأصناف غير سريعة التلف − الرصيد المعروف. لو الرصيد من غير تاريخ معروف مش هنخصمه. الرصيد المؤرخ بنتعامل معاه كتقدير، مش جرد مؤكد. لو سعر شراء العبوة ناقص، إجمالي الميزانية هيبقى جزئي. ${unpriced?`<span class="warning">في ${unpriced} مشتريات بدون سعر شراء.</span>`:''}</div>
 ${header('بيانات الشراء','متوسط الاستهلاك وحجم العبوة وسعرها.')}
 <div class="table-wrap"><table class="data-table"><thead><tr><th>المنتج</th><th>استهلاك أسبوعي</th><th>آخر كمية جردتها</th><th>عبوة الشراء</th><th>سعر عبوة الشراء</th><th>المطلوب</th><th>تعديل الشراء</th></tr></thead><tbody>${state.products.filter(x=>!x.deletedAt&&x.status==='active').map(p=>{const row=rows.find(x=>x.type==='products'&&x.id===p.id);return `<tr><td><b>${esc(p.name)}</b><small>${esc(p.category)} · ${esc(p.unit||'قطعة')}</small></td><td><input aria-label="الاستهلاك الأسبوعي ${esc(p.name)}" class="input inline-field" type="number" min="0" step="any" data-quick="weekly" data-kind="products" data-id="${p.id}" value="${p.weekly??''}" placeholder="—"></td><td><input aria-label="المتوفر ${esc(p.name)}" class="input inline-field" type="number" min="0" step="any" data-quick="stock" data-kind="products" data-id="${p.id}" value="${p.stock??''}" placeholder="؟"></td><td><span class="num">${packDisplay(p)}</span></td><td>${money(p.buyPrice)}</td><td>${row.needed==null?'<span class="muted">حدّد المتوسط</span>':`<span class="pill">${fmt(row.packs)} ${esc(row.purchaseUnit==='كرتونة'?'كرتونة':row.purchaseUnit==='عبوة'?'عبوة':'عبوة')}</span>`}${row.stock==null&&row.weekly!=null?'<small class="warning">الرصيد غير معروف</small>':'<small>الرصيد تقديري</small>'}</td><td>${actionBtn('بيانات الشراء','buy-product','sm-btn',p.id)}</td></tr>`}).join('')}</tbody></table></div>
 <div class="mt2">${header('قائمة الشراء المقترحة','أصناف المنتجات الجاهزة، وبعدها خامات الوصفات المعتمدة.')}</div>
 ${renderPlanTable(ready,'منتجات جاهزة')}${renderPlanTable(ingredients,'خامات الوصفات')}
 <div class="panel mt2"><div class="line"><h3>سجل المشتريات</h3>${actionBtn('تسجيل مشتريات','add-purchase','sm-btn')}</div><div class="help">المشتريات المسجلة تُستخدم عند حساب الرصيد التقديري.</div>
 ${state.purchases.filter(x=>!x.deletedAt).sort((a,b)=>(b.purchasedAt||0)-(a.purchasedAt||0)).slice(0,15).map(x=>`<div class="activity"><div><b>${esc(purchaseName(x))}</b><small>${fmt(x.quantity)} ${esc((state[x.kind]||[]).find(z=>z.id===x.itemId)?.unit||'قطعة')} · ${esc(x.place||'')} · ${new Date(x.purchasedAt||x.updatedAt).toLocaleDateString('ar-EG')}</small></div><div class="right-tools"><span>${money(x.totalPrice)}</span>${actionBtn('تعديل','edit-purchase','sm-btn',x.id)}</div></div>`).join('')||'<p class="muted">لسه مفيش مشتريات مسجلة.</p>'}</div>
 <div class="panel mt2"><h3>المكونات المشتركة</h3><p class="help">برنامج الإدارة بيجمع اللبن والسكر وباقي الخامات من كل وصفة شغالة وحددت لها عدد أطباق أسبوعي. الوصفات تحت التجربة لا تدخل خطة الشراء.</p>${state.recipes.filter(x=>!x.deletedAt&&x.status==='active').map(r=>`<div class="activity"><div><b>${esc(r.name)}</b><small>${r.items?.length?`${r.items.length} مكونات`:'لم تُسجل المقادير'}</small></div>${r.servings==null?'<span class="warning">عدد الأطباق ناقص</span>':`<span>${fmt(r.servings)} طبق</span>`} ${actionBtn('تعديل','edit-recipe','sm-btn',r.id)}</div>`).join('')}</div>`;}
function renderPlanTable(rows,title){return `<div class="panel mt"><h3>${title} <span class="tag">${rows.length}</span></h3>${!rows.length?'<div class="help">مفيش احتياج محسوب لسه.</div>':`<div class="table-wrap"><table class="data-table"><thead><tr><th>الصنف</th><th>الاحتياج الصافي</th><th>الشراء المقترح</th><th>مكان الشراء</th><th>تكلفة الشراء</th></tr></thead><tbody>${rows.map(r=>`<tr><td><b>${esc(r.name)}</b>${r.stock==null?'<small class="warning">بدون رصيد مؤكد</small>':''}</td><td>${fmt(r.needed)} ${esc(r.unit)}</td><td>${fmt(r.packs)} × ${packDisplay(r)}</td><td>${esc(r.place)}</td><td>${r.packPrice==null?'<span class="warning">السعر ناقص</span>':money(r.packs*r.packPrice)}</td></tr>`).join('')}</tbody></table></div>`}</div>`;}
function ingredientName(id){return state.ingredients.find(x=>x.id===id)?.name||'خامة محذوفة'}
function recipeCost(r){if(!r.items?.length)return null;let total=0;for(const c of r.items){const ing=state.ingredients.find(x=>x.id===c.ingredientId&&!x.deletedAt);if(!ing||number(ing.packPrice)==null||!number(ing.packSize))return null;total+=(number(c.qty)||0)*ing.packPrice/ing.packSize;}return total;}
function renderRecipes(){const rows=state.recipes.filter(x=>!x.deletedAt),ing=state.ingredients.filter(x=>!x.deletedAt);return `${header('الوصفات والخامات','كل وصفة بمقاديرها وتكلفتها. الوصفات المشتركة تُجمع في مشتريات الأسبوع.',actionBtn(`${ico('plus',16)} وصفة جديدة`,'add-recipe','primary-btn'))}<div class="cards">${rows.map(r=>`<div class="item-card"><div class="card-top"><div class="card-title">${esc(r.name)}</div>${statusTag(r.status)}</div><div class="mini mt">${esc(r.notes||'')}</div><div class="detail-items">${(r.items||[]).length?(r.items||[]).map(c=>`<span>${esc(ingredientName(c.ingredientId))}: ${fmt(c.qty)} ${esc(state.ingredients.find(i=>i.id===c.ingredientId)?.unit||'')}</span>`).join(''):'<span>المقادير لم تُحدد</span>'}</div><div class="item-bottom"><div><div class="price ${recipeCost(r)==null?'warning':''}">${recipeCost(r)==null?'التكلفة غير مكتملة':money(recipeCost(r))}</div><div class="mini">${r.servings==null?'أطباق الأسبوع: لم يُحدد':'أطباق الأسبوع: '+fmt(r.servings)}</div></div>${actionBtn('تعديل الوصفة','edit-recipe','sm-btn',r.id)}</div></div>`).join('')}</div>
 <div class="mt2">${header('مخزن الخامات','سعر عبوة الشراء وكميتها بيحددوا تكلفة كل مقدار.',actionBtn(`${ico('plus',16)} إضافة خامة`,'add-ingredient','outline-btn'))}</div>
 <div class="table-wrap"><table class="data-table"><thead><tr><th>الخامة</th><th>وحدة القياس</th><th>عبوة الشراء</th><th>سعر الشراء</th><th>الجهة</th><th></th></tr></thead><tbody>${ing.map(i=>`<tr><td><b>${esc(i.name)}</b></td><td>${esc(i.unit)}</td><td>${packDisplay(i)}</td><td>${money(i.packPrice)}</td><td>${esc(i.place)}</td><td>${actionBtn('تعديل','edit-ingredient','sm-btn',i.id)}</td></tr>`).join('')}</tbody></table></div>`;}
function renderSuppliers(){
 const rows=state.suppliers.filter(x=>!x.deletedAt),quotes=state.quotes.filter(x=>!x.deletedAt).sort((a,b)=>b.updatedAt-a.updatedAt);
 return `${header('الموردون والأسعار','سجل الموردين وعروض الشراء عشان نقارن قبل السفرية.',actionBtn(`${ico('plus',16)} إضافة مورد`,'add-supplier','primary-btn'))}
 <div class="cards">${rows.map(x=>`<div class="item-card"><div class="card-top"><div class="card-title">${esc(x.name)}</div><span class="tag">${esc(x.city||'غير محدد')}</span></div><p class="muted">${esc(x.notes||'—')}</p><div class="mini">${esc(x.phone||'بدون رقم')}</div><div class="item-bottom">${actionBtn('تعديل','edit-supplier','sm-btn',x.id)}</div></div>`).join('')}</div>${rows.length?'':'<div class="empty"><strong>لسه مفيش موردين</strong>ابدأ بإضافة الموردين اللي بتتعامل معاهم.</div>'}
 <div class="mt2">${header('عروض وأسعار الشراء','اكتب سعر العبوة وحجمها ومصاريف التوصيل عشان نقارن تكلفة الوحدة.',actionBtn(`${ico('plus',16)} إضافة سعر`,'add-quote','outline-btn'))}</div>
 <div class="panel">${quotes.length?`<div class="table-wrap"><table class="data-table"><thead><tr><th>الصنف</th><th>المورد / المكان</th><th>العبوة</th><th>السعر + الشحن</th><th>تكلفة الوحدة</th><th></th></tr></thead><tbody>${quotes.map(q=>{const item=[...state.products,...state.ingredients].find(x=>x.id===q.itemId),qprice=number(q.price),ship=number(q.shipping)||0,qty=number(q.packQty),unit=qty>0&&qprice!=null?(qprice+ship)/qty:null;return `<tr><td><b>${esc(item?.name||'غير محدد')}</b></td><td>${esc(q.supplierName||'—')}<small>${esc(q.place||'')}</small></td><td>${fmt(qty)} ${esc(item?.unit||'قطعة')}</td><td>${money(qprice==null?null:qprice+ship)}</td><td><b>${money(unit)}</b></td><td>${actionBtn('تعديل','edit-quote','sm-btn',q.id)}</td></tr>`}).join('')}</tbody></table></div>`:'<p class="muted">لسه مفيش أسعار موردين. سجل أول عرض لما تعرفه.</p>'}</div>`;
}
function renderEquipment(){const rows=state.equipment.filter(x=>!x.deletedAt);return `${header('معدات وأدوات التشغيل','الموجود والناقص، وقرار شراء كل أداة.',actionBtn(`${ico('plus',16)} إضافة أداة`,'add-equipment','primary-btn'))}<div class="cards">${rows.map(x=>`<div class="item-card"><div class="card-top"><div class="card-title">${esc(x.name)}</div><span class="tag ${x.state==='موجود'?'active':'trial'}">${esc(x.state)}</span></div><p class="muted">${esc(x.notes||'—')}</p><div class="item-bottom"><span class="mini">الأولوية: ${esc(x.priority||'عادي')}</span>${actionBtn('تعديل','edit-equipment','sm-btn',x.id)}</div></div>`).join('')}</div>`;}
function renderDecisions(){const rows=state.decisions.filter(x=>!x.deletedAt);return `${header('التجارب والقرارات','الأصناف المقترحة وخطوات تنفيذها.',actionBtn(`${ico('plus',16)} فكرة جديدة`,'add-decision','primary-btn'))}<div class="cards">${rows.map(d=>`<div class="item-card"><div class="card-top"><div class="card-title">${esc(d.title)}</div>${statusTag(d.status,'decision')}</div><div class="mini mt">${esc(d.category)}</div><p class="muted">${esc(d.notes||'—')}</p><div class="tasks">${(d.tasks||[]).map((t,i)=>`<label class="task ${t.done?'done':''}"><input type="checkbox" data-task="1" data-id="${d.id}" data-idx="${i}" ${t.done?'checked':''}><span>${esc(t.title)}</span></label>`).join('')}</div><div class="item-bottom"><span class="mini">${(d.tasks||[]).filter(t=>t.done).length}/${(d.tasks||[]).length} خطوة</span>${actionBtn('تعديل','edit-decision','sm-btn',d.id)}</div></div>`).join('')}</div>`;}
function renderSettings(){const config=cloud||{},connected=!!session?.access_token;return `${header('الإعدادات والنسخ الاحتياطي','النسخ الاحتياطي ومزامنة الأجهزة.')}
 <div class="twocol"><div class="panel"><h3>نسخة احتياطية</h3><p class="help">نزّل ملف JSON بعد أي تحديث مهم. ينفع ترجعه لو نقلت لجهاز جديد. استيراد ملف يستبدل بيانات الجهاز الحالية.</p><div class="group right-tools">${actionBtn(`${ico('save',16)} تنزيل نسخة`,'export','primary-btn')}${actionBtn('استرجاع نسخة','import','outline-btn')}</div></div><div class="panel"><h3>مراجعة البيانات</h3><p class="help">نزّل ملف بيانات الإدارة وارفعه هنا في ChatGPT، ونراجع المنيو أو مشتريات الأسبوع أو الوصفات.</p><div class="right-tools">${actionBtn(`${ico('copy',16)} مراجعة مع ChatGPT`,'export-chatgpt','primary-btn')}</div></div></div>
 <div class="panel mt2"><h3>مزامنة الأجهزة</h3><div class="${connected?'hint-box':'warning-bar'}">${connected?'الحساب متصل، والمزامنة تلقائية عند توفر الإنترنت.':'سجّل الدخول بحساب الإدارة لتشغيل المزامنة التلقائية.'}</div><div class="form-grid mt"><div class="form-group full"><label>البريد الإلكتروني</label><input class="input" type="email" id="cloudEmail" placeholder="البريد الإلكتروني" value="${esc(config.email||'')}" autocomplete="email"></div><div class="form-group full"><label>كلمة المرور</label><input class="input" type="password" id="cloudPassword" placeholder="كلمة المرور" autocomplete="current-password"></div></div><div class="right-tools" style="flex-wrap:wrap">${actionBtn('تسجيل الدخول','cloud-login','primary-btn')}${connected?actionBtn('مزامنة الآن','cloud-sync','outline-btn')+actionBtn('تسجيل الخروج','cloud-logout','danger-btn'):''}</div><div class="help mt">البيانات بتتحفظ على الجهاز أولًا، وبتتزامن تلقائيًا على حسابك عند اتصال الإنترنت.</div></div>
 <div class="panel mt"><h3>معلومات النظام</h3><div class="activity"><b>الإصدار</b><span>1.5.0</span></div><div class="activity"><b>دورة المشتريات</b><span>7 أيام</span></div></div>`;}
function formInput(label,name,value='',type='text',extra=''){return `<div class="form-group"><label for="f-${name}">${label}</label><input id="f-${name}" name="${name}" class="input" type="${type}" value="${esc(value??'')}" ${extra}></div>`}
function formSelect(label,name,value,options){return `<div class="form-group"><label for="f-${name}">${label}</label><select class="select" name="${name}" id="f-${name}">${options.map(v=>{const [key,text]=Array.isArray(v)?v:[v,v];return `<option value="${esc(key)}" ${key===value?'selected':''}>${esc(text)}</option>`}).join('')}</select></div>`}
function formText(label,name,value=''){return `<div class="form-group full"><label for="f-${name}">${label}</label><textarea class="textarea" name="${name}" id="f-${name}" rows="3">${esc(value)}</textarea></div>`}
function openModal(kind,id){const coll=kind==='product-buy'?state.products:(kind==='category'?state.categories:(state[kind+'s']||state[kind])),entity=id?coll?.find(x=>x.id===id):null;if(!coll)return;activeModal={kind,id};let body='',title='',extra='';const v=entity||{};
 if(kind==='category'){title=id?'تعديل الفئة':'إضافة فئة';body=`<div class="form-grid">${formInput('اسم الفئة','name',v.name,'text','required maxlength="70"')}</div><p class="help">تعديل الاسم هيحدّث تصنيف الأصناف المرتبطة بالفئة، من غير تغيير الأسعار أو بيانات الشراء. حذف الفئة متاح لما تكون فاضية فقط.</p>`;}
 else if(kind==='product'){
  title=id?'تعديل صنف':'إضافة صنف';
  body=`<div class="form-grid simple-product">${formInput('اسم الصنف','name',v.name,'text','required')}${formSelect('الفئة','category',v.category||state.categories.find(c=>!c.deletedAt)?.name||'',state.categories.filter(c=>!c.deletedAt).map(c=>[c.name,c.name]))}${formInput('سعر البيع بالجنيه','price',v.price,'number','step="0.01" min="0" placeholder="غير محدد"')}${formSelect('وحدة البيع','unit',v.unit||'قطعة',['قطعة','جرام','مل'])}${formSelect('الحالة','status',v.status||'active',Object.entries(STATUS))}</div>`;
 }
 else if(kind==='product-buy'){
  title='بيانات الشراء · '+(v.name||'');const unit=v.unit||'قطعة',buyUnit=v.purchaseUnit||unit;
  body=`<div class="form-grid"><div class="form-group full"><div class="buy-context">${esc(v.name||'')} — وحدة البيع: ${esc(unit)}</div></div>${formInput('متوسط الاستهلاك خلال 7 أيام','weekly',v.weekly,'number','step="any" min="0" placeholder="غير محدد"')}${formSelect('طريقة الشراء','purchaseUnit',buyUnit,compatibleUnits(unit))}${formInput(unit==='قطعة'?'عدد القطع داخل العبوة / الكرتونة':'حجم عبوة الشراء','packSize',fromBaseQty(v.packSize||1,buyUnit,unit),'number','min="0.001" step="any" required')}${formInput('سعر عبوة الشراء بالجنيه','buyPrice',v.buyPrice,'number','step="any" min="0" placeholder="غير محدد"')}${formInput('مكان الشراء','place',v.place,'text','placeholder="اكتب المكان أو الجهة"')}${formSelect('نوع التخزين','perishable',String(!!v.perishable),[['false','يتحمل التخزين'],['true','قصير الصلاحية']])}</div><p class="help">مثال: كرتونة مياه فيها 12 زجاجة. اختار «كرتونة»، واكتب 12 في عدد القطع، وسعر الكرتونة.</p>`;
 }
 else if(kind==='ingredient'){title=id?'تعديل خامة':'إضافة خامة';body=`<div class="form-grid">${formInput('اسم الخامة','name',v.name,'text','required')}${formSelect('وحدة الحساب للوصفات','unit',v.unit||'جرام',['جرام','مل','قطعة'])}${formSelect('وحدة عبوة الشراء','purchaseUnit',v.purchaseUnit||v.unit||'جرام',compatibleUnits(v.unit||'جرام'))}${formInput('حجم عبوة الشراء','packSize',fromBaseQty(v.packSize||1000,v.purchaseUnit||v.unit||'جرام',v.unit||'جرام'),'number','min="0.001" step="any" required')}${formInput('سعر عبوة الشراء','packPrice',v.packPrice,'number','min="0" step="any"')}${formInput('المتبقي من الخامة (اختياري)','stock',v.stock,'number','min="0" step="any"')}${formInput('مكان الشراء','place',v.place,'text','placeholder="اكتب المكان أو الجهة"')}${formSelect('صلاحية التخزين','perishable',String(!!v.perishable),[['false','يتحمل التخزين'],['true','قصير الصلاحية']])}</div>`;}
 else if(kind==='recipe'){title=id?'تعديل وصفة':'وصفة جديدة';body=`<div class="form-grid">${formInput('اسم الوصفة','name',v.name,'text','required')}${formSelect('حالة الوصفة','status',v.status||'trial',Object.entries(STATUS))}${formInput('عدد الأطباق المتوقع في الأسبوع','servings',v.servings,'number','step="1" min="0" placeholder="غير محدد"')}${formText('ملاحظات','notes',v.notes)}</div><h3>مكونات الطبق الواحد</h3><div id="recipeComponents">${(v.items||[]).map(renderComponent).join('')}</div><button type="button" class="outline-btn mt" data-action="add-component">${ico('plus',16)} إضافة مكون</button><div class="help mt">لو مفيش مقادير معتمدة، سيب القائمة فاضية. الأصناف تحت التجربة لا تدخل مشتريات الأسبوع.</div>`;}
 else if(kind==='supplier'){title=id?'تعديل مورد':'إضافة مورد';body=`<div class="form-grid">${formInput('اسم المورد','name',v.name,'text','required')}${formInput('المكان','city',v.city,'text','placeholder="اكتب المكان أو الجهة"')}${formInput('التليفون','phone',v.phone)}${formText('ملاحظات / أصناف بيوردها','notes',v.notes)}</div>`;}
 else if(kind==='quote'){title=id?'تعديل عرض سعر':'إضافة سعر مورد';const options=[...state.products.filter(x=>!x.deletedAt).map(x=>[x.id,'منتج · '+x.name]),...state.ingredients.filter(x=>!x.deletedAt).map(x=>[x.id,'خامة · '+x.name])];body=`<div class="form-grid">${formSelect('الصنف أو الخامة','itemId',v.itemId||options[0]?.[0],options)}${formInput('اسم المورد','supplierName',v.supplierName,'text','required')}${formInput('المكان','place',v.place,'text','placeholder="اكتب المكان أو الجهة"')}${formInput('كمية العبوة بوحدة الصنف','packQty',v.packQty||1,'number','required min="0.001" step="any"')}${formInput('سعر العبوة','price',v.price,'number','required min="0" step="any"')}${formInput('نصيب العبوة من الشحن','shipping',v.shipping||0,'number','min="0" step="any"')}${formText('ملاحظات العرض والصلاحية','notes',v.notes)}</div><p class="help">العرض للمقارنة فقط. مش هيغيّر سعر شراء المنتج أو خطة الأسبوع إلا لما إنت تعدّلها.</p>`;}
 else if(kind==='equipment'){title=id?'تعديل أداة':'إضافة أداة';body=`<div class="form-grid">${formInput('اسم الأداة','name',v.name,'text','required')}${formSelect('الحالة','state',v.state||'مطلوب',['موجود','مطلوب','مؤجل','تعطل'])}${formSelect('الأولوية','priority',v.priority||'عادي',['مهم','عادي','منخفض'])}${formText('الاستخدام والملاحظات','notes',v.notes)}</div>`;}
 else if(kind==='decision'){title=id?'تعديل قرار':'فكرة جديدة';body=`<div class="form-grid">${formInput('موضوع الفكرة','title',v.title,'text','required')}${formSelect('القسم','category',v.category||'فطار',['فطار','حلويات','مشروبات','مشتريات','معدات','أخرى'])}${formSelect('الحالة','status',v.status||'trial',Object.entries(DEC_STATUS))}${formText('تفاصيل القرار','notes',v.notes)}${formText('خطوات التنفيذ (كل خطوة في سطر)','tasks',(v.tasks||[]).map(t=>t.title).join('\n'))}</div>`;}
 else if(kind==='purchase'){title=id?'تعديل عملية شراء':'تسجيل مشتريات';const options=[...state.products.filter(x=>!x.deletedAt).map(x=>[x.id,'منتج · '+x.name]),...state.ingredients.filter(x=>!x.deletedAt).map(x=>[x.id,'خامة · '+x.name])];body=`<div class="form-grid">${formSelect('الصنف أو الخامة','itemId',v.itemId||options[0]?.[0],options)}${formInput('الكمية المشتراة بالوحدة الأساسية','quantity',v.quantity,'number','required min="0.001" step="any"')}${formInput('إجمالي ثمن الشراء','totalPrice',v.totalPrice,'number','required min="0" step="any"')}${formInput('مكان الشراء','place',v.place,'text','placeholder="اكتب المكان أو الجهة"')}${formText('ملاحظات أو المورد','notes',v.notes)}</div><p class="help">الكمية بالقطعة للمنتجات الجاهزة، وبالوحدة المسجلة للخامة. مثال: 24 قطعة كانز أو 2000 مل لبن. اكتب إجمالي السعر المدفوع.</p>`;}
 if(!body)return;$('#modalRoot').innerHTML=`<div class="modal-backdrop" id="modalBackdrop"><div class="modal" role="dialog" aria-modal="true" aria-label="${esc(title)}"><div class="modal-head"><h2>${esc(title)}</h2>${actionBtn('إغلاق','close-modal','sm-btn')}</div><form id="editorForm"><div class="modal-body">${body}</div><div class="modal-footer">${id?actionBtn('حذف','delete-entity','danger-btn',id):''}<button type="button" class="outline-btn" data-action="close-modal">إلغاء</button><button type="submit" class="primary-btn">${ico('check',16)} حفظ</button></div></form></div></div>`;$('#editorForm').addEventListener('submit',saveForm);$('#modalBackdrop').addEventListener('click',e=>{if(e.target.id==='modalBackdrop')closeModal()});$('#f-purchaseUnit')?.setAttribute('data-previous-unit',$('#f-purchaseUnit').value);$('#modalRoot input:not([type=hidden]),#modalRoot select')?.focus();}
function renderComponent(c={}){return `<div class="recipe-row component-row"><select class="select" name="ingredientId" aria-label="خامة" style="max-width:57%">${state.ingredients.filter(x=>!x.deletedAt).map(i=>`<option value="${i.id}" ${c.ingredientId===i.id?'selected':''}>${esc(i.name)} (${esc(i.unit)})</option>`).join('')}</select><input class="input" type="number" min="0.001" step="any" value="${esc(c.qty||'')}" placeholder="الكمية" aria-label="كمية الخامة" style="width:100px"><button class="sm-btn" type="button" data-action="remove-component" aria-label="حذف المكون">×</button></div>`;}
function closeModal(){activeModal=null;$('#modalRoot').innerHTML='';}
function saveForm(ev){ev.preventDefault();if(!activeModal)return;const {kind,id}=activeModal,fd=new FormData(ev.currentTarget),get=k=>String(fd.get(k)||'').trim(),list=kind==='product-buy'?state.products:(kind==='category'?state.categories:(state[kind+'s']||state[kind])),old=id?list.find(x=>x.id===id):null;let o={...(old||{}),id:id||uid(),updatedAt:when()};
 if(kind==='category'){
  const name=get('name').replace(/\s+/g,' ');
  if(!name){toast('اكتب اسم الفئة');return}
  if(state.categories.some(c=>!c.deletedAt&&c.id!==id&&c.name.trim()===name)){toast('الفئة دي موجودة بالفعل');return}
  if(old){for(const p of state.products.filter(x=>!x.deletedAt&&x.category===old.name)){p.category=name;p.updatedAt=o.updatedAt;}}
  o={...o,name};
 }
 if(kind==='product'){
  const selectedCategory=get('category');
  if(!state.categories.some(c=>!c.deletedAt&&c.name===selectedCategory)){toast('اختار فئة موجودة أو أضف فئة جديدة');return}
  const newUnit=get('unit')||'قطعة',nextPrice=number(get('price'));
  if(old&&baseUnit(old.unit||'قطعة')!==baseUnit(newUnit)){toast('لتغيير نوع وحدة الصنف، أضف صنف جديد');return}
  if(nextPrice!=null&&nextPrice<0){toast('راجع سعر البيع');return}
  const prevPrice=number(old?.price);
  const delta=old&&prevPrice!=null&&nextPrice!=null&&Math.abs(nextPrice-prevPrice)>0.000001?Math.round((nextPrice-prevPrice)*100)/100:old?.priceDelta??null;
  o={...o,name:get('name'),category:get('category'),price:nextPrice,priceDelta:delta,status:get('status'),unit:newUnit};
  if(!old){o.purchaseUnit=newUnit;o.packSize=1;}
 }
 if(kind==='product-buy'){
  if(!old){toast('حدد الصنف أولًا');return}
  const purchaseUnit=get('purchaseUnit')||old.unit||'قطعة';
  const packSize=toBaseQty(number(get('packSize')),purchaseUnit,old.unit||'قطعة');
  if(packSize==null||packSize<=0){toast('راجع حجم عبوة الشراء');return}
  o={...o,purchaseUnit,packSize,weekly:number(get('weekly')),buyPrice:number(get('buyPrice')),place:get('place'),perishable:get('perishable')==='true'};
 }
 if(kind==='ingredient'){
  const newUnit=get('unit')||'جرام',buyUnit=get('purchaseUnit')||newUnit,packSize=toBaseQty(number(get('packSize')),buyUnit,newUnit);
  if(old&&baseUnit(old.unit||'جرام')!==baseUnit(newUnit)){toast('لتغيير نوع القياس، أضف خامة جديدة عشان نحافظ على حسابات الوصفات');return}
  if(packSize==null||packSize<=0){toast('راجع حجم العبوة ووحدة الشراء');return}
  o={...o,name:get('name'),unit:newUnit,purchaseUnit:buyUnit,packSize,packPrice:number(get('packPrice')),stock:number(get('stock')),place:get('place'),perishable:get('perishable')==='true'};
 }
 if(kind==='recipe'){const items=$$('#recipeComponents .component-row').map(el=>({ingredientId:el.querySelector('select').value,qty:number(el.querySelector('input').value)})).filter(x=>x.ingredientId&&x.qty>0);o={...o,name:get('name'),status:get('status'),notes:get('notes'),servings:number(get('servings')),items};}
 if(kind==='supplier')o={...o,name:get('name'),city:get('city'),phone:get('phone'),notes:get('notes')};
 if(kind==='equipment')o={...o,name:get('name'),state:get('state'),priority:get('priority'),notes:get('notes')};
 if(kind==='decision'){const names=get('tasks').split('\n').map(x=>x.trim()).filter(Boolean),previous=old?.tasks||[];o={...o,title:get('title'),category:get('category'),status:get('status'),notes:get('notes'),tasks:names.map(title=>({title,done:previous.find(t=>t.title===title)?.done||false}))};}
 if(kind==='quote'){
  const itemId=get('itemId'),price=number(get('price')),qty=number(get('packQty')),ship=number(get('shipping'))||0;
  if(!itemId||!get('supplierName')||price==null||price<0||qty==null||qty<=0||ship<0){toast('راجع سعر العرض وكمية العبوة');return}
  o={...o,itemId,supplierName:get('supplierName'),price,packQty:qty,shipping:ship,place:get('place'),notes:get('notes')};
 }
 if(kind==='purchase'){
  const itemId=get('itemId'),obj=[...state.products,...state.ingredients].find(x=>x.id===itemId&&!x.deletedAt);
  const qty=number(get('quantity')),total=number(get('totalPrice'));
  if(!obj||qty==null||qty<=0||total==null||total<0){toast('راجع الصنف والكمية والسعر');return}
  o={...o,kind:state.products.includes(obj)?'products':'ingredients',itemId,quantity:qty,totalPrice:total,place:get('place'),notes:get('notes'),purchasedAt:old?.purchasedAt||when()};
  // Purchases are logged as facts. Stock is only derived from a dated count; no guessed baseline.
 }
 if(kind==='ingredient'){
  const incomingStock=number(get('stock'));
  const oldStock=number(old?.stock);
  o.stockAt=incomingStock==null?null:(old&&oldStock===incomingStock&&old.stockAt?old.stockAt:when());
 }
 if(!['purchase','quote','product-buy'].includes(kind)&&!o.name&&!o.title){toast('اكتب اسم الصنف أو الموضوع');return}
 if(old)list.splice(list.indexOf(old),1,o);else list.push(o);persist();closeModal();render();toast('اتحفظ التعديل على جهازك');}
function deleteEntity(id){if(!activeModal)return;const {kind}=activeModal,list=kind==='category'?state.categories:(state[kind+'s']||state[kind]),o=list.find(x=>x.id===id);if(!o)return;if(kind==='category'&&state.products.some(p=>!p.deletedAt&&p.category===o.name)){toast('الفئة فيها أصناف. انقلها لفئة تانية قبل الحذف.');return;}if(!confirm(kind==='category'?'حذف الفئة الفاضية؟':'متأكد من حذف السجل؟ ممكن ترجعه من نسخة احتياطية.'))return;o.deletedAt=when();o.updatedAt=o.deletedAt;persist();closeModal();render();toast('تم الحذف');}
function updateQuick(el){const item=state[el.dataset.kind]?.find(x=>x.id===el.dataset.id);if(!item)return;const v=number(el.value);if(v!=null&&v<0){toast('ممنوع القيمة السالبة');el.value='';return;}item[el.dataset.quick]=v;if(el.dataset.quick==='stock')item.stockAt=v==null?null:when();item.updatedAt=when();persist();render();}
function toggleTask(el){const d=state.decisions.find(x=>x.id===el.dataset.id);if(!d||!d.tasks[+el.dataset.idx])return;d.tasks[+el.dataset.idx].done=el.checked;d.updatedAt=when();persist();render();}
function planText(){const rows=planRows(),done=rows.filter(x=>x.needed!=null&&x.needed>0),missing=rows.filter(x=>x.weekly==null).map(x=>x.name),lines=['مراجعة مشتريات البوفيه — 7 أيام','مصدر الكميات: متوسط الاستهلاك الأسبوعي + رصيد معلوم إن وجد. الرصيد غير المعروف مش جرد مؤكد، والرصيد المؤرخ تقديري.',''];for(const place of [...new Set(done.map(x=>x.place||'غير محدد'))]){const sub=done.filter(x=>x.place===place);if(!sub.length)continue;lines.push(`مشتريات ${place}:`);for(const x of sub)lines.push(`- ${x.name}: ${fmt(x.packs)} × ${packDisplay(x)}، احتياج صافي ${fmt(x.needed)} ${x.unit}، تكلفة ${x.packPrice==null?'غير محددة':money(x.packs*x.packPrice)}${x.stock==null?' (المخزون غير معروف)':''}`);lines.push('');}lines.push('أصناف استهلاكها الأسبوعي غير محدد: '+(missing.join('، ')||'لا يوجد'));lines.push('وصفات تحت التجربة لا تدخل قائمة الشراء. راجع الأولويات والموردين قبل الاعتماد.');return lines.join('\n')}
async function copyPlan(){const txt=planText();try{await navigator.clipboard.writeText(txt);toast('اتنسخت خطة الـ7 أيام. الصقها في محادثتنا هنا.')}catch{const a=document.createElement('textarea');a.value=txt;document.body.append(a);a.select();document.execCommand('copy');a.remove();toast('اتنسخت الخطة')}}
function normalizeName(s){return String(s||'').toLowerCase().replace(/[أإآ]/g,'ا').replace(/ى/g,'ي').replace(/ة/g,'ه').replace(/[\u064b-\u065f]/g,'').replace(/[^\u0621-\u064a\d]+/g,'').trim()}
function parseStock(text){const lines=text.split(/\r?\n/).map(x=>x.trim()).filter(Boolean),matches=[],unknown=[];for(const line of lines){const m=line.match(/^(.+?)[\s,:|\-\t]+([\d٠-٩]+(?:[.,][\d٠-٩]+)?)\s*(?:قطعة|عبوة|كرتونة|جرام|مل)?\s*$/);if(!m){unknown.push(line);continue}const name=m[1].trim(),raw=m[2].replace(/[٠-٩]/g,c=>'٠١٢٣٤٥٦٧٨٩'.indexOf(c)).replace(',','.');const obj=[...state.products,...state.ingredients].find(x=>!x.deletedAt&&normalizeName(x.name)===normalizeName(name));if(!obj){unknown.push(line);continue}matches.push({obj,qty:+raw,kind:state.products.includes(obj)?'products':'ingredients'});}return {matches,unknown}}
function openStockImport(){$('#modalRoot').innerHTML=`<div class="modal-backdrop" id="modalBackdrop"><div class="modal" role="dialog" aria-modal="true" aria-label="إدخال جرد"><div class="modal-head"><h2>إدخال الجرد من نص</h2>${actionBtn('إغلاق','close-modal','sm-btn')}</div><div class="modal-body"><p class="help">ابعت صورة الورقة لChatGPT هنا، وبعد قراءة الأصناف انسخ قائمة بالشكل ده والصقها. هتتطبق بس الأسطر المطابقة لأسماء المنتجات والخامات، ومش هتمس غيرها.</p><div class="code-sample">كانز: 24<br>توينكز كبير: 12<br>لبن: 1000</div><textarea class="textarea mt" id="stockText" rows="9" placeholder="اسم الصنف: الكمية"></textarea><div class="help mt">الكمية تكون بالوحدة المسجلة للصنف. راجع الأرقام قبل الاعتماد.</div></div><div class="modal-footer">${actionBtn('إلغاء','close-modal','outline-btn')}${actionBtn('مراجعة ثم اعتماد','apply-stock-import','primary-btn')}</div></div></div>`;$('#modalBackdrop').addEventListener('click',e=>{if(e.target.id==='modalBackdrop')closeModal()});}
function applyStockImport(){const raw=$('#stockText')?.value||'',result=parseStock(raw);if(!result.matches.length){toast('مافيش أصناف اتطابقت. راجع الأسماء والكميات.');return}const msg=`اتطابق ${result.matches.length} صنف. ${result.unknown.length?`فيه ${result.unknown.length} سطر مش معروف ومش هيتسجل. `:''}\n\n`+result.matches.map(m=>`${m.obj.name}: ${m.qty}`).join('\n')+'\n\nتعتمد الجرد ده؟';if(!confirm(msg))return;for(const m of result.matches){m.obj.stock=m.qty;m.obj.stockAt=when();m.obj.updatedAt=when()}persist();closeModal();render();toast(`تم اعتماد ${result.matches.length} كمية`)}
function downloadJSON(data,filename){
 const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);
}
function exportForChatGPT(){
 const payload={type:'buffet-manager-review',version:'1.5.0',exportedAt:new Date().toISOString(),periodDays:7,products:state.products.filter(x=>!x.deletedAt),ingredients:state.ingredients.filter(x=>!x.deletedAt),recipes:state.recipes.filter(x=>!x.deletedAt),suppliers:state.suppliers.filter(x=>!x.deletedAt),quotes:state.quotes.filter(x=>!x.deletedAt),purchases:state.purchases.filter(x=>!x.deletedAt),equipment:state.equipment.filter(x=>!x.deletedAt),decisions:state.decisions.filter(x=>!x.deletedAt),categories:state.categories.filter(x=>!x.deletedAt),weeklyPlan:planRows()};
 downloadJSON(payload,'Buffet_Manager_Review_'+new Date().toISOString().slice(0,10)+'.json');toast('اتجهز ملف بيانات المراجعة');
}
function exportData(){const name=`Buffet_Manager_Backup_${new Date().toISOString().slice(0,10)}.json`,blob=new Blob([JSON.stringify({app:'siwa-manager',exportedAt:new Date().toISOString(),state},null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('اتحملت النسخة الاحتياطية')}
async function importData(file){if(!file)return;try{const raw=JSON.parse(await file.text());if(raw.app!=='siwa-manager'||!raw.state||!Array.isArray(raw.state.products))throw Error('ملف مش تابع للبرنامج');if(!confirm('ده هيستبدل البيانات الحالية على الجهاز. متأكد؟'))return;state=normalizeState(raw.state);persist();render();toast('اترجعت البيانات')}catch(e){toast(`تعذر الاستيراد: ${e.message}`)}}
// Automatic cloud sync for a separately configured Supabase project. No keys hardcoded.
function updateSyncStatus(message){const el=$('#syncStatus');let label=message||(session?.access_token?'السحابة متصلة':'محلي فقط');if(!navigator.onLine)label='أوفلاين — محفوظ محليًا';if(el)el.innerHTML=`<span class="status-dot" style="background:${session?'#5ee6c0':'#f5bd72'}"></span>${esc(label)}`;const side=$('#sideSync');if(side)side.textContent=label;}
function queueSync(){if(!cloud?.url||!session?.access_token)return;clearTimeout(syncTimer);syncTimer=setTimeout(()=>syncCloud(),1100)}
async function authRequest(endpoint,body){const url=cloud.url.replace(/\/$/,'')+'/auth/v1/'+endpoint;const r=await fetch(url,{method:'POST',headers:{'apikey':cloud.key,'Content-Type':'application/json'},body:JSON.stringify(body)});const data=await r.json().catch(()=>({}));if(!r.ok)throw Error(data.msg||data.error_description||data.message||'تعذر تسجيل الدخول');return data;}
async function loginCloud(){
 const email=$('#cloudEmail')?.value?.trim(),password=$('#cloudPassword')?.value;
 if(!email||!password){toast('اكتب البريد الإلكتروني وكلمة المرور');return}
 cloud={...SIWA_CLOUD,email};
 try{
  updateSyncStatus('جار تسجيل الدخول');
  const newSession=await authRequest('token?grant_type=password',{email,password});
  // Do not persist or use a prior session from a different Supabase project.
  session={...newSession,expireAt:Date.now()+newSession.expires_in*1000};
  localStorage.setItem(CLOUD_KEY,JSON.stringify(cloud));
  localStorage.setItem(SESSION_KEY,JSON.stringify(session));
  render();await syncCloud();toast('تم تسجيل الدخول وتفعيل المزامنة');
 }catch(e){updateSyncStatus('تعذر تسجيل الدخول');toast('تعذر الدخول: '+e.message);render()}
}
async function validToken(){if(!session?.access_token)throw Error('يرجى تسجيل الدخول');if(Date.now()<(session.expireAt||0)-60000)return session.access_token;if(!session.refresh_token)throw Error('انتهت الجلسة');const v=await authRequest('token?grant_type=refresh_token',{refresh_token:session.refresh_token});session={...v,expireAt:Date.now()+v.expires_in*1000};localStorage.setItem(SESSION_KEY,JSON.stringify(session));return session.access_token;}
async function rest(method,path,body){const token=await validToken(),r=await fetch(cloud.url+'/rest/v1/'+path,{method,headers:{apikey:cloud.key,Authorization:'Bearer '+token,'Content-Type':'application/json',Prefer:'return=representation'},body:body?JSON.stringify(body):undefined});const text=await r.text();let data;try{data=text?JSON.parse(text):null}catch{data=text}if(!r.ok)throw Error(data?.message||data?.details||'خطأ في المزامنة '+r.status);return data;}
async function myUserId(){const tok=await validToken();const r=await fetch(cloud.url+'/auth/v1/user',{headers:{apikey:cloud.key,Authorization:'Bearer '+tok}});if(!r.ok)throw Error('تعذر قراءة الحساب');const u=await r.json();return u.id;}
function mergeData(local,remote){const a=normalizeState(local),b=normalizeState(remote),out={...a};for(const k of ['products','ingredients','recipes','suppliers','equipment','decisions','purchases','quotes','categories']){const map=new Map();for(const x of [...(b[k]||[]),...(a[k]||[])]){const existing=map.get(x.id);if(!existing||(Number(x.updatedAt)||0)>=(Number(existing.updatedAt)||0))map.set(x.id,x)}out[k]=[...map.values()];}out.prefs=(Number(a.prefs?.updatedAt)||0)>=(Number(b.prefs?.updatedAt)||0)?a.prefs:b.prefs;return out;}
async function syncCloud(){if(syncBusy||!cloud?.url||!session?.access_token||!navigator.onLine)return;syncBusy=true;updateSyncStatus('جار المزامنة...');try{const id=await myUserId();let success=false;for(let attempts=0;attempts<4;attempts++){const r=await rest('GET',`siwa_manager_state?user_id=eq.${encodeURIComponent(id)}&select=user_id,payload,revision`),remote=r?.[0];const merged=mergeData(state,remote?.payload);let updated;if(remote&&JSON.stringify(remote.payload)===JSON.stringify(merged)){state=merged;persist(false);success=true;break;}if(remote){updated=await rest('PATCH',`siwa_manager_state?user_id=eq.${encodeURIComponent(id)}&revision=eq.${remote.revision}` ,{payload:merged,revision:remote.revision+1});if(!updated?.length)continue;}else{try{updated=await rest('POST','siwa_manager_state',{user_id:id,payload:merged,revision:1});}catch(e){if(attempts<3)continue;throw e;}}if(updated?.length){const latest=mergeData(state,merged);state=latest;persist(false);if(JSON.stringify(latest)!==JSON.stringify(merged))setTimeout(queueSync,1600);success=true;break;}}if(!success)throw Error('تعارض تحديث، حاول مجددًا');updateSyncStatus('متزامن');if(screen!=='settings'&&!activeModal)render();}catch(e){updateSyncStatus('تعذرت المزامنة');console.warn('Sync failure',e);toast('المزامنة متوقفة: '+e.message)}finally{syncBusy=false}}
function logoutCloud(){session=null;localStorage.removeItem(SESSION_KEY);render();toast('تم تسجيل الخروج، بيانات الجهاز محفوظة')}
document.addEventListener('click',async e=>{const t=e.target.closest('[data-action]');if(!t)return;const a=t.dataset.action,id=t.dataset.id;switch(a){case'nav':changeScreen(t.dataset.screen);break;case'category':category=t.dataset.category;render();break;case'menu-status':menuStatus=t.dataset.status;render();break;case'close-modal':closeModal();break;case'delete-entity':deleteEntity(id);break;case'add-component':$('#recipeComponents')?.insertAdjacentHTML('beforeend',renderComponent());break;case'remove-component':t.closest('.component-row')?.remove();break;case'copy-plan':await copyPlan();break;case'open-chatgpt':window.open('https://chatgpt.com/','_blank','noopener,noreferrer');break;case'stock-import':openStockImport();break;case'apply-stock-import':applyStockImport();break;case'export':exportData();break;case'export-chatgpt':exportForChatGPT();break;case'import':$('#importFile').click();break;case'cloud-login':await loginCloud();break;case'cloud-sync':await syncCloud();break;case'cloud-logout':logoutCloud();break;case'buy-product':openModal('product-buy',id);break;default:{const m=a.match(/^(add|edit)-(product|ingredient|recipe|supplier|equipment|decision|purchase|quote|category)$/);if(m)openModal(m[2],m[1]==='edit'?id:null)}}});
document.addEventListener('change',e=>{const t=e.target;if(t.id==='f-unit')refreshPurchaseUnitOptions();if(t.id==='f-purchaseUnit')adjustPurchaseQuantity(t);if(t.dataset.quick)updateQuick(t);if(t.dataset.task)toggleTask(t)});
document.addEventListener('input',e=>{if(e.target.id==='menuSearch'){const pos=e.target.selectionStart;filter=e.target.value;render();const el=$('#menuSearch');el.focus();el.setSelectionRange(pos,pos)}});
$('#importFile').addEventListener('change',async e=>{await importData(e.target.files[0]);e.target.value=''});
$('#menuButton').addEventListener('click',()=>$('#sidebar').classList.toggle('open'));
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal()});
window.addEventListener('online',()=>{updateSyncStatus();queueSync()});window.addEventListener('offline',()=>updateSyncStatus());document.addEventListener('visibilitychange',()=>{if(!document.hidden)queueSync()});
render();setInterval(()=>{if(!document.hidden&&navigator.onLine)syncCloud()},45000);if('serviceWorker'in navigator&&location.protocol.startsWith('http'))navigator.serviceWorker.register('./sw.js').catch(e=>console.warn('SW',e));queueSync();
