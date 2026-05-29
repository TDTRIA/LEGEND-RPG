// LEGEND: Roads of Ashmere v0.9.x - Enhanced Account/Profile System with Supabase wiring
(() => {
  const root = () => document.getElementById('root');
  const S = window.LegendStorage || {};

  // Supabase placeholder setup
  window.LegendSupabaseV09x = window.LegendSupabaseV09x || { client: null, connected: false };

  window.LegendAccountV09x = {
    getProfile() {
      return S.loadPlayer?.() || null;
    },

    createProfile(username){
      const player = { username: username || 'Traveler', day: 1, inventory: {}, className: 'Traveler', town: 'Ashmere', townTrust: {Ashmere:0}, roadDanger:1 };
      S.savePlayer?.(player);
      return player;
    },

    deleteProfile(){
      if(confirm('Delete local save?')){
        S.deleteSaves?.();
        root().innerHTML = '<p>Profile deleted. Refresh to start a new traveler.</p>';
      }
    },

    connectSupabase(url, key){
      if(!window.LegendSupabaseV09x) window.LegendSupabaseV09x = {};
      window.LegendSupabaseV09x.client = { url, key }; // placeholder
      window.LegendSupabaseV09x.connected = true;
      alert('Supabase client connected (placeholder). Cloud save ready when implemented).');
    },

    renderAccount(){
      const prof = this.getProfile();
      const supa = window.LegendSupabaseV09x;
      root().innerHTML = `
        <main class="account09x">
          <div class="account09x-wrap">
            <section class="account09x-hero" style="background:linear-gradient(135deg, rgba(0,0,0,0.7), rgba(8,13,10,0.7)); padding:16px; border-radius:18px; box-shadow:0 8px 28px rgba(0,0,0,0.6);">
              <div class="account09x-hero-content">
                <div class="account09x-kicker">Traveler Profile</div>
                <h1>${prof ? prof.username : 'Guest Access'}</h1>
                ${prof ? `<p>Class: <strong>${prof.className}</strong></p>
                          <p>Day: <strong>${prof.day}</strong></p>
                          <p>Town: <strong>${prof.town}</strong></p>` : '<p>No profile loaded</p>'}
                <p>Cloud Status: <strong>${supa.connected ? 'Connected' : 'Offline'}</strong></p>
              </div>
            </section>
            <div class="account09x-actions" style="display:grid; gap:10px; margin-top:14px;">
              ${prof ? '<button class="account09x-btn danger" id="deleteProfile">Delete Profile</button>' : ''}
              <button class="account09x-btn primary" id="createProfile">Create New Traveler</button>
              ${!supa.connected ? '<button class="account09x-btn" id="connectSupa">Connect Cloud (Supabase)</button>' : ''}
              <button class="account09x-btn" id="backTitle">Back to Realm Portal</button>
            </div>
          </div>
        </main>`;

      if(prof) document.getElementById('deleteProfile').onclick = () => this.deleteProfile();
      document.getElementById('createProfile').onclick = () => {
        const name = prompt('Enter traveler name:','Traveler');
        if(name) {
          this.createProfile(name);
          this.renderAccount();
        }
      };
      const connectBtn = document.getElementById('connectSupa');
      if(connectBtn) connectBtn.onclick = () => {
        const url = prompt('Enter Supabase URL (placeholder)','https://xyz.supabase.co');
        const key = prompt('Enter Supabase Key (placeholder)','public-anon-key');
        this.connectSupabase(url,key);
        this.renderAccount();
      };
      document.getElementById('backTitle').onclick = () => window.LegendGameBootstrap.title();
    }
  };
})();
