const fs=require('fs');
const p='android/app/src/main/AndroidManifest.xml';
if(fs.existsSync(p)){
 let s=fs.readFileSync(p,'utf8');
 for(const perm of ['android.permission.CAMERA','android.permission.RECORD_AUDIO','android.permission.INTERNET']){
  if(!s.includes('android.permission.'+perm.split('.').pop())) s=s.replace('</manifest>',`  <uses-permission android:name="${perm}" />\n</manifest>`);
 }
 fs.writeFileSync(p,s);
}
