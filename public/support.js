const SUPABASE_URL="https://nakhxutwefeuzprsphba.supabase.co";
const SUPABASE_KEY="sb_publishable_L293YgSmmzXO5LWRvo4VKQ_Y3cXrpG1";

let activeCampaigns=[];
let publicContributions=[];
let selectedCampaignId=null;

let adminPin="";
let adminCampaigns=[];
let adminContributions=[];
let selectedAdminCampaignId=null;
let editingCampaignId=null;
let editingContributionId=null;

const $=id=>document.getElementById(id);
const apiHeaders=(json=false)=>({
  apikey:SUPABASE_KEY,
  Authorization:"Bearer "+SUPABASE_KEY,
  ...(json?{"Content-Type":"application/json"}:{})
});
const money=value=>new Intl.NumberFormat("en-GH",{
  style:"currency",currency:"GHS",minimumFractionDigits:2
}).format(Number(value)||0).replace("GHS","GH₵");
const clean=value=>String(value??"").trim();
const escapeHtml=(value="")=>String(value).replace(/[&<>'"]/g,c=>({
  "&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"
}[c]));
const currentPublicCampaign=()=>activeCampaigns.find(c=>String(c.id)===String(selectedCampaignId));
const currentAdminCampaign=()=>adminCampaigns.find(c=>String(c.id)===String(selectedAdminCampaignId));

function toast(message){
  $("toast").textContent=message;
  $("toast").classList.add("show");
  clearTimeout(window.__toastTimer);
  window.__toastTimer=setTimeout(()=>$("toast").classList.remove("show"),2200);
}

async function rpc(name,payload){
  const response=await fetch(SUPABASE_URL+"/rest/v1/rpc/"+name,{
    method:"POST",
    headers:apiHeaders(true),
    body:JSON.stringify(payload)
  });
  let data=null;
  try{data=await response.json()}catch{}
  return {ok:response.ok,status:response.status,data};
}

async function rest(path){
  const response=await fetch(SUPABASE_URL+"/rest/v1/"+path,{headers:apiHeaders()});
  if(!response.ok)throw new Error("Request failed");
  return response.json();
}

async function loadPublic(silent=false){
  if(!silent)$("statusText").textContent="Loading contribution dashboard…";
  try{
    const [campaigns,contributions]=await Promise.all([
      rest("support_campaigns?select=id,title,description,momo_network,momo_number,momo_account_name,is_open,created_at&order=created_at.desc"),
      rest("support_contributions?select=id,campaign_id,contributor_name,amount,created_at,updated_at&order=created_at.desc")
    ]);

    activeCampaigns=campaigns||[];
    publicContributions=contributions||[];

    if(!activeCampaigns.some(c=>String(c.id)===String(selectedCampaignId))){
      selectedCampaignId=activeCampaigns[0]?.id??null;
    }

    renderPublic();
    $("statusText").textContent=activeCampaigns.length
      ?"Updated "+new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})
      :"";
  }catch(error){
    $("statusText").textContent="Unable to load the contribution dashboard. Tap Refresh to try again.";
  }
}

function renderCampaignTabs(){
  const tabs=$("campaignTabs");
  if(activeCampaigns.length<=1){
    tabs.innerHTML="";
    tabs.style.display="none";
    return;
  }
  tabs.style.display="flex";
  tabs.innerHTML=activeCampaigns.map(c=>
    "<button class='campaignTab "+(String(c.id)===String(selectedCampaignId)?"active":"")+
    "' data-public-campaign='"+c.id+"'>"+escapeHtml(c.title)+"</button>"
  ).join("");
}

function renderPublic(){
  const campaign=currentPublicCampaign();
  const hasOpen=Boolean(campaign);

  $("publicArea").style.display=hasOpen?"block":"none";
  $("closedLanding").classList.toggle("show",!hasOpen);
  if(!hasOpen)return;

  renderCampaignTabs();

  $("campaignTitle").textContent=campaign.title;
  $("campaignDescription").textContent=campaign.description;
  $("momoNetwork").textContent=clean(campaign.momo_network).toUpperCase()+" MOBILE MONEY";
  $("momoNumber").textContent=campaign.momo_number;
  $("momoAccount").textContent=campaign.momo_account_name;
  $("listTitle").textContent=campaign.title;

  const rows=publicContributions.filter(x=>String(x.campaign_id)===String(campaign.id));
  const total=rows.reduce((sum,row)=>sum+Number(row.amount||0),0);
  $("grandTotal").textContent=money(total);
  $("contributorCount").textContent=String(rows.length);

  renderPublicRows();
}

function renderPublicRows(){
  const campaign=currentPublicCampaign();
  if(!campaign)return;

  const q=$("searchInput").value.trim().toLowerCase();
  const rows=publicContributions
    .filter(x=>String(x.campaign_id)===String(campaign.id))
    .filter(x=>!q||String(x.contributor_name).toLowerCase().includes(q));

  $("visibleCount").textContent=rows.length+" listed";
  $("tableWrap").style.display=rows.length?"block":"none";
  $("emptyState").style.display=rows.length?"none":"block";
  $("contributionBody").innerHTML=rows.map((row,index)=>
    "<tr><td>"+(index+1)+"</td><td class='name'>"+escapeHtml(row.contributor_name)+
    "</td><td class='amount'>"+money(row.amount)+"</td></tr>"
  ).join("");
}

$("campaignTabs").addEventListener("click",event=>{
  const button=event.target.closest("[data-public-campaign]");
  if(!button)return;
  selectedCampaignId=button.dataset.publicCampaign;
  $("searchInput").value="";
  renderPublic();
});

$("searchInput").addEventListener("input",renderPublicRows);
$("refreshBtn").addEventListener("click",()=>loadPublic());
$("printBtn").addEventListener("click",()=>window.print());
$("copyMomoBtn").addEventListener("click",async()=>{
  const campaign=currentPublicCampaign();
  if(!campaign)return;
  try{
    await navigator.clipboard.writeText(campaign.momo_number);
    toast("MoMo number copied");
  }catch{
    const temp=document.createElement("textarea");
    temp.value=campaign.momo_number;
    document.body.appendChild(temp);
    temp.select();
    document.execCommand("copy");
    temp.remove();
    toast("MoMo number copied");
  }
});

function openAdminModal(){
  $("adminModal").classList.add("open");
  $("pinScreen").style.display="block";
  $("adminApp").classList.remove("show");
  $("pinInput").value="";
  $("pinError").textContent="";
  adminPin="";
  setTimeout(()=>$("pinInput").focus(),80);
}
function closeAdminModal(){
  $("adminModal").classList.remove("open");
  adminPin="";
  editingCampaignId=null;
  editingContributionId=null;
  $("campaignEditor").classList.remove("show");
  $("editPanel").classList.remove("show");
}

$("adminBtn").addEventListener("click",openAdminModal);
$("adminCloseBtn").addEventListener("click",closeAdminModal);
$("adminModal").addEventListener("mousedown",event=>{
  if(event.target===$("adminModal"))closeAdminModal();
});
$("pinInput").addEventListener("input",event=>{
  event.target.value=event.target.value.replace(/\D/g,"").slice(0,4);
});
$("pinInput").addEventListener("keydown",event=>{
  if(event.key==="Enter")$("openAdminBtn").click();
});

$("openAdminBtn").addEventListener("click",async()=>{
  const pin=$("pinInput").value.trim();
  $("pinError").textContent="";
  if(!/^\d{4}$/.test(pin)){
    $("pinError").textContent="Enter the 4-digit admin PIN.";
    return;
  }

  const check=await rpc("support_verify_pin",{p_pin:pin});
  if(!check.ok||check.data!==true){
    $("pinError").textContent="Incorrect admin PIN.";
    return;
  }

  adminPin=pin;
  $("pinScreen").style.display="none";
  $("adminApp").classList.add("show");
  await loadAdminCampaigns();
});

async function loadAdminCampaigns(){
  const result=await rpc("support_admin_campaigns",{p_pin:adminPin});
  if(!result.ok){
    $("adminError").textContent=(result.data&&result.data.message)||"Unable to load campaigns.";
    return;
  }
  adminCampaigns=Array.isArray(result.data)?result.data:[];

  if(!adminCampaigns.some(c=>String(c.id)===String(selectedAdminCampaignId))){
    selectedAdminCampaignId=(adminCampaigns.find(c=>c.is_open)||adminCampaigns[0])?.id??null;
  }

  renderAdminCampaigns();
  renderAdminCampaignSelect();
  await loadAdminContributions();
}

function renderAdminCampaigns(){
  const wrap=$("campaignManager");
  if(!adminCampaigns.length){
    wrap.innerHTML="<div class='empty'>No campaigns yet. Create your first contribution.</div>";
    return;
  }

  wrap.innerHTML=adminCampaigns.map(c=>{
    const status=c.is_open?"OPEN":"CLOSED";
    const toggleText=c.is_open?"Close Contribution":"Open Contribution";
    return "<article class='campaignManageCard "+(c.is_open?"open":"closed")+"'>"+
      "<div class='campaignManageTop'><div><h4>"+escapeHtml(c.title)+"</h4><p>"+escapeHtml(c.description)+"</p></div>"+
      "<span class='statusPill "+(c.is_open?"open":"closed")+"'>"+status+"</span></div>"+
      "<div class='campaignMeta'>"+
        "<span class='metaChip'>"+escapeHtml(c.momo_network)+"</span>"+
        "<span class='metaChip'>"+escapeHtml(c.momo_number)+"</span>"+
        "<span class='metaChip'>"+escapeHtml(c.momo_account_name)+"</span>"+
      "</div>"+
      "<div class='campaignActions'>"+
        "<button class='smallBtn' type='button' data-manage-campaign='"+c.id+"'>Manage Contributors</button>"+
        "<button class='smallBtn' type='button' data-edit-campaign='"+c.id+"'>Edit Details</button>"+
        "<button class='smallBtn openClose "+(c.is_open?"dangerish":"")+"' type='button' data-toggle-campaign='"+c.id+"'>"+toggleText+"</button>"+
      "</div></article>";
  }).join("");
}

function renderAdminCampaignSelect(){
  const select=$("adminCampaignSelect");
  select.innerHTML=adminCampaigns.map(c=>
    "<option value='"+c.id+"' "+(String(c.id)===String(selectedAdminCampaignId)?"selected":"")+">"+
    escapeHtml(c.title)+" — "+(c.is_open?"OPEN":"CLOSED")+"</option>"
  ).join("");
  updateEntryFormState();
}

function updateEntryFormState(){
  const campaign=currentAdminCampaign();
  const enabled=Boolean(campaign&&campaign.is_open);
  $("nameInput").disabled=!enabled;
  $("amountInput").disabled=!enabled;
  $("saveContributionBtn").disabled=!enabled;
  $("saveContributionBtn").textContent=enabled?"Add Contribution":"Campaign Closed";
}

async function loadAdminContributions(){
  if(!selectedAdminCampaignId){
    adminContributions=[];
    renderAdminContributions();
    return;
  }
  const result=await rpc("support_admin_contributions",{
    p_pin:adminPin,
    p_campaign_id:Number(selectedAdminCampaignId)
  });
  if(!result.ok){
    $("adminError").textContent=(result.data&&result.data.message)||"Unable to load contributions.";
    return;
  }
  adminContributions=Array.isArray(result.data)?result.data:[];
  renderAdminContributions();
  updateEntryFormState();
}

function renderAdminContributions(){
  const wrap=$("adminContributionList");
  if(!adminContributions.length){
    wrap.innerHTML="<div class='empty'>No contributors recorded for this campaign.</div>";
    return;
  }

  wrap.innerHTML=adminContributions.map(row=>
    "<div class='adminRow'><div><b>"+escapeHtml(row.contributor_name)+"</b><span>"+money(row.amount)+"</span></div>"+
    "<div class='rowActions'>"+
      "<button class='smallBtn' type='button' data-edit-contribution='"+row.id+"'>Edit</button>"+
      "<button class='smallBtn dangerish' type='button' data-delete-contribution='"+row.id+"'>Delete</button>"+
    "</div></div>"
  ).join("");
}

$("adminCampaignSelect").addEventListener("change",async event=>{
  selectedAdminCampaignId=event.target.value;
  $("adminError").textContent="";
  $("editPanel").classList.remove("show");
  editingContributionId=null;
  await loadAdminContributions();
});

$("campaignManager").addEventListener("click",async event=>{
  const manage=event.target.closest("[data-manage-campaign]");
  const edit=event.target.closest("[data-edit-campaign]");
  const toggle=event.target.closest("[data-toggle-campaign]");

  if(manage){
    selectedAdminCampaignId=manage.dataset.manageCampaign;
    renderAdminCampaignSelect();
    await loadAdminContributions();
    document.querySelector(".adminSection").scrollIntoView({behavior:"smooth",block:"start"});
    return;
  }

  if(edit){
    const campaign=adminCampaigns.find(c=>String(c.id)===edit.dataset.editCampaign);
    if(campaign)openCampaignEditor(campaign);
    return;
  }

  if(toggle){
    const campaign=adminCampaigns.find(c=>String(c.id)===toggle.dataset.toggleCampaign);
    if(!campaign)return;
    const opening=!campaign.is_open;
    const question=opening
      ?"Open '"+campaign.title+"' on the public dashboard?"
      :"Close '"+campaign.title+"'? It will disappear from the public dashboard but its records will remain saved.";
    if(!confirm(question))return;

    const result=await rpc("support_campaign_set_open",{
      p_pin:adminPin,p_id:Number(campaign.id),p_is_open:opening
    });
    if(!result.ok){
      $("adminError").textContent=(result.data&&result.data.message)||"Unable to change campaign status.";
      return;
    }
    toast(opening?"Contribution opened":"Contribution closed");
    await loadAdminCampaigns();
    await loadPublic(true);
  }
});

function openCampaignEditor(campaign=null){
  editingCampaignId=campaign?.id??null;
  $("campaignError").textContent="";
  $("campaignEditor").classList.add("show");

  if(campaign){
    $("campaignEditorLabel").textContent="EDIT CAMPAIGN";
    $("campaignEditorTitle").textContent="Edit Contribution";
    $("campaignTitleInput").value=campaign.title;
    $("campaignDescriptionInput").value=campaign.description;
    $("campaignNetworkInput").value=campaign.momo_network;
    $("campaignNumberInput").value=campaign.momo_number;
    $("campaignAccountInput").value=campaign.momo_account_name;
    $("campaignOpenInput").checked=campaign.is_open;
    $("campaignOpenInput").disabled=true;
    $("saveCampaignBtn").textContent="Save Campaign Details";
  }else{
    $("campaignEditorLabel").textContent="NEW CAMPAIGN";
    $("campaignEditorTitle").textContent="Create Contribution";
    $("campaignTitleInput").value="";
    $("campaignDescriptionInput").value="";
    $("campaignNetworkInput").value="MTN";
    $("campaignNumberInput").value="0244080881";
    $("campaignAccountInput").value="SASU REXFORD";
    $("campaignOpenInput").checked=true;
    $("campaignOpenInput").disabled=false;
    $("saveCampaignBtn").textContent="Create Campaign";
  }
  $("campaignEditor").scrollIntoView({behavior:"smooth",block:"nearest"});
}

$("newCampaignBtn").addEventListener("click",()=>openCampaignEditor());
$("campaignEditorClose").addEventListener("click",()=>{
  editingCampaignId=null;
  $("campaignEditor").classList.remove("show");
});

$("saveCampaignBtn").addEventListener("click",async()=>{
  const title=clean($("campaignTitleInput").value);
  const description=clean($("campaignDescriptionInput").value);
  const network=clean($("campaignNetworkInput").value);
  const number=clean($("campaignNumberInput").value);
  const account=clean($("campaignAccountInput").value);
  $("campaignError").textContent="";

  if(!title||!description||!network||!number||!account){
    $("campaignError").textContent="Complete the title, description and mobile money details.";
    return;
  }

  const button=$("saveCampaignBtn");
  button.disabled=true;
  button.textContent="Saving…";

  const result=editingCampaignId
    ?await rpc("support_campaign_update",{
        p_pin:adminPin,p_id:Number(editingCampaignId),p_title:title,p_description:description,
        p_momo_network:network,p_momo_number:number,p_momo_account_name:account
      })
    :await rpc("support_campaign_create",{
        p_pin:adminPin,p_title:title,p_description:description,p_momo_network:network,
        p_momo_number:number,p_momo_account_name:account,p_is_open:$("campaignOpenInput").checked
      });

  button.disabled=false;

  if(!result.ok){
    $("campaignError").textContent=(result.data&&result.data.message)||"Unable to save campaign.";
    button.textContent=editingCampaignId?"Save Campaign Details":"Create Campaign";
    return;
  }

  const wasEditing=Boolean(editingCampaignId);
  editingCampaignId=null;
  $("campaignEditor").classList.remove("show");
  toast(wasEditing?"Campaign updated":"New campaign created");
  await loadAdminCampaigns();
  await loadPublic(true);
});

$("addForm").addEventListener("submit",async event=>{
  event.preventDefault();
  const campaign=currentAdminCampaign();
  const name=clean($("nameInput").value);
  const amount=Number($("amountInput").value);
  $("adminError").textContent="";

  if(!campaign||!campaign.is_open){
    $("adminError").textContent="Open this campaign before adding contributions.";
    return;
  }
  if(!name||!Number.isFinite(amount)||amount<=0){
    $("adminError").textContent="Enter a valid contributor name and amount.";
    return;
  }

  const button=$("saveContributionBtn");
  button.disabled=true;
  button.textContent="Saving…";
  const result=await rpc("support_add",{
    p_pin:adminPin,p_campaign_id:Number(campaign.id),p_name:name,p_amount:amount
  });
  button.disabled=false;
  button.textContent="Add Contribution";

  if(!result.ok){
    $("adminError").textContent=(result.data&&result.data.message)||"Unable to save contribution.";
    return;
  }

  $("nameInput").value="";
  $("amountInput").value="";
  toast("Contribution added");
  await loadAdminContributions();
  await loadPublic(true);
});

$("adminContributionList").addEventListener("click",async event=>{
  const edit=event.target.closest("[data-edit-contribution]");
  const del=event.target.closest("[data-delete-contribution]");

  if(edit){
    const row=adminContributions.find(x=>String(x.id)===edit.dataset.editContribution);
    if(!row)return;
    editingContributionId=row.id;
    $("editNameInput").value=row.contributor_name;
    $("editAmountInput").value=Number(row.amount);
    $("editPanel").classList.add("show");
    $("editPanel").scrollIntoView({behavior:"smooth",block:"nearest"});
    return;
  }

  if(del){
    const row=adminContributions.find(x=>String(x.id)===del.dataset.deleteContribution);
    if(!row)return;
    if(!confirm("Delete "+row.contributor_name+"'s contribution of "+money(row.amount)+"?"))return;

    const result=await rpc("support_delete",{p_pin:adminPin,p_id:Number(row.id)});
    if(!result.ok){
      $("adminError").textContent=(result.data&&result.data.message)||"Unable to delete contribution.";
      return;
    }
    toast("Contribution deleted");
    await loadAdminContributions();
    await loadPublic(true);
  }
});

$("editCloseBtn").addEventListener("click",()=>{
  editingContributionId=null;
  $("editPanel").classList.remove("show");
});

$("updateContributionBtn").addEventListener("click",async()=>{
  const name=clean($("editNameInput").value);
  const amount=Number($("editAmountInput").value);
  $("adminError").textContent="";

  if(!editingContributionId||!name||!Number.isFinite(amount)||amount<=0){
    $("adminError").textContent="Enter a valid contributor name and amount.";
    return;
  }

  const result=await rpc("support_update",{
    p_pin:adminPin,p_id:Number(editingContributionId),p_name:name,p_amount:amount
  });
  if(!result.ok){
    $("adminError").textContent=(result.data&&result.data.message)||"Unable to update contribution.";
    return;
  }

  editingContributionId=null;
  $("editPanel").classList.remove("show");
  toast("Contribution updated");
  await loadAdminContributions();
  await loadPublic(true);
});

loadPublic();
setInterval(()=>loadPublic(true),30000);