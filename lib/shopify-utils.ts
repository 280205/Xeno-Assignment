import crypto from 'crypto'

export function verifyShopifyWebhook(
  body: string,
  hmacHeader: string,
  secret: string
): boolean {
  const hash = crypto
    .createHmac('sha256', secret)
    .update(body, 'utf8')
    .digest('base64')
  
  return hash === hmacHeader
}

export function extractShopifyDomain(shop: string): string {
  // Remove protocol and trailing slashes
  return shop.replace(/^https?:\/\//, '').replace(/\/$/, '')
}
