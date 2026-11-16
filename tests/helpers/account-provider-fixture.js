// Synthetic provider boundary for UI/callback verification; never contacts Supabase.
function installAccountFixture(){
  const clone=value=>JSON.parse(JSON.stringify(value));
  const fixture={session:null,rows:{},calls:[],failSignIn:false,holdSignIn:false,failCloud:false};
  const user={id:'synthetic-account-user',email:'traveler@example.test',user_metadata:{display_name:'Synthetic Traveler'}};
  const client={auth:{
    getSession:async()=>({data:{session:fixture.session}}),
    signUp:async input=>{fixture.calls.push({kind:'signup',email:input.email,name:input.options.data.display_name,redirect:input.options.emailRedirectTo});return{data:{session:null,user}};},
    signInWithPassword:async input=>{fixture.calls.push({kind:'signin',email:input.email,passwordReceived:input.password==='journey-fixture-password'});if(fixture.holdSignIn)await new Promise(resolve=>fixture.release=resolve);if(fixture.failSignIn)return{error:{message:'Synthetic sign-in failure'}};fixture.session={user};return{data:{session:fixture.session,user}};},
    signOut:async()=>{fixture.calls.push({kind:'signout'});fixture.session=null;return{};}
  },from(table){
    if(table!=='traveler_slots')throw new Error('Unexpected provider table');
    let kind='list',columns='',filters={};
    const result=()=>{if(filters.user_id!==user.id)throw new Error('Missing synthetic user scope');if(fixture.failCloud)return{error:{message:'Synthetic cloud failure'}};
      if(kind==='delete'){fixture.calls.push({kind:'delete',slot:Number(filters.slot)});delete fixture.rows[filters.slot];return{};}
      if(columns==='traveler_data'){fixture.calls.push({kind:'load',slot:Number(filters.slot)});return{data:fixture.rows[filters.slot]?clone(fixture.rows[filters.slot]):null};}
      return{data:Object.values(fixture.rows).map(({slot,display_name,updated_at})=>({slot,display_name,updated_at}))};};
    const query={select(value){columns=value;return this;},eq(key,value){filters[key]=value;return this;},order(){return Promise.resolve(result());},maybeSingle(){return Promise.resolve(result());},delete(){kind='delete';return this;},then(resolve,reject){return Promise.resolve().then(result).then(resolve,reject);},upsert(data,options){if(data.user_id!==user.id||options.onConflict!=='user_id,slot')throw new Error('Unexpected cloud save scope');fixture.calls.push({kind:'save',slot:data.slot,player:clone(data.traveler_data)});if(fixture.failCloud)return Promise.resolve({error:{message:'Synthetic cloud failure'}});fixture.rows[data.slot]=clone(data);return Promise.resolve({});}};
    return query;
  }};
  fixture.client=client;fixture.user=user;window.__accountFixture=fixture;
  window.LegendSupabaseV09x={client,health:{ok:true},checkHealth:async()=>({ok:true})};
}
module.exports={installAccountFixture};
