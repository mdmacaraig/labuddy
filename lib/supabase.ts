import 'react-native-url-polyfill/auto'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ibvnspakkkkwnubhofkf.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlidm5zcGFra2trd251YmhvZmtmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTU0MzA3NjQsImV4cCI6MjAzMTAwNjc2NH0.SOuRvYjND9_nmYQJdGnnA0NTpSmGDmPdd25IaUPFChk'

const supabase = createClient(supabaseUrl, supabaseAnonKey)
export default supabase