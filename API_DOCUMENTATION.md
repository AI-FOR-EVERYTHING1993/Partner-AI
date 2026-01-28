# Partner AI - API Documentation

## Base URL
```
Production: https://partner-ai.com/api
Development: http://localhost:3000/api
```

## Authentication
All API requests require authentication using JWT tokens provided by Clerk.

```typescript
Headers: {
  'Authorization': 'Bearer <jwt_token>',
  'Content-Type': 'application/json'
}
```

## API Endpoints

### Authentication & User Management

#### Get Current User
```http
GET /api/user/profile
```

**Response:**
```json
{
  "id": "user_123",
  "email": "user@example.com",
  "name": "John Doe",
  "created_at": "2024-01-01T00:00:00Z",
  "subscription_status": "active",
  "current_access": {
    "tier": "mid_level",
    "expires_at": "2024-01-02T00:00:00Z",
    "features": {
      "basic_interview": true,
      "voice_practice": true,
      "resume_analysis": true,
      "advanced_feedback": true,
      "industry_specific": true,
      "priority_support": false
    }
  }
}
```

### Resume Analysis

#### Upload and Analyze Resume
```http
POST /api/resume/analyze
Content-Type: multipart/form-data
```

**Request:**
```typescript
{
  file: File, // PDF or DOCX
  target_role?: string,
  target_industry?: string,
  experience_level?: 'beginner' | 'mid_level' | 'expert'
}
```

**Response:**
```json
{
  "analysis_id": "analysis_123",
  "overall_score": 85,
  "ats_compatibility": 78,
  "strengths": [
    "Strong technical skills alignment",
    "Clear career progression",
    "Relevant industry experience"
  ],
  "weaknesses": [
    "Missing key industry keywords",
    "Inconsistent formatting",
    "Lack of quantified achievements"
  ],
  "recommendations": [
    {
      "category": "keywords",
      "priority": "high",
      "description": "Add more industry-specific keywords",
      "example": "Include terms like 'machine learning', 'data analysis', 'Python'"
    }
  ],
  "industry_alignment": 82,
  "processed_at": "2024-01-01T00:00:00Z"
}
```

#### Get Resume Analysis History
```http
GET /api/resume/history
```

**Response:**
```json
{
  "analyses": [
    {
      "id": "analysis_123",
      "filename": "resume_v2.pdf",
      "overall_score": 85,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "total_count": 5
}
```

### Interview Sessions

#### Start Interview Session
```http
POST /api/interview/start
```

**Request:**
```json
{
  "persona_config": {
    "role": "interviewer",
    "industry": "technology",
    "experience_level": "mid",
    "communication_style": "professional",
    "personality_traits": ["analytical", "supportive"]
  },
  "session_type": "practice",
  "target_role": "software_engineer",
  "duration_minutes": 30
}
```

**Response:**
```json
{
  "session_id": "session_123",
  "ai_persona": {
    "name": "Sarah Chen",
    "role": "Senior Engineering Manager",
    "company": "TechCorp",
    "background": "10+ years in software development and team leadership"
  },
  "initial_message": "Hello! I'm Sarah, and I'll be conducting your interview today. I'm excited to learn more about your background in software engineering. Shall we begin with you telling me a bit about yourself?",
  "session_config": {
    "voice_enabled": true,
    "real_time_feedback": true,
    "difficulty_level": 3
  }
}
```

#### Send Message in Interview
```http
POST /api/interview/message
```

**Request:**
```json
{
  "session_id": "session_123",
  "message": "I'm a software engineer with 4 years of experience...",
  "message_type": "text",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

**Response:**
```json
{
  "ai_response": "That's great! Can you tell me about a challenging project you worked on recently?",
  "follow_up_questions": [
    "What technologies did you use?",
    "How did you handle any obstacles?",
    "What was the outcome?"
  ],
  "real_time_feedback": {
    "clarity_score": 8.5,
    "confidence_level": 7.2,
    "relevance_score": 9.1
  },
  "next_question_preview": "Tell me about a time when you had to work with a difficult team member."
}
```

#### End Interview Session
```http
POST /api/interview/end
```

**Request:**
```json
{
  "session_id": "session_123"
}
```

**Response:**
```json
{
  "session_summary": {
    "duration_minutes": 28,
    "questions_answered": 8,
    "overall_performance": {
      "score": 82,
      "breakdown": {
        "technical_skills": 85,
        "communication": 78,
        "problem_solving": 88,
        "cultural_fit": 80
      }
    },
    "detailed_feedback": "You demonstrated strong technical knowledge...",
    "improvement_areas": [
      "Work on providing more specific examples",
      "Practice the STAR method for behavioral questions"
    ],
    "next_steps": [
      "Focus on system design questions",
      "Practice salary negotiation scenarios"
    ]
  }
}
```

### Voice Integration

#### Start Voice Session
```http
POST /api/voice/start
```

**Request:**
```json
{
  "session_id": "session_123",
  "voice_config": {
    "language": "en-US",
    "voice_analysis": true,
    "real_time_transcription": true
  }
}
```

**Response:**
```json
{
  "voice_session_id": "voice_123",
  "vapi_config": {
    "assistant_id": "assistant_123",
    "phone_number": "+1234567890",
    "webhook_url": "https://partner-ai.com/api/voice/webhook"
  },
  "connection_details": {
    "session_token": "token_123",
    "expires_at": "2024-01-01T01:00:00Z"
  }
}
```

#### Voice Analysis Results
```http
GET /api/voice/analysis/{voice_session_id}
```

**Response:**
```json
{
  "voice_metrics": {
    "average_pace": 145, // words per minute
    "tone_analysis": {
      "confidence": 7.8,
      "enthusiasm": 6.5,
      "clarity": 8.2
    },
    "filler_words": {
      "count": 12,
      "types": ["um", "uh", "like"],
      "frequency_per_minute": 2.1
    },
    "speech_patterns": {
      "pauses": 23,
      "average_pause_duration": 1.2,
      "speaking_time_percentage": 78
    }
  },
  "transcription_accuracy": 94.5,
  "recommendations": [
    "Reduce filler words by practicing with a timer",
    "Speak slightly slower for better clarity"
  ]
}
```

### Progress Tracking

#### Get User Progress
```http
GET /api/progress/overview
```

**Response:**
```json
{
  "overall_stats": {
    "sessions_completed": 15,
    "total_practice_hours": 12.5,
    "average_score": 78.2,
    "improvement_rate": 15.3
  },
  "skill_breakdown": {
    "technical_skills": {
      "current_level": 7.8,
      "target_level": 9.0,
      "progress_percentage": 65,
      "recent_trend": "improving"
    },
    "communication": {
      "current_level": 6.5,
      "target_level": 8.5,
      "progress_percentage": 45,
      "recent_trend": "stable"
    }
  },
  "recent_sessions": [
    {
      "id": "session_123",
      "date": "2024-01-01",
      "score": 82,
      "type": "technical_interview",
      "duration_minutes": 30
    }
  ],
  "next_recommendations": [
    "Focus on system design questions",
    "Practice behavioral interview scenarios"
  ]
}
```

#### Get Detailed Analytics
```http
GET /api/progress/analytics
```

**Response:**
```json
{
  "performance_trends": [
    {
      "date": "2024-01-01",
      "overall_score": 75,
      "technical_score": 78,
      "communication_score": 72
    }
  ],
  "skill_improvements": {
    "strongest_areas": ["problem_solving", "technical_knowledge"],
    "areas_for_improvement": ["salary_negotiation", "leadership_questions"],
    "improvement_velocity": 2.3
  },
  "session_patterns": {
    "preferred_session_length": 25,
    "most_active_hours": ["10:00", "14:00", "19:00"],
    "completion_rate": 87.5
  }
}
```

### Payment & Access Management

#### Get Pricing Tiers
```http
GET /api/pricing/tiers
```

**Response:**
```json
{
  "tiers": [
    {
      "id": "beginner",
      "name": "Beginner",
      "price": 299,
      "duration_hours": 24,
      "features": [
        "Entry-level focused questions",
        "Basic behavioral interviews",
        "Resume optimization tips",
        "Confidence building exercises"
      ],
      "target_experience": "0-2 years",
      "stripe_price_id": "price_beginner_24h"
    }
  ]
}
```

#### Create Payment Intent
```http
POST /api/payments/create-intent
```

**Request:**
```json
{
  "tier": "mid_level",
  "return_url": "https://partner-ai.com/success"
}
```

**Response:**
```json
{
  "client_secret": "pi_123_secret_456",
  "payment_intent_id": "pi_123",
  "amount": 799,
  "currency": "usd"
}
```

#### Confirm Payment
```http
POST /api/payments/confirm
```

**Request:**
```json
{
  "payment_intent_id": "pi_123"
}
```

**Response:**
```json
{
  "success": true,
  "access_granted": {
    "tier": "mid_level",
    "granted_at": "2024-01-01T00:00:00Z",
    "expires_at": "2024-01-02T00:00:00Z",
    "features": {
      "basic_interview": true,
      "voice_practice": true,
      "resume_analysis": true,
      "advanced_feedback": true,
      "industry_specific": true,
      "priority_support": false
    }
  }
}
```

#### Check Access Status
```http
GET /api/access/status
```

**Response:**
```json
{
  "has_access": true,
  "current_tier": "mid_level",
  "expires_at": "2024-01-02T00:00:00Z",
  "time_remaining_hours": 18.5,
  "features": {
    "basic_interview": true,
    "voice_practice": true,
    "resume_analysis": true,
    "advanced_feedback": true,
    "industry_specific": true,
    "priority_support": false
  },
  "usage_stats": {
    "sessions_used": 3,
    "resume_analyses_used": 1
  }
}
```

## Error Handling

### Standard Error Response
```json
{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "The request is invalid or malformed",
    "details": {
      "field": "email",
      "issue": "Invalid email format"
    },
    "request_id": "req_123"
  }
}
```

### Common Error Codes
- `UNAUTHORIZED` (401): Invalid or missing authentication
- `FORBIDDEN` (403): Access denied or expired subscription
- `NOT_FOUND` (404): Resource not found
- `INVALID_REQUEST` (400): Malformed request data
- `RATE_LIMITED` (429): Too many requests
- `INTERNAL_ERROR` (500): Server error
- `SERVICE_UNAVAILABLE` (503): Temporary service outage

## Rate Limiting

### Limits by Endpoint Type
- **Authentication**: 10 requests/minute
- **Resume Analysis**: 5 requests/hour
- **Interview Sessions**: 20 requests/hour
- **Voice Processing**: 100 requests/hour
- **Progress Tracking**: 60 requests/hour

### Rate Limit Headers
```http
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1640995200
```

## Webhooks

### Stripe Payment Webhooks
```http
POST /api/webhooks/stripe
```

**Events Handled:**
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `charge.dispute.created`
- `invoice.payment_succeeded`

### Vapi Voice Webhooks
```http
POST /api/webhooks/vapi
```

**Events Handled:**
- `call.started`
- `call.ended`
- `transcription.received`
- `analysis.completed`

## SDK Examples

### JavaScript/TypeScript
```typescript
import { PartnerAI } from '@partner-ai/sdk'

const client = new PartnerAI({
  apiKey: 'your-api-key',
  baseUrl: 'https://partner-ai.com/api'
})

// Start interview session
const session = await client.interview.start({
  persona_config: {
    role: 'interviewer',
    industry: 'technology',
    experience_level: 'mid'
  }
})

// Send message
const response = await client.interview.sendMessage(session.id, {
  message: 'I have 4 years of experience in React development...',
  type: 'text'
})
```

### Python
```python
from partner_ai import PartnerAI

client = PartnerAI(api_key='your-api-key')

# Analyze resume
with open('resume.pdf', 'rb') as file:
    analysis = client.resume.analyze(
        file=file,
        target_role='software_engineer',
        target_industry='technology'
    )

print(f"Overall score: {analysis.overall_score}")
```

## Testing

### Test Environment
```
Base URL: https://test-api.partner-ai.com/api
Test API Key: test_key_123
```

### Test Data
- **Test User ID**: `test_user_123`
- **Test Payment Methods**: Use Stripe test cards
- **Test Resume**: Sample PDF available at `/test-assets/sample-resume.pdf`

---

*This API documentation is continuously updated. For the latest version, visit our developer portal.*