// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS'
}

serve(async (req: Request) => {
    // Handle CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    const url = new URL(req.url);
    const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    try {
        let code = "";
        let isDownloadRequest = false;

        // 1. Parse Input (support POST body or GET query params)
        if (req.method === 'POST') {
            const body = await req.json().catch(() => ({}));
            code = body.code || body.policyNumber || body.token;
            isDownloadRequest = body.download === true;
        } else {
            code = url.searchParams.get("policyNumber") || url.searchParams.get("policy") || url.searchParams.get("token") || url.searchParams.get("code");
            isDownloadRequest = url.searchParams.get("download") === "true" || url.pathname.endsWith("/pdf");
        }

        if (!code) {
            return new Response(
                JSON.stringify({ ok: false, message: 'code_required' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
            )
        }

        // 2. Simple Rate Limiting (Informal)
        // In a real production app, we would check a 'rate_limits' table here.
        // For now, we'll log the request to a public_access_logs table if it exists.
        try {
            await supabaseAdmin.from('public_access_logs').insert({
                path: url.pathname,
                query: code.substring(0, 50),
                ip: req.headers.get('x-forwarded-for') || 'unknown'
            });
        } catch (e) {
            // Silently fail if table doesn't exist
        }

        // 3. Find Policy
        let policyId = null;

        // Try as Token first
        const { data: tokenData } = await supabaseAdmin
            .from('qr_tokens')
            .select('policy_id')
            .eq('token', code)
            .eq('is_public', true)
            .single()

        if (tokenData) {
            policyId = tokenData.policy_id;
        } else {
            // Try as Policy Number
            const { data: policyDataNo } = await supabaseAdmin
                .from('policies')
                .select('id')
                .eq('policy_no', code)
                .single()

            policyId = policyDataNo?.id;
        }

        if (!policyId) {
            return new Response(
                JSON.stringify({ ok: false, message: 'not_found' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
            )
        }

        // 4. Fetch Safe Details
        const { data: policy, error: policyError } = await supabaseAdmin
            .from('policies')
            .select('policy_no, policy_type, insured_name, starts_at, ends_at, status, pdf_path')
            .eq('id', policyId)
            .single()

        if (policyError || !policy) {
            return new Response(
                JSON.stringify({ ok: false, message: 'error_fetching_policy' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
            )
        }

        // 5. PDF Handling
        let signedUrl = null
        if (policy.pdf_path) {
            const { data: signedUrlData } = await supabaseAdmin
                .storage
                .from('policy-pdfs')
                .createSignedUrl(policy.pdf_path, 300) // 5 minutes expiry

            signedUrl = signedUrlData?.signedUrl
        }

        // If it was a download request, we can redirect or return the URL
        if (isDownloadRequest && signedUrl) {
            return new Response(null, {
                status: 302,
                headers: { ...corsHeaders, 'Location': signedUrl }
            });
        }

        // Standard Response
        return new Response(
            JSON.stringify({
                ok: true,
                data: {
                    policyNo: policy.policy_no,
                    policyType: policy.policy_type,
                    insuredName: policy.insured_name,
                    startsAt: policy.starts_at,
                    endsAt: policy.ends_at,
                    status: policy.status,
                    pdfSignedUrl: signedUrl
                }
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )

    } catch (error: any) {
        return new Response(
            JSON.stringify({ ok: false, message: error.message || 'Unknown error' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
    }
})
