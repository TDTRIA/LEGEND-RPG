// LEGEND: Roads of Ashmere v0.9.x - Supabase client config
// Public anon key is safe in frontend code. Never commit the service role key.
(() => {
  const SUPABASE_URL = 'https://ewmygiawtlxxixsubvct.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3bXlnaWF3dGx4eGl4c3VidmN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5MTMzOTgsImV4cCI6MjA5NTQ4OTM5OH0.vBigbjVZpEgZNdQjhmmWzqt2NxYGOsZmfLoGP34br0Y';
  const HEALTH_TIMEOUT_MS = 6000;

  function unavailable(message){
    return {
      ok: false,
      status: 'unavailable',
      message
    };
  }

  if(!window.supabase || !window.supabase.createClient){
    console.warn('Supabase library did not load. Account features are disabled.');
    window.LegendSupabaseV09x = {
      client: null,
      url: SUPABASE_URL,
      ready: false,
      health: unavailable('Supabase library did not load.'),
      checkHealth: async () => unavailable('Supabase library did not load.')
    };
    return;
  }

  const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  });

  const service = {
    client,
    url: SUPABASE_URL,
    ready: true,
    health: {
      ok: null,
      status: 'checking',
      message: 'Checking Supabase service...'
    },
    async checkHealth(){
      if(!client){
        service.health = unavailable('Supabase client is unavailable.');
        return service.health;
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), HEALTH_TIMEOUT_MS);

      try {
        const response = await fetch(`${SUPABASE_URL}/auth/v1/settings`, {
          method: 'GET',
          headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`
          },
          cache: 'no-store',
          signal: controller.signal
        });

        if(!response.ok){
          service.health = {
            ok: false,
            status: `http-${response.status}`,
            message: `Supabase returned HTTP ${response.status}.`
          };
          return service.health;
        }

        service.health = {
          ok: true,
          status: 'online',
          message: 'Supabase Auth is reachable.'
        };
        return service.health;
      } catch(err){
        const timedOut = err?.name === 'AbortError';
        service.health = {
          ok: false,
          status: timedOut ? 'timeout' : 'network-error',
          message: timedOut
            ? 'Supabase health check timed out.'
            : `Supabase could not be reached: ${err?.message || 'network error'}`
        };
        return service.health;
      } finally {
        clearTimeout(timeout);
      }
    }
  };

  window.LegendSupabaseV09x = service;
  service.checkHealth().catch(() => {});
})();
