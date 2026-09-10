import { getSupabase } from '../supabase/client';

export const storageService = {
  async uploadPropertyPhoto(file: File, propertyId: string = 'general'): Promise<string> {
    return this.uploadPropertyImage(file, propertyId);
  },

  async uploadPropertyImage(file: File, propertyId: string): Promise<string> {
    const supabase = getSupabase();
    const fileExt = file.name.split('.').pop() || 'jpg';
    const fileName = `${propertyId}/${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;

    if (supabase) {
      try {
        const { data, error } = await supabase.storage
          .from('property-photos')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false,
          });

        if (error) {
          console.warn('Supabase storage upload error, fallback to local URL:', error.message);
          // Fallback to local DataURL if bucket is not created or permissions error
          return await fileToDataUrl(file);
        }

        const { data: publicUrlData } = supabase.storage
          .from('property-photos')
          .getPublicUrl(data.path);

        return publicUrlData.publicUrl;
      } catch (err) {
        console.warn('Storage exception, fallback to local:', err);
        return await fileToDataUrl(file);
      }
    }

    // Local Base64 storage
    return await fileToDataUrl(file);
  },
};

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
