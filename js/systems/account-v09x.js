// LEGEND: Roads of Ashmere v0.9.x - Account / Profile Screen
(() => {
  const root = () => document.getElementById('root');
  const S = () => window.LegendStorage || {};
  const esc = window.LegendHtmlV120.escapeHtml;
  const local = () => S().loadPlayer?.() || null;
  const profileStore = window.LegendAccountProfileStoreV09x?.create({ loadLocalPlayer: local });
  const getProfile = profileStore?.getProfile || (() => null);
  const saveProfile = profileStore?.saveProfile || (() => {});
  const deleteProfile = profileStore?.deleteProfile || (() => {});
  const snapshotTraveler = profileStore?.snapshotTraveler || (() => null);

  const cloudService=window.LegendAccountCloudV09x?.create({
    getClient:client,
    isConnected:connected,
    getHealth:health,
    loadLocalPlayer:local,
    saveLocalPlayer:player=>S().savePlayer?.(player)
  });
  const cloudReady=cloudService?.cloudReady||(()=>false);
  const cloudList=cloudService?.cloudList||(async()=>({ok:false,rows:[]}));
  const cloudSave=cloudService?.cloudSave||(async()=>({ok:false,message:'Cloud traveler storage is unavailable.'}));
  const cloudLoad=cloudService?.cloudLoad||(async()=>({ok:false,message:'Cloud traveler storage is unavailable.'}));
  const cloudDelete=cloudService?.cloudDelete||(async()=>({ok:false,message:'Cloud traveler storage is unavailable.'}));
  const fmtDate=cloudService?.fmtDate||(()=> 'Not synced yet');

  function client(){ return window.LegendSupabaseV09x?.client || null; }
  function connected(){ return !!client(); }
  function health(){ return window.LegendSupabaseV09x?.health || null; }
  const authService=window.LegendAccountAuthV09x?.create({
    getClient:client,
    isConnected:connected,
    getHealth:health,
    escapeHtml:esc,
    getProfile,
    saveProfile,
    getLocalPlayer:local
  });
  const getSession=authService?.getSession||(async()=>null);
  const refreshHealth=authService?.refreshHealth||(async()=>health());
  const signOut=authService?.signOut||(async()=>({ok:false,message:'Account sign out is unavailable.'}));
  const sessionEmail=authService?.sessionEmail||(session=>session?.user?.email||'');
  const authBox=authService?.authBox||(()=>'<section class="account09x-panel account09x-auth-box"><p>Account access is unavailable. Refresh before retrying.</p></section>');
  const profileView=window.LegendAccountProfileViewV09x?.create({
    root,
    escapeHtml:esc,
    sessionEmail,
    formatDate:fmtDate
  });
  async function renderAccount(message = ''){
    await refreshHealth();
    const session=await getSession();
    const pl=local();
    const prof=getProfile();
    const cloudCanUse=cloudReady(session);
    const cloudResult=await cloudList(session);
    const cloudRows=cloudResult.rows||[];
    const name=prof?.displayName||pl?.username||session?.user?.user_metadata?.display_name||'Ashmere Traveler';

    if(typeof profileView?.render!=='function'){
      const host=root();
      if(host)host.innerHTML='<main class="account09x"><div class="account09x-wrap"><h1>Profile is unavailable</h1><p>The profile view module did not load. Refresh before continuing.</p></div></main>';
      return;
    }

    profileView.render({
      message,
      session,
      player:pl,
      cloudCanUse,
      cloudRows,
      displayName:name,
      authBox:authBox(session,prof),
      onBackTitle:()=>window.LegendGameBootstrap?.title?.(),
      onContinueTraveler:()=>window.LegendGameBootstrap?.continueGame?.(),
      onNewTraveler:()=>window.LegendGameBootstrap?.newTraveler?.(),
      onSubmitProfile:displayNameValue=>{
        const displayName=String(displayNameValue||'').trim()||pl?.username||'Ashmere Traveler';
        saveProfile({
          ...(prof||{}),
          displayName,
          email:sessionEmail(session),
          authUserId:session?.user?.id||null,
          activeTraveler:prof?.activeTraveler||snapshotTraveler(pl)
        });
        renderAccount('Profile saved.');
      },
      onSignOut:async button=>{
        button.disabled=true;
        button.textContent='Signing Out...';
        const result=await signOut();
        renderAccount(result.message);
      },
      onCloudLoad:async slot=>{
        const result=await cloudLoad(session,slot);
        if(result.ok)window.LegendGameBootstrap?.continueGame?.();
        else renderAccount(result.message);
      },
      onCloudSave:async slot=>{
        const result=await cloudSave(session,slot);
        renderAccount(result.message);
      },
      onCloudDelete:async slot=>{
        if(!confirm('Clear Cloud Slot '+slot+'? This does not delete your local traveler.'))return;
        const result=await cloudDelete(session,slot);
        renderAccount(result.message);
      }
    });

    authService?.bindAuthForm({onComplete:message=>renderAccount(message)});
  }

  window.LegendAccountV09x = { renderAccount, getProfile, saveProfile, deleteProfile, getSession, cloudSave, cloudLoad, cloudList, cloudDelete };
})();