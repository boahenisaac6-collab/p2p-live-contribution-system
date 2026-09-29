const SUPABASE_URL="https://nakhxutwefeuzprsphba.supabase.co";
const SUPABASE_KEY="sb_publishable_L293YgSmmzXO5LWRvo4VKQ_Y3cXrpG1";
let contributions=[],adminCode="",editingId=null;
const $=id=>document.getElementById(id);
const headers=(json=false)=>({apikey:SUPABASE_KEY,Authorization:"Bearer "+SUPABASE_KEY,...(json?{"Content-Type":"application/json"}:{})});
const money=value=>new Intl.NumberFormat("en-GH",{style:"currency",currency:"GHS",minimumFractionDigits:2}).format(Number(value)||0).replace("GHS","GH₵");
const escapeHtml=(value="")=>String(value).replace(/[&<>'"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));

async function rpc(name,payload){
  const response=await fetch(SUPABASE_URL+"/rest/v1/rpc/"+name,{method:"POST",headers:headers(true),body:JSON.stringify(payload)});
  let data={}; try{data=await response.json()}catch{}
  return {ok:response.ok,status:response.status,data};
}

async function loadContributions(silent=false){
  if(!silent)$("statusText").textContent="Loading contribution list…";
  try{
    const response=await fetch(SUPABASE_URL+"/rest/v1/support_contributions?select=id,contributor_name,amount,created_at,updated_at&order=created_at.desc",{headers:headers()});
    if(!response.ok)throw new Error("load_failed");
    contributions=await response.json();
    renderPublic(); renderAdmin();
    $("statusText").textContent="Updated "+new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});
  }catch{
    $("statusText").textContent="Unable to load the contribution list. Tap Refresh to try again.";
  }
}

function renderPublic(){
  const q=$("searchInput").value.trim().toLowerCase();
  const visible=q?contributions.filter(item=>item.contributor_name.toLowerCase().includes(q)):contributions;
  const total=contributions.reduce((sum,item)=>sum+Number(item.amount||0),0);
  $("grandTotal").textContent=money(total);
  $("contributorCount").textContent=contributions.length+" "+(contributions.length===1?"contributor":"contributors");
  $("visibleCount").textContent=visible.length+" listed";
  $("tableWrap").style.display=visible.length?"block":"none";
  $("emptyState").style.display=visible.length?"none":"block";
  $("contributionBody").innerHTML=visible.map((item,index)=>"<tr><td>"+(index+1)+"</td><td class='name'>"+escapeHtml(item.contributor_name)+"</td><td class='amount'>"+money(item.amount)+"</td></tr>").join("");
}

function renderAdmin(){
  if(!$("adminApp").classList.contains("show"))return;
  $("adminList").innerHTML=contributions.length?contributions.map(item=>"<div class='row'><div><b>"+escapeHtml(item.contributor_name)+"</b><span>"+money(item.amount)+"</span></div><div class='actions'><button class='small' type='button' data-edit='"+item.id+"'>Edit</button><button class='small danger' type='button' data-delete='"+item.id+"'>Delete</button></div></div>").join(""):"<div class='empty'>No contributions yet.</div>";
}

function openModal(){
  $("adminModal").classList.add("open");
  $("codeScreen").style.display="block";
  $("adminApp").classList.remove("show");
  $("codeInput").value="";
  $("codeError").textContent="";
  $("adminError").textContent="";
  setTimeout(()=>$("codeInput").focus(),100);
}
function closeModal(){
  $("adminModal").classList.remove("open");
  adminCode=""; editingId=null;
  $("editBox").classList.remove("show");
}

$("searchInput").addEventListener("input",renderPublic);
$("refreshBtn").addEventListener("click",()=>loadContributions());
$("printBtn").addEventListener("click",()=>window.print());
$("adminBtn").addEventListener("click",openModal);
$("adminCloseBtn").addEventListener("click",closeModal);
$("adminModal").addEventListener("mousedown",event=>{if(event.target===$("adminModal"))closeModal();});
$("codeInput").addEventListener("input",event=>{event.target.value=event.target.value.replace(/\D/g,"").slice(0,4);});
$("codeInput").addEventListener("keydown",event=>{if(event.key==="Enter")$("openAdminBtn").click();});

$("openAdminBtn").addEventListener("click",async()=>{
  const code=$("codeInput").value.trim();
  $("codeError").textContent="";
  if(!/^\d{4}$/.test(code)){ $("codeError").textContent="Enter the 4-digit admin access code."; return; }
  const check=await rpc("support_delete",{p_pin:code,p_id:-1});
  const message=String((check.data&&check.data.message)||"").toLowerCase();
  if(message.includes("invalid admin")){ $("codeError").textContent="Incorrect admin access code."; return; }
  adminCode=code;
  $("codeScreen").style.display="none";
  $("adminApp").classList.add("show");
  renderAdmin();
});

$("addForm").addEventListener("submit",async event=>{
  event.preventDefault();
  const name=$("nameInput").value.trim(),amount=Number($("amountInput").value);
  $("adminError").textContent="";
  if(!name||!Number.isFinite(amount)||amount<=0){$("adminError").textContent="Enter a valid name and amount.";return;}
  const button=$("saveContributionBtn"); button.disabled=true; button.textContent="Saving…";
  const result=await rpc("support_add",{p_pin:adminCode,p_name:name,p_amount:amount});
  button.disabled=false; button.textContent="Add Contribution";
  if(!result.ok){$("adminError").textContent=(result.data&&result.data.message)||"Unable to save contribution.";return;}
  $("nameInput").value=""; $("amountInput").value="";
  await loadContributions(true);
});

$("adminList").addEventListener("click",async event=>{
  const editButton=event.target.closest("[data-edit]"),deleteButton=event.target.closest("[data-delete]");
  if(editButton){
    const item=contributions.find(row=>String(row.id)===editButton.dataset.edit);
    if(!item)return;
    editingId=item.id; $("editNameInput").value=item.contributor_name; $("editAmountInput").value=Number(item.amount);
    $("editBox").classList.add("show");
  }
  if(deleteButton){
    const item=contributions.find(row=>String(row.id)===deleteButton.dataset.delete);
    if(!item||!confirm("Delete "+item.contributor_name+"'s contribution of "+money(item.amount)+"?"))return;
    const result=await rpc("support_delete",{p_pin:adminCode,p_id:item.id});
    if(!result.ok){$("adminError").textContent=(result.data&&result.data.message)||"Unable to delete contribution.";return;}
    await loadContributions(true);
  }
});

$("editCloseBtn").addEventListener("click",()=>{editingId=null;$("editBox").classList.remove("show");});
$("updateContributionBtn").addEventListener("click",async()=>{
  const name=$("editNameInput").value.trim(),amount=Number($("editAmountInput").value);
  $("adminError").textContent="";
  if(!editingId||!name||!Number.isFinite(amount)||amount<=0){$("adminError").textContent="Enter a valid name and amount.";return;}
  const result=await rpc("support_update",{p_pin:adminCode,p_id:editingId,p_name:name,p_amount:amount});
  if(!result.ok){$("adminError").textContent=(result.data&&result.data.message)||"Unable to update contribution.";return;}
  editingId=null;$("editBox").classList.remove("show");
  await loadContributions(true);
});

loadContributions();
setInterval(()=>loadContributions(true),30000);