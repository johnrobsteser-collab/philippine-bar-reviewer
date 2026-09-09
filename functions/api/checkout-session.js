// Cloudflare Pages Function: /api/checkout-session
// Handles dynamic pricing and session tokens without leaking sensitive BPI or private wallet keys.

export async function onRequestGet(context) {
    try {
        // Current real-time rates (in production can also fetch from CoinGecko / CEXHybrid oracle)
        const USD_PHP_RATE = 57.00;
        const NCH_USD_PRICE = 0.15; // ~$0.15 USD per NCH
        const NCH_PHP_PRICE = NCH_USD_PRICE * USD_PHP_RATE; // ~₱8.55 per NCH

        const PRICE_PHP_STANDARD = 1999;
        const PRICE_PHP_NCH = 1499; // ₱500 discount (25% OFF)

        const usdtAmount = (PRICE_PHP_STANDARD / USD_PHP_RATE).toFixed(2); // ~35.07 USDT
        const nchAmount = Math.ceil(PRICE_PHP_NCH / NCH_PHP_PRICE);        // ~176 NCH

        // Generate dynamic payment reference code for BPI / Bank deposit
        const randomRefSuffix = Math.floor(1000 + Math.random() * 9000);
        const dynamicBankRef = `BAR26-BPI-${randomRefSuffix}`;

        // Return session data with MASKED recipient details for public safety
        return new Response(JSON.stringify({
            success: true,
            season: "Philippine Bar Examinations 2026 Master Pass",
            pricing: {
                standardPHP: PRICE_PHP_STANDARD,
                discountedPHP: PRICE_PHP_NCH,
                discountPercent: 25,
                usdt: parseFloat(usdtAmount),
                nch: nchAmount,
                exchangeRates: {
                    usdPhp: USD_PHP_RATE,
                    nchUsd: NCH_USD_PRICE,
                    nchPhp: parseFloat(NCH_PHP_PRICE.toFixed(2))
                }
            },
            destinations: {
                // Masked for privacy in public API responses
                bpiReference: dynamicBankRef,
                bpiBankName: "Bank of the Philippine Islands (BPI)",
                bpiAccountName: "LexJuris Bar Review / CHEESE Org",
                bpiMaskedNumber: "8129-****-16",
                cryptoNetwork: "Cheese Blockchain / BSC",
                cryptoMaskedWallet: "0x7e73...EDA56D",
                cexhybridBuyUrl: "https://cexhybrid.io/trade/NCH:USDT"
            }
        }), {
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            }
        });
    } catch (err) {
        return new Response(JSON.stringify({ success: false, error: err.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}
