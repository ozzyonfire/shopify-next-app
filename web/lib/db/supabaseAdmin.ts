import { createClient } from "@supabase/supabase-js";

const supabaseUrl: string = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey: string =
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!;

export const supabse = createClient(supabaseUrl, supabaseServiceKey);
