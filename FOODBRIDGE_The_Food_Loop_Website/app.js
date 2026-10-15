const listings=[
{id:1,name:"SVCE College Campus Canteen",category:"human",items:"Rice, Sambar, Veg Curry",kg:35,city:"Tirupati",address:"SVCE College Campus, Tirupati",lat:13.6288,lng:79.4192,status:"Available"},
{id:2,name:"Grand Spice Kitchen & Banquet",category:"human",items:"Cooked Rice & Sweet Pongal",kg:48,city:"Tirupati",address:"Tirupati Main Road",lat:13.635,lng:79.408,status:"Available"},
{id:3,name:"Sunrise Artisan Bakery",category:"human",items:"Day-old bread, croissants & veg cuttings",kg:22,city:"Tirupati",address:"Renigunta Road, Tirupati",lat:13.64,lng:79.42,status:"Available"},
{id:4,name:"Royal Convention Wedding Hall",category:"animal",items:"Kitchen scraps & food leftovers",kg:65,city:"Tirupati",address:"Alipiri Road, Tirupati",lat:13.62,lng:79.41,status:"Available"}
];
const leaders=[
["#1","Royal Convention Wedding Hall","Events/Wedding","310 kg","775 kg CO₂","Zero-Waste Champion"],
["#2","SVCE College Campus Canteen","Hostel/College","245 kg","612 kg CO₂","Impact Hero"],
["#3","Grand Spice Kitchen & Banquet","Restaurant","190 kg","475 kg CO₂","Eco Guardian"]
];
let map,markers=[],currentFilter="all";

function showSection(id){document.getElementById(id).scrollIntoView({behavior:"smooth"})}
function toast(msg){const t=document.getElementById("toast");t.textContent=msg;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2600)}

function renderFeed(){
 const q=document.getElementById("citySearch").value.toLowerCase();
 const list=listings.filter(x=>(currentFilter==="all"||currentFilter===x.category)&&(!q||(x.name+x.items+x.city).toLowerCase().includes(q)));
 document.getElementById("feedList").innerHTML=list.map(x=>`<article class="listing ${x.category}">
 <span class="tag">${x.category==="human"?"♻ HUMAN NGO / FOOD":"🐄 ANIMAL FARM FEED"}</span>
 <h3>${x.name}</h3><p>${x.items}</p><p>⌖ ${x.address}</p>
 <div class="listing-footer"><strong>${x.kg} kg</strong><button class="mini-btn" onclick="openListing(${x.id})">Show on Map</button></div></article>`).join("");
 document.getElementById("activeCount").textContent=listings.length;
}
function filterFeed(type,el){currentFilter=type;document.querySelectorAll(".filter").forEach(b=>b.classList.remove("active"));el.classList.add("active");renderFeed()}
function openListing(id){const x=listings.find(a=>a.id===id);showSection("maps");if(map){map.setView([x.lat,x.lng],15);markers.find(m=>m._foodId===id)?.openPopup()}}
function renderPlaces(){
 document.getElementById("placeList").innerHTML=listings.map(x=>`<div class="place"><span class="kg">${x.kg} kg</span><h3>${x.name}</h3><p>${x.items}</p><p>⌖ ${x.address}</p><button onclick="openListing(${x.id})">Show on Map</button> <button onclick="window.open('https://www.google.com/maps/dir/?api=1&destination=${x.lat},${x.lng}','_blank')">Directions</button></div>`).join("");
}
function initMap(){
 map=L.map("map").setView([13.6288,79.4192],13);
 L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:"© OpenStreetMap contributors"}).addTo(map);
 listings.forEach(x=>{let m=L.marker([x.lat,x.lng]).addTo(map).bindPopup(`<b>${x.name}</b><br>${x.kg} kg<br><a target="_blank" href="https://www.google.com/maps/dir/?api=1&destination=${x.lat},${x.lng}">Open directions</a>`);m._foodId=x.id;markers.push(m)});
 renderPlaces();
}
function openDirections(){window.open("https://www.google.com/maps/search/?api=1&query=SVCE+College+Tirupati","_blank")}

document.getElementById("donationForm").addEventListener("submit",e=>{
 e.preventDefault();
 const donor=document.getElementById("donor").value, food=document.getElementById("food").value, weight=Number(document.getElementById("weight").value), route=document.querySelector('input[name="route"]:checked').value;
 const token="FB-QR-"+(1001+listings.length);
 listings.unshift({id:Date.now(),name:donor,category:route,items:food,kg:weight,city:"Tirupati",address:document.getElementById("address").value,lat:13.6288,lng:79.4192,status:"Available"});
 renderFeed();renderPlaces();setQR(token);document.getElementById("qrInput").value=token;showSection("qr");toast(`Donation published! ${token} generated.`);
});
document.querySelectorAll('input[name="route"]').forEach(r=>r.addEventListener("change",()=>{document.querySelectorAll(".route-option").forEach(x=>x.classList.remove("selected"));r.closest(".route-option").classList.add("selected")}));
function useGPS(){if(!navigator.geolocation)return toast("GPS is not supported.");navigator.geolocation.getCurrentPosition(p=>{document.getElementById("address").value=`GPS: ${p.coords.latitude.toFixed(5)}, ${p.coords.longitude.toFixed(5)}`;toast("GPS location captured.");},()=>toast("Unable to access GPS."))}
function setQR(token){document.getElementById("activeQR").textContent=token;document.getElementById("qrInput").value=token;const box=document.getElementById("qrcode");box.innerHTML="";new QRCode(box,{text:token,width:180,height:180})}
function verifyQR(){const token=document.getElementById("qrInput").value.trim();const ok=/^FB-QR-100[1-5]$/.test(token)||token.startsWith("FB-QR-");document.getElementById("verifyResult").innerHTML=ok?`<div style="padding:12px;background:#e5f7ef;color:#08785f;border-radius:9px">✓ Pickup verified successfully for <b>${token}</b>.</div>`:`<div style="padding:12px;background:#fff0f0;color:#a33;border-radius:9px">✕ Invalid or expired QR token.</div>`}
function openAI(){document.getElementById("aiModal").classList.add("open")}
function closeAI(){document.getElementById("aiModal").classList.remove("open")}
function sendChat(){const input=document.getElementById("chatInput"),q=input.value.trim();if(!q)return;const box=document.getElementById("chatMessages");box.innerHTML+=`<div class="user-msg">${q}</div>`;input.value="";let ans="I can help you post a donation, choose a human/animal route, verify a pickup QR, or find nearby listings.";const l=q.toLowerCase();if(l.includes("route")||l.includes("fresh"))ans="Fresh food that is safe for people is routed to NGOs, shelters and community kitchens. Kitchen scraps or past-shelf-life material is routed to animal farms.";if(l.includes("qr"))ans="Use QR Verify, enter the FB-QR token, and press Verify Pickup. A successful scan records the handoff.";if(l.includes("map")||l.includes("near"))ans="Open Google Maps Nav to view nearby listings and launch turn-by-turn directions.";setTimeout(()=>{box.innerHTML+=`<div class="bot">${ans}</div>`;box.scrollTop=box.scrollHeight},300)}
function renderLeaders(){document.getElementById("leaderRows").innerHTML=leaders.map(r=>`<tr><td>${r[0]}</td><td><b>${r[1]}</b></td><td>${r[2]}</td><td>${r[3]}</td><td>${r[4]}</td><td><span class="badge">${r[5]}</span></td></tr>`).join("")}
function initCharts(){
 new Chart(document.getElementById("pie1"),{type:"doughnut",data:{labels:["Human Food","Animal Feed","Other"],datasets:[{data:[65,30,5]}]},options:{responsive:true}});
 new Chart(document.getElementById("pie2"),{type:"doughnut",data:{labels:["College","Restaurant","Wedding","Home"],datasets:[{data:[20,35,25,20]}]},options:{responsive:true}});
 new Chart(document.getElementById("bar1"),{type:"bar",data:{labels:["Jun","Jul","Aug","Sep","Oct"],datasets:[{label:"Food rescued (kg)",data:[120,310,470,650,950]}]},options:{responsive:true,scales:{y:{beginAtZero:true}}}});
 new Chart(document.getElementById("line1"),{type:"line",data:{labels:["Jun","Jul","Aug","Sep","Oct"],datasets:[{label:"AI predicted",data:[150,330,500,700,1000],tension:.35},{label:"Actual rescue",data:[120,310,470,650,950],tension:.35}]},options:{responsive:true}});
}
renderFeed();renderLeaders();initCharts();window.addEventListener("load",()=>{initMap();setQR("FB-QR-1001")});
// Make functions available to the HTML onclick handlers.
Object.assign(window, {
  showSection,
  filterFeed,
  renderFeed,
  openListing,
  openDirections,
  useGPS,
  setQR,
  verifyQR,
  openAI,
  closeAI,
  sendChat,
  useGPS
});
