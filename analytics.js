// --- REAL-TIME UNIQUE VISITOR & ANALYTICS TRACKER ---
// Tracks Unique Visitors, Total Page Visits, and CV Downloads in Supabase Cloud DB

(function() {
    const SUPABASE_URL = "https://uwboeqkiwncdtarqvxbo.supabase.co/rest/v1";
    const SUPABASE_KEY = "sb_publishable_a5_YHH1N5U0goK4rRks_OA_Lr-JBSjH";

    async function trackVisit() {
        let visitorId = localStorage.getItem('reb_visitor_id');
        let isNewVisitor = false;

        if (!visitorId) {
            visitorId = 'visitor_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
            localStorage.setItem('reb_visitor_id', visitorId);
            isNewVisitor = true;
        }

        // 1. Local Cache Update
        let localStats = JSON.parse(localStorage.getItem('reb_site_analytics') || '{"unique_visitors":1,"total_visits":1,"cv_downloads":0}');
        localStats.total_visits = (localStats.total_visits || 0) + 1;
        if (isNewVisitor) {
            localStats.unique_visitors = (localStats.unique_visitors || 0) + 1;
        }
        localStorage.setItem('reb_site_analytics', JSON.stringify(localStats));

        // 2. Supabase Cloud DB Update
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000);
            const res = await fetch(`${SUPABASE_URL}/site_analytics?id=eq.1`, {
                headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` },
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data) && data.length > 0) {
                    const row = data[0];
                    const newTotal = (row.total_visits || 0) + 1;
                    const newUnique = (row.unique_visitors || 0) + (isNewVisitor ? 1 : 0);

                    await fetch(`${SUPABASE_URL}/site_analytics?id=eq.1`, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json',
                            'apikey': SUPABASE_KEY,
                            'Authorization': `Bearer ${SUPABASE_KEY}`
                        },
                        body: JSON.stringify({ total_visits: newTotal, unique_visitors: newUnique })
                    });
                } else {
                    // Initialize analytics row if not exists
                    await fetch(`${SUPABASE_URL}/site_analytics`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'apikey': SUPABASE_KEY,
                            'Authorization': `Bearer ${SUPABASE_KEY}`
                        },
                        body: JSON.stringify({ id: 1, total_visits: 1, unique_visitors: 1, cv_downloads: 0 })
                    });
                }
            }
        } catch (e) {}
    }

    // Global CV Download Counter
    window.trackCvDownload = async function() {
        let localStats = JSON.parse(localStorage.getItem('reb_site_analytics') || '{"unique_visitors":1,"total_visits":1,"cv_downloads":0}');
        localStats.cv_downloads = (localStats.cv_downloads || 0) + 1;
        localStorage.setItem('reb_site_analytics', JSON.stringify(localStats));

        try {
            const res = await fetch(`${SUPABASE_URL}/site_analytics?id=eq.1`, {
                headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
            });
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data) && data.length > 0) {
                    const row = data[0];
                    await fetch(`${SUPABASE_URL}/site_analytics?id=eq.1`, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json',
                            'apikey': SUPABASE_KEY,
                            'Authorization': `Bearer ${SUPABASE_KEY}`
                        },
                        body: JSON.stringify({ cv_downloads: (row.cv_downloads || 0) + 1 })
                    });
                }
            }
        } catch (e) {}
    };

    document.addEventListener('DOMContentLoaded', trackVisit);
})();
