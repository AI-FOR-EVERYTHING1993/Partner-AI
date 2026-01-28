# Payment Gateway Technical Specifications

## Overview
This document outlines the technical requirements for implementing payment processing and subscription management in the Partner AI platform.

## Payment Architecture

### 1. Payment Provider Integration

#### Primary: Stripe Integration
```typescript
// Required Stripe Products
- Stripe Checkout (one-time payments)
- Stripe Billing (subscription management)
- Stripe Connect (future marketplace features)
- Stripe Webhooks (event handling)

// Implementation Requirements
- PCI DSS compliance through Stripe
- 3D Secure authentication support
- Multiple currency support (USD primary)
- Mobile-optimized payment flows
```

#### Backup: PayPal Integration
```typescript
// Fallback Payment Method
- PayPal Express Checkout
- PayPal Subscriptions API
- PayPal Webhooks
- Guest checkout support
```

### 2. Pricing Model Implementation

#### Tier Structure
```typescript
interface PricingTier {
  id: string
  name: 'beginner' | 'mid_level' | 'expert'
  price: number // in cents
  duration_hours: 24
  features: string[]
  target_experience: string
  stripe_price_id: string
}

const PRICING_TIERS: PricingTier[] = [
  {
    id: 'beginner',
    name: 'beginner',
    price: 299, // $2.99
    duration_hours: 24,
    features: [
      'Entry-level focused questions',
      'Basic behavioral interviews',
      'Resume optimization tips',
      'Confidence building exercises'
    ],
    target_experience: '0-2 years',
    stripe_price_id: 'price_beginner_24h'
  },
  {
    id: 'mid_level',
    name: 'mid_level',
    price: 799, // $7.99
    duration_hours: 24,
    features: [
      'Advanced technical scenarios',
      'Leadership & teamwork questions',
      'Salary negotiation strategies',
      'Industry-specific deep dives',
      'Performance review prep'
    ],
    target_experience: '3-6 years',
    stripe_price_id: 'price_mid_level_24h'
  },
  {
    id: 'expert',
    name: 'expert',
    price: 1900, // $19.00
    duration_hours: 24,
    features: [
      'C-suite & executive interviews',
      'Strategic thinking assessments',
      'Board presentation practice',
      'Crisis management scenarios',
      'Executive presence coaching',
      'Priority support & feedback'
    ],
    target_experience: '6+ years',
    stripe_price_id: 'price_expert_24h'
  }
]
```

### 3. Access Control System

#### Time-Based Access Management
```typescript
interface UserAccess {
  user_id: string
  tier: 'beginner' | 'mid_level' | 'expert'
  purchase_date: Date
  expiry_date: Date
  access_granted: boolean
  sessions_used: number
  payment_id: string
  stripe_payment_intent_id: string
}

class AccessManager {
  async grantAccess(userId: string, tier: string, paymentId: string): Promise<UserAccess>
  async checkAccess(userId: string): Promise<boolean>
  async revokeExpiredAccess(): Promise<void>
  async extendAccess(userId: string, additionalHours: number): Promise<UserAccess>
}
```

#### Feature Access Control
```typescript
interface FeatureAccess {
  basic_interview: boolean
  voice_practice: boolean
  resume_analysis: boolean
  advanced_feedback: boolean
  industry_specific: boolean
  priority_support: boolean
}

const TIER_FEATURES: Record<string, FeatureAccess> = {
  beginner: {
    basic_interview: true,
    voice_practice: true,
    resume_analysis: true,
    advanced_feedback: false,
    industry_specific: false,
    priority_support: false
  },
  mid_level: {
    basic_interview: true,
    voice_practice: true,
    resume_analysis: true,
    advanced_feedback: true,
    industry_specific: true,
    priority_support: false
  },
  expert: {
    basic_interview: true,
    voice_practice: true,
    resume_analysis: true,
    advanced_feedback: true,
    industry_specific: true,
    priority_support: true
  }
}
```

## API Endpoints Required

### 1. Payment Processing
```typescript
// Create Payment Intent
POST /api/payments/create-intent
{
  tier: 'beginner' | 'mid_level' | 'expert',
  user_id: string,
  return_url?: string
}
Response: {
  client_secret: string,
  payment_intent_id: string,
  amount: number
}

// Confirm Payment
POST /api/payments/confirm
{
  payment_intent_id: string,
  user_id: string
}
Response: {
  success: boolean,
  access_granted: UserAccess,
  error?: string
}
```

### 2. Access Management
```typescript
// Check User Access
GET /api/access/check/{user_id}
Response: {
  has_access: boolean,
  current_tier?: string,
  expiry_date?: Date,
  features: FeatureAccess
}

// Get Purchase History
GET /api/payments/history/{user_id}
Response: {
  purchases: Purchase[],
  total_spent: number,
  active_access?: UserAccess
}
```

### 3. Webhook Handlers
```typescript
// Stripe Webhook Handler
POST /api/webhooks/stripe
{
  // Stripe webhook payload
}

// Handle Events:
- payment_intent.succeeded
- payment_intent.payment_failed
- charge.dispute.created
- invoice.payment_succeeded
- customer.subscription.deleted
```

## Database Schema

### 1. User Payments
```sql
CREATE TABLE user_payments (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  stripe_payment_intent_id VARCHAR(255) UNIQUE,
  stripe_charge_id VARCHAR(255),
  amount INTEGER NOT NULL, -- in cents
  currency VARCHAR(3) DEFAULT 'USD',
  tier VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL, -- pending, succeeded, failed, refunded
  payment_method_type VARCHAR(50), -- card, paypal, etc.
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 2. User Access
```sql
CREATE TABLE user_access (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  payment_id UUID REFERENCES user_payments(id),
  tier VARCHAR(50) NOT NULL,
  granted_at TIMESTAMP NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  sessions_used INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for efficient access checks
CREATE INDEX idx_user_access_active ON user_access(user_id, is_active, expires_at);
```

### 3. Payment Events
```sql
CREATE TABLE payment_events (
  id UUID PRIMARY KEY,
  payment_id UUID REFERENCES user_payments(id),
  event_type VARCHAR(100) NOT NULL,
  stripe_event_id VARCHAR(255),
  event_data JSONB,
  processed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Security Requirements

### 1. PCI Compliance
```typescript
// Security Measures
- Never store credit card data
- Use Stripe's secure tokenization
- Implement HTTPS everywhere
- Validate all webhook signatures
- Log all payment events securely
```

### 2. Fraud Prevention
```typescript
interface FraudCheck {
  user_id: string
  ip_address: string
  payment_amount: number
  payment_frequency: number
  risk_score: number
}

// Implement rate limiting
- Max 3 payment attempts per hour per user
- Max 5 payment attempts per hour per IP
- Flag suspicious patterns for manual review
```

### 3. Data Protection
```typescript
// Privacy Requirements
- Encrypt sensitive payment data
- Implement data retention policies
- GDPR compliance for EU users
- PCI DSS Level 1 compliance through Stripe
```

## Payment Flow Implementation

### 1. Frontend Payment Flow
```typescript
// Payment Component Structure
interface PaymentFlow {
  step: 'select_tier' | 'payment_details' | 'processing' | 'confirmation'
  selected_tier: PricingTier
  payment_method: 'card' | 'paypal'
  client_secret: string
}

// Required UI Components
- Tier selection cards
- Stripe Elements integration
- PayPal button integration
- Loading states and error handling
- Success confirmation page
```

### 2. Backend Payment Processing
```typescript
class PaymentProcessor {
  async createPaymentIntent(tier: string, userId: string): Promise<PaymentIntent>
  async confirmPayment(paymentIntentId: string, userId: string): Promise<UserAccess>
  async handleWebhook(event: StripeEvent): Promise<void>
  async processRefund(paymentId: string, reason: string): Promise<Refund>
}
```

### 3. Access Validation Middleware
```typescript
// Middleware for protected routes
async function validateAccess(req: Request, res: Response, next: NextFunction) {
  const userId = req.user.id
  const access = await AccessManager.checkAccess(userId)
  
  if (!access.has_access) {
    return res.status(403).json({ error: 'Access expired or not purchased' })
  }
  
  req.userAccess = access
  next()
}
```

## Error Handling & Recovery

### 1. Payment Failures
```typescript
interface PaymentError {
  code: string
  message: string
  recovery_action: 'retry' | 'contact_support' | 'try_different_method'
}

// Common Error Scenarios
- Insufficient funds
- Card declined
- Authentication required
- Network timeouts
- Webhook delivery failures
```

### 2. Access Recovery
```typescript
// Handle edge cases
- Payment succeeded but access not granted
- Webhook delivery failures
- Database inconsistencies
- User account issues

// Recovery Mechanisms
- Automatic retry logic
- Manual reconciliation tools
- Customer support override capabilities
- Audit trail for all actions
```

## Testing Requirements

### 1. Payment Testing
```typescript
// Test Scenarios
- Successful payments for all tiers
- Failed payment handling
- Webhook event processing
- Access expiration logic
- Refund processing
- Edge case scenarios

// Test Cards (Stripe)
- 4242424242424242 (Success)
- 4000000000000002 (Declined)
- 4000000000009995 (Insufficient funds)
```

### 2. Load Testing
```typescript
// Performance Requirements
- Handle 100+ concurrent payments
- Process webhooks within 30 seconds
- Access checks under 100ms
- Payment intent creation under 2 seconds
```

## Monitoring & Analytics

### 1. Payment Metrics
```typescript
// Key Metrics to Track
- Conversion rate by tier
- Payment success/failure rates
- Average revenue per user
- Churn and retention rates
- Refund rates and reasons
```

### 2. Business Intelligence
```typescript
// Analytics Dashboard
- Daily/monthly revenue
- Tier popularity analysis
- User lifetime value
- Payment method preferences
- Geographic revenue distribution
```

## Compliance & Legal

### 1. Terms of Service
```typescript
// Required Legal Elements
- Clear pricing and billing terms
- Refund and cancellation policy
- Data usage and privacy policy
- Dispute resolution process
- Service availability disclaimers
```

### 2. Regulatory Compliance
```typescript
// Compliance Requirements
- PCI DSS (Payment Card Industry)
- GDPR (EU users)
- CCPA (California users)
- SOX (if publicly traded)
- Local tax regulations
```

## Development Timeline

### Phase 1 (Week 1): Basic Integration
- [ ] Stripe account setup and configuration
- [ ] Basic payment intent creation
- [ ] Frontend payment form
- [ ] Database schema implementation

### Phase 2 (Week 2): Core Features
- [ ] Access control system
- [ ] Webhook handling
- [ ] Payment confirmation flow
- [ ] Error handling and recovery

### Phase 3 (Week 3): Advanced Features
- [ ] PayPal integration (backup)
- [ ] Fraud prevention measures
- [ ] Analytics and monitoring
- [ ] Admin dashboard for payments

### Phase 4 (Week 4): Testing & Launch
- [ ] Comprehensive testing
- [ ] Security audit
- [ ] Performance optimization
- [ ] Production deployment

## Success Criteria

### Functional Requirements
- ✅ Payments process successfully for all tiers
- ✅ Access control works accurately
- ✅ Webhooks handle all events properly
- ✅ Error handling covers edge cases

### Performance Requirements
- ✅ Payment processing under 5 seconds
- ✅ 99.9% payment uptime
- ✅ Access checks under 100ms
- ✅ Webhook processing under 30 seconds

### Business Requirements
- ✅ Conversion rate >3%
- ✅ Payment failure rate <2%
- ✅ Customer satisfaction >4.5/5
- ✅ Refund rate <5%

---

*This document serves as the complete technical specification for payment gateway implementation. All payment-related development should follow these guidelines.*