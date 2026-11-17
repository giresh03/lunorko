# Architecture rules
- Keep purchase and coupon price resolution in the shared edge-function pricing module, imported by checkout and verification; the server controls the amount and the UI only previews it.
- Subscription activation records the server-created order amount, preserving the purchased domain and credit allowance, so discounts do not change entitlements.
- Internship program purchases use a separate purchase type and private records keyed by unique Razorpay order/payment references; verified program payments never activate subscriptions or grant AI credits.
- Germany program information pages share one content module and reuse the existing program checkout; this prevents page-specific payment flows and inconsistent program facts.