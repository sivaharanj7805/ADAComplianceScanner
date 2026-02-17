import { createClient } from './server';

const AGENCY_LOGOS_BUCKET = 'agency-logos';

/**
 * Upload an agency logo to Supabase Storage.
 * Stores in the `agency-logos` bucket under `{userId}/logo.{ext}`.
 * Returns the public URL on success.
 */
export async function uploadAgencyLogo(
  userId: string,
  file: File
): Promise<{ data: { url: string; path: string } | null; error: string | null }> {
  const supabase = await createClient();

  // Validate file type
  const allowedTypes = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return {
      data: null,
      error: 'Invalid file type. Allowed: PNG, JPEG, SVG, WebP',
    };
  }

  // Validate file size (max 2MB)
  const maxSize = 2 * 1024 * 1024;
  if (file.size > maxSize) {
    return { data: null, error: 'File too large. Maximum size is 2MB' };
  }

  // Determine file extension
  const extMap: Record<string, string> = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/svg+xml': 'svg',
    'image/webp': 'webp',
  };
  const ext = extMap[file.type] ?? 'png';
  const filePath = `${userId}/logo.${ext}`;

  // Upload (upsert to replace any existing logo)
  const { error: uploadError } = await supabase.storage
    .from(AGENCY_LOGOS_BUCKET)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
      contentType: file.type,
    });

  if (uploadError) {
    return { data: null, error: uploadError.message };
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from(AGENCY_LOGOS_BUCKET)
    .getPublicUrl(filePath);

  return {
    data: { url: urlData.publicUrl, path: filePath },
    error: null,
  };
}

/**
 * Get a signed URL for an agency logo.
 * Useful when the bucket is private.
 * Returns a URL valid for 1 hour.
 */
export async function getAgencyLogoUrl(
  path: string
): Promise<{ data: string | null; error: string | null }> {
  const supabase = await createClient();

  const { data, error } = await supabase.storage
    .from(AGENCY_LOGOS_BUCKET)
    .createSignedUrl(path, 3600); // 1 hour

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: data.signedUrl, error: null };
}

/**
 * Delete an agency logo from Supabase Storage.
 */
export async function deleteAgencyLogo(
  path: string
): Promise<{ error: string | null }> {
  const supabase = await createClient();

  const { error } = await supabase.storage
    .from(AGENCY_LOGOS_BUCKET)
    .remove([path]);

  if (error) {
    return { error: error.message };
  }

  return { error: null };
}
