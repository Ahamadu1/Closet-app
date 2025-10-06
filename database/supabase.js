import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://filfwbrxszmfjplzfbsj.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpbGZ3YnJ4c3ptZmpwbHpmYnNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3MzI0NDcsImV4cCI6MjA3NDMwODQ0N30.XIpY5EyDJGA-n4VOPT-dJh4lcRW4dge78uj3HadTUds'

// Pass AsyncStorage for React Native
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, 
  },
})
