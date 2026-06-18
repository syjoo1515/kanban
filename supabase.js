import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL      = 'https://ztoxcwkonwdmxmeiieyb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0b3hjd2tvbndkbXhtZWlpZXliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3MTkzNzMsImV4cCI6MjA5NzI5NTM3M30.8TodwyxU4zuMFpYV0SvbO0l9aYn8gQcW5CPcpGejdlw';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
