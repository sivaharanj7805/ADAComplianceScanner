'use server';

import { createClient } from '@/lib/supabase/server';
import {
  generateScanShareToken,
  revokeScanShareToken,
} from '@/lib/supabase/queries';

export async function toggleShareToken(
  scanId: string,
  currentlyShared: boolean
): Promise<{ token: string | null; error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { token: null, error: 'Authentication required' };
  }

  if (currentlyShared) {
    // Revoke the share token
    const { error } = await revokeScanShareToken(scanId, user.id);
    if (error) {
      return { token: null, error };
    }
    return { token: null, error: null };
  }

  // Generate a new share token
  const { data: token, error } = await generateScanShareToken(scanId, user.id);
  if (error) {
    return { token: null, error };
  }

  return { token, error: null };
}
