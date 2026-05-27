// LEGEND: Roads of Ashmere v0.9.x - Supabase client config
// Public anon key is safe in frontend code. Never commit the service role key.
(() => {
  const SUPABASE_URL = 'https://ewmygiawtlxxixsubvct.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3bXlnaWF3dGx4eGl4c3VidmN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5MTMzOTgsImV4cCI6MjA5NTQ4OTM5OH0.vBigbjVZpEgZNdQjhmmWzqt2NxYGOsZmfLoGP34br0Y';

  if(!window.supabase || !window.supabase.createClient){
    console.warn('Supabase library did not load. Account features are disabled.');
    window.LegendSupabaseV09x = { client:null, url:SUPABASE_URL, ready:false };
    return;
  }

  const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  });

  window.LegendSupabaseV09x = { client, url:SUPABASE_URL, ready:true };
})();
