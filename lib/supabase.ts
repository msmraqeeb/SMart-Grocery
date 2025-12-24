
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

const supabaseUrl = 'https://dnaziaddhwmqalwrdgex.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRuYXppYWRkaHdtcWFsd3JkZ2V4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5NzcyMDQsImV4cCI6MjA4MTU1MzIwNH0.aWWmXvC9AydvBzeb-LjZ-v40VE-gn65E5DSzA8lfXfI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
