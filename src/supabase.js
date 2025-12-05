import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bkwnptvmmzfqwasvjvaa.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJrd25wdHZtbXpmcXdhc3ZqdmFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4Mzk2MjMsImV4cCI6MjA4MDQxNTYyM30.Su9OSrStSVIbqV3_f8TnJmRRhF8a4OfCbWs1ojd2K9Q';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);