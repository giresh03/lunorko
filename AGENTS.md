# Architecture rules
- Keep purchase and coupon price resolution in the shared edge-function pricing module, imported by checkout and verification; the server controls the amount and the UI only previews it.
- Subscription activation records the server-created order amount, preserving the purchased domain and credit allowance, so discounts do not change entitlements.