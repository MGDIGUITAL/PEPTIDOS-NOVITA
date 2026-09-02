import { createClient } from '@supabase/supabase-js';

// ─── Browser Client (anon key — safe for frontend) ───────────────────────
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.PUBLIC_SUPABASE_URL || 'https://qrhspijmfimjxemravyz.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyaHNwaWptZmltanhlbXJhdnl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc1MTQ2MjYsImV4cCI6MjEwMzA5MDYyNn0.w7ojREp9avzwYRqu4Omi4vQ9GzgELEFvt0Z51ZuI2iQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
