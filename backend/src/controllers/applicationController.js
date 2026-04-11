const { supabase } = require('../config/supabaseClient');

const createApplication = async (req, res) => {
  try {
    const { user_id, scheme_id, status = 'Submitted' } = req.body;
    
    console.log('Creating application:', { user_id, scheme_id, status });

    if (!user_id || !scheme_id) {
      return res.status(400).json({ error: 'user_id and scheme_id are required' });
    }

    // Removing parseInt as IDs might be UUID strings
    const { data, error } = await supabase
      .from('applications')
      .insert([{ 
        user_id, 
        scheme_id, 
        status 
      }])
      .select();

    if (error) {
      console.error('Supabase insertion error:', error);
      throw error;
    }

    console.log('Application created successfully:', data[0]);
    res.status(201).json(data[0]);
  } catch (error) {
    console.error('Error creating application:', error.message);
    res.status(500).json({ error: error.message });
  }
};

const getApplicationsByUser = async (req, res) => {
  try {
    const { user_id } = req.params;
    console.log(`[Sync] Fetching apps for user: ${user_id}`);

    const { data: apps, error: appError } = await supabase
      .from('applications')
      .select('*')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false });

    if (appError) throw appError;

    const { data: allSchemes, error: schemeError } = await supabase
      .from('schemes')
      .select('*');

    if (schemeError) throw schemeError;

    // Build a standardized map
    const schemeMap = {};
    allSchemes.forEach(s => {
      schemeMap[String(s.id).toLowerCase()] = s;
    });

    const mapped = apps.map(app => {
      const sid = String(app.scheme_id || '').toLowerCase();
      const match = schemeMap[sid] || null;
      
      return { 
        ...app, 
        scheme: match,
        schemeName: match?.scheme_name || 'Processing Scheme...',
        _sync_debug: { targetSid: sid, found: !!match }
      };
    });

    console.log(`[Sync] Completed merge for ${mapped.length} records.`);
    res.status(200).json(mapped);
  } catch (error) {
    console.error('[Sync] Critical Error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const validStatuses = ['draft', 'submitted', 'approved', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const { data, error } = await supabase
      .from('applications')
      .update({ status })
      .eq('id', id)
      .select();

    if (error) throw error;
    if (!data || data.length === 0) return res.status(404).json({ error: 'Application not found' });

    res.status(200).json(data[0]);
  } catch (error) {
    console.error('Error updating application:', error.message);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createApplication,
  getApplicationsByUser,
  updateApplicationStatus,
};
