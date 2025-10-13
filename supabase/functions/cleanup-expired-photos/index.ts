import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.47.10'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Starting cleanup of expired photos...');

    // Delete photos that are older than 5 minutes
    const fiveMinutesAgo = new Date();
    fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5);

    const { data: expiredPhotos, error: selectError } = await supabase
      .from('saved_photos')
      .select('id')
      .lt('created_at', fiveMinutesAgo.toISOString());

    if (selectError) {
      console.error('Error selecting expired photos:', selectError);
      throw selectError;
    }

    if (expiredPhotos && expiredPhotos.length > 0) {
      console.log(`Found ${expiredPhotos.length} expired photos to delete`);

      const { error: deleteError } = await supabase
        .from('saved_photos')
        .delete()
        .lt('created_at', fiveMinutesAgo.toISOString());

      if (deleteError) {
        console.error('Error deleting expired photos:', deleteError);
        throw deleteError;
      }

      console.log(`Successfully deleted ${expiredPhotos.length} expired photos`);

      return new Response(
        JSON.stringify({
          success: true,
          deleted_count: expiredPhotos.length,
          message: `Deleted ${expiredPhotos.length} expired photos`
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    } else {
      console.log('No expired photos found');
      return new Response(
        JSON.stringify({
          success: true,
          deleted_count: 0,
          message: 'No expired photos found'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

  } catch (error) {
    console.error('Error in cleanup function:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});