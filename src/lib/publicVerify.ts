import { supabase } from "./supabaseClient";

export interface VerificationResult {
    ok: boolean;
    data?: {
        policyNo: string;
        policyType: string;
        insuredName: string;
        startsAt: string;
        endsAt: string;
        status: string;
        pdfSignedUrl: string | null;
        pdf_path?: string;
    };
    error?: string;
}

/**
 * Calls a Supabase RPC function to verify a policy safely.
 * Logic:
 * 1. Checks if code is a valid QR token or Policy Number via RPC.
 */
export async function publicVerifyPolicy(code: string): Promise<VerificationResult> {
    const cleanCode = code.trim();
    console.log(`[Verify] Starting search for: "${cleanCode}"`);
    console.log(`[Verify] API URL: ${import.meta.env.VITE_SUPABASE_URL}`);

    try {
        const { data, error, status } = await supabase.rpc('public_verify_policy', {
            search_code: cleanCode
        });

        if (error) {
            console.error(`[Verify] Supabase RPC Error (Status: ${status}):`, error);

            // Map common error codes
            if (status === 404) throw new Error("not_found");
            if (status === 401 || status === 403) throw new Error("unauthorized");

            throw new Error(`RPC_FAILED: ${error.message}`);
        }

        const result = data as VerificationResult;
        console.log("[Verify] Result received:", result);

        if (result.ok && result.data?.pdf_path) {
            console.log("[Verify] Document found, generating PDF link for:", result.data.pdf_path);
            try {
                const { data: signedData, error: signedError } = await supabase
                    .storage
                    .from('policy-pdfs')
                    .createSignedUrl(result.data.pdf_path, 3600);

                if (!signedError && signedData) {
                    result.data.pdfSignedUrl = signedData.signedUrl;
                } else {
                    console.warn("[Verify] Signed URL failed, using public link");
                    const { data: publicData } = supabase
                        .storage
                        .from('policy-pdfs')
                        .getPublicUrl(result.data.pdf_path);
                    result.data.pdfSignedUrl = publicData.publicUrl;
                }
            } catch (e) {
                console.error("[Verify] Storage error:", e);
            }
        }

        return result;
    } catch (err: any) {
        console.error("[Verify] Critical network or execution error:", err);
        throw err;
    }
}
