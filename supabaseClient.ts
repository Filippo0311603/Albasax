import { createClient } from '@supabase/supabase-js';

// NOTA PER L'UTENTE:
// Per far funzionare il login, devi creare un account su https://supabase.com
// Una volta creato il progetto, copia l'URL e la KEY nelle variabili qui sotto
// oppure meglio ancora nel file .env

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
