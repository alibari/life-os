import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        const { data } = await req.json()
        const metrics = data?.metrics

        if (!metrics || !Array.isArray(metrics)) {
            throw new Error('Invalid payload structure: missing metrics array')
        }

        const records = []

        // Helper to parse "2025-09-23 6:12:00 PM +0200"
        const parseDate = (dateStr: string) => {
            // Using Deno/JS native Date parsing which handles many formats, 
            // but standardized ISO or specifically handling the input might be safer.
            // The incoming format is reasonably standard for Date() constructor in V8/Deno.
            return new Date(dateStr).toISOString()
        }

        for (const metric of metrics) {
            const { name, units, data: points } = metric

            if (!points) continue;

            for (const point of points) {
                records.push({
                    metric_name: name,
                    unit: units,
                    value: point.qty,
                    source: point.source,
                    recorded_at: parseDate(point.date)
                })
            }
        }

        // Batch insert in chunks of 100
        const chunkSize = 100
        let insertedCount = 0

        for (let i = 0; i < records.length; i += chunkSize) {
            const chunk = records.slice(i, i + chunkSize)
            const { error } = await supabase.from('health_metrics').upsert(chunk)

            if (error) {
                console.error('Error inserting chunk:', error)
                throw error
            }
            insertedCount += chunk.length
        }

        return new Response(
            JSON.stringify({ message: `Successfully ingested ${insertedCount} metrics` }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})
