/* LEGEND v0.20.36 - Cloud traveler-slot service.
 * Handles Supabase traveler slot CRUD independently from profile/auth presentation.
 * Existing table name, two-slot limit, payload shape, and error messages are preserved.
 */
(() => {
  function create(context = {}) {
    const {getClient,isConnected,getHealth,loadLocalPlayer,saveLocalPlayer}=context;
    if(typeof getClient!=='function'||typeof isConnected!=='function'||typeof getHealth!=='function'||
      typeof loadLocalPlayer!=='function'||typeof saveLocalPlayer!=='function')return null;
    const CLOUD_TABLE='traveler_slots';
    const CLOUD_SLOT_COUNT=2;
    const client=getClient,connected=isConnected,health=getHealth,local=loadLocalPlayer,savePlayer=saveLocalPlayer;
  function cloudReady(session){
    return !!(session?.user && connected() && health()?.ok !== false);
  }

  function cloudErrorMessage(err){
    const message = err?.message || 'Cloud save failed.';
    if(/traveler_slots|relation .* does not exist|schema cache/i.test(message)){
      return 'Cloud traveler storage is not installed yet. Run supabase/traveler-slots.sql in the Supabase SQL editor once.';
    }
    return message;
  }

  async function cloudList(session){
    if(!cloudReady(session)) return { ok:false, rows:[] };
    try {
      const result = await client().from(CLOUD_TABLE).select('slot,display_name,updated_at').eq('user_id', session.user.id).order('slot', { ascending:true });
      if(result.error) throw result.error;
      return { ok:true, rows:result.data || [] };
    } catch(err){
      console.warn('LEGEND cloud list failed:', err);
      return { ok:false, rows:[], message:cloudErrorMessage(err) };
    }
  }

  async function cloudSave(session, slot){
    const pl = local();
    if(!cloudReady(session)) return { ok:false, message:'Sign in before saving a traveler to the cloud.' };
    if(!pl) return { ok:false, message:'Create a traveler before saving a cloud slot.' };
    if(slot < 1 || slot > CLOUD_SLOT_COUNT) return { ok:false, message:'Invalid cloud traveler slot.' };
    try {
      const result = await client().from(CLOUD_TABLE).upsert({ user_id:session.user.id, slot, display_name:pl.username || 'Unnamed Traveler', traveler_data:pl, updated_at:new Date().toISOString() }, { onConflict:'user_id,slot' });
      if(result.error) throw result.error;
      return { ok:true, message:'Cloud Slot ' + slot + ' saved.' };
    } catch(err){
      console.warn('LEGEND cloud save failed:', err);
      return { ok:false, message:cloudErrorMessage(err) };
    }
  }

  async function cloudLoad(session, slot){
    if(!cloudReady(session)) return { ok:false, message:'Sign in before loading a cloud traveler.' };
    try {
      const result = await client().from(CLOUD_TABLE).select('traveler_data').eq('user_id', session.user.id).eq('slot', slot).maybeSingle();
      if(result.error) throw result.error;
      if(!result.data?.traveler_data) return { ok:false, message:'Cloud Slot ' + slot + ' is empty.' };
      savePlayer(result.data.traveler_data);
      return { ok:true, message:'Cloud Slot ' + slot + ' loaded into this browser.' };
    } catch(err){
      console.warn('LEGEND cloud load failed:', err);
      return { ok:false, message:cloudErrorMessage(err) };
    }
  }

  async function cloudDelete(session, slot){
    if(!cloudReady(session)) return { ok:false, message:'Sign in before clearing a cloud traveler.' };
    try {
      const result = await client().from(CLOUD_TABLE).delete().eq('user_id', session.user.id).eq('slot', slot);
      if(result.error) throw result.error;
      return { ok:true, message:'Cloud Slot ' + slot + ' cleared.' };
    } catch(err){
      console.warn('LEGEND cloud delete failed:', err);
      return { ok:false, message:cloudErrorMessage(err) };
    }
  }
  function fmtDate(value){
    if(!value) return 'Not synced yet';
    try { return new Date(value).toLocaleString([], { dateStyle:'medium', timeStyle:'short' }); }
    catch { return 'Recently'; }
  }


    return Object.freeze({cloudReady,cloudErrorMessage,cloudList,cloudSave,cloudLoad,cloudDelete,fmtDate});
  }
  window.LegendAccountCloudV09x=Object.freeze({create});
})();
