/* Android/Web bridge for ROTUL'S AI PRO. Keeps the existing UI and renderer API. */
(function(){
  const api='https://openrouter.ai/api/v1';
  const jsonHeaders=(key)=>({'Content-Type':'application/json','Authorization':'Bearer '+key,'HTTP-Referer':'https://rotuls-ai-pro.local','X-Title':"ROTUL'S AI PRO"});
  async function chat({key,model,messages}){
    const r=await fetch(api+'/chat/completions',{method:'POST',headers:jsonHeaders(key),body:JSON.stringify({model,messages})});
    const j=await r.json(); if(!r.ok) throw new Error(j?.error?.message||'OpenRouter request failed');
    return {ok:true,text:j?.choices?.[0]?.message?.content||''};
  }
  async function vision({key,model,prompt,dataUrl}){
    return chat({key,model,messages:[{role:'user',content:[{type:'text',text:prompt},{type:'image_url',image_url:{url:dataUrl}}]}]});
  }
  async function models(key){
    const r=await fetch(api+'/models',{headers:{Authorization:'Bearer '+key}}); const j=await r.json();
    if(!r.ok) return {ok:false,error:j?.error?.message||'Gagal memuat model'};
    return {ok:true,models:(j.data||[]).slice(0,150)};
  }
  function download(name,blob){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1000);return {ok:true};}
  async function transcribeBrowser(){
    return new Promise((resolve)=>{
      const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
      if(!SR) return resolve({ok:false,error:'Pengenalan suara tidak tersedia di WebView Android ini.'});
      const r=new SR(); r.lang='id-ID'; r.interimResults=false; r.maxAlternatives=1;
      r.onresult=e=>resolve({ok:true,text:e.results[0][0].transcript});
      r.onerror=e=>resolve({ok:false,error:e.error||'Voice recognition gagal'}); r.onend=()=>{}; r.start();
    });
  }
  async function makeDocx({content}){return download('ROTULS-AI-PRO.doc','<html><body><pre>'+escapeHtml(content)+'</pre></body></html>');}
  async function makePdf({title,content}){return download('ROTULS-AI-PRO.txt',new Blob([title+'\n\n'+content],{type:'text/plain'}));}
  async function makeXlsx({rows}){const csv=rows.map(r=>r.map(x=>'"'+String(x).replace(/"/g,'""')+'"').join(',')).join('\n');return download('ROTULS-AI-PRO.csv',new Blob([csv],{type:'text/csv'}));}
  async function makePptx({slides}){let t=slides.map(s=>s.title+'\n\n'+s.body).join('\n\n---\n\n');return download('ROTULS-AI-PRO-Presentation.txt',new Blob([t],{type:'text/plain'}));}
  async function generateImage(){return {ok:false,error:'Image generation belum tersedia melalui bridge Android ini. Pilih model image-capable dari OpenRouter dan gunakan Chat/vision.'};}
  async function generateSong(){return {ok:false,error:'Audio/music generation belum tersedia melalui bridge Android ini.'};}
  async function generateVideo(){return {ok:false,error:'Video generation belum tersedia melalui bridge Android ini.'};}
  function escapeHtml(s){return String(s).replace(/[&<>]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[m]));}
  window.rotuls={chat,vision,models,transcribe:transcribeBrowser,makeDocx,makePdf,makeXlsx,makePptx,generateImage,generateSong,generateVideo};
})();
