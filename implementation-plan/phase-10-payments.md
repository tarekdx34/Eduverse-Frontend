# Phase 10: Payments & Certificates

> **Priority**: 🔵 Nice-to-have  
> **Modules**: 2  
> **Reason**: Financial features and credentials are important but can be deferred.

---

## 10.1 Payments Module

### Database Tables
May need new tables or extend existing schema:

#### Proposed Tables
```sql
CREATE TABLE payments (
  payment_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  payment_type ENUM('tuition', 'fee', 'subscription', 'refund') NOT NULL,
  payment_method ENUM('credit_card', 'debit_card', 'bank_transfer', 'paypal', 'stripe', 'cash') NOT NULL,
  status ENUM('pending', 'completed', 'failed', 'refunded', 'cancelled') DEFAULT 'pending',
  transaction_id VARCHAR(255),
  description TEXT,
  semester_id BIGINT UNSIGNED,
  invoice_number VARCHAR(50),
  paid_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE subscription_plans (
  plan_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  billing_cycle ENUM('monthly', 'quarterly', 'yearly') NOT NULL,
  features JSON,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_subscriptions (
  subscription_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  plan_id BIGINT UNSIGNED NOT NULL,
  status ENUM('active', 'cancelled', 'expired', 'past_due') DEFAULT 'active',
  started_at TIMESTAMP NOT NULL,
  expires_at TIMESTAMP,
  cancelled_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### API Endpoints

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| **Student Payments** | | | |
| GET | `/api/payments/my` | Get payment history for current user | STUDENT |
| GET | `/api/payments/my/balance` | Get outstanding balance | STUDENT |
| POST | `/api/payments/pay` | Make a payment | STUDENT |
| GET | `/api/payments/invoices` | List invoices | STUDENT |
| GET | `/api/payments/invoices/:id/download` | Download invoice PDF | STUDENT |
| **Admin Payments** | | | |
| GET | `/api/payments` | List all payments (paginated, filtered) | ADMIN |
| GET | `/api/payments/:id` | Get payment details | ADMIN |
| POST | `/api/payments/refund/:id` | Process refund | ADMIN |
| GET | `/api/payments/revenue` | Revenue dashboard data (monthly) | ADMIN |
| GET | `/api/payments/revenue/by-department` | Revenue by department | ADMIN |
| GET | `/api/payments/transactions` | Transaction list with filters | ADMIN |
| **Subscriptions** | | | |
| GET | `/api/subscriptions/plans` | List subscription plans | ALL |
| POST | `/api/subscriptions/subscribe` | Subscribe to a plan | STUDENT |
| DELETE | `/api/subscriptions/cancel` | Cancel subscription | STUDENT |
| GET | `/api/subscriptions/my` | Get current subscription | STUDENT |
| **Payment Config** | | | |
| GET | `/api/payments/methods` | List enabled payment methods | ALL |
| PUT | `/api/payments/methods/:method` | Enable/disable payment method | ADMIN |

### Query Parameters
```typescript
interface QueryPaymentsDto {
  userId?: number;
  status?: string;
  paymentType?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  page?: number;
  limit?: number;
}
```

### Business Logic
1. **Payment Gateway Integration**: Abstract payment provider (Stripe, PayPal).
2. **Invoice Generation**: Auto-generate invoices for tuition/fees.
3. **Refund Processing**: Validate refund eligibility. Process through payment gateway.
4. **Revenue Reports**: Aggregate revenue data by month, department, payment type.
5. **Overdue Payments**: Flag overdue payments. Send reminder notifications.
6. **Subscription Management**: Handle billing cycles, renewals, cancellations.

### Frontend Components Using This Module
- **Student**: PaymentHistory.tsx *(active as `payments` tab)*
- ~~**Admin**: PaymentManagementPage.tsx~~ *(Not in Admin sidebar — deleted)*

---

## 10.2 Certificates Module

### Database Tables
| Table | Description |
|-------|-------------|
| `certificates` | Course completion certificates |

### Entity Definition

#### Certificate Entity
```typescript
@Entity('certificates')
export class Certificate {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  certificateId: number;

  @Column({ type: 'bigint', unsigned: true })
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'bigint', unsigned: true })
  courseId: number;

  @ManyToOne(() => Course)
  @JoinColumn({ name: 'course_id' })
  course: Course;

  @Column({ type: 'bigint', unsigned: true, nullable: true })
  sectionId: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  certificateNumber: string;  // Unique certificate ID for verification

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 5, nullable: true })
  finalGrade: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  finalScore: number;

  @Column({ type: 'date' })
  issueDate: string;

  @Column({ type: 'date', nullable: true })
  expiryDate: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  certificateUrl: string;  // PDF URL

  @Column({ type: 'varchar', length: 500, nullable: true })
  verificationUrl: string;

  @Column({ type: 'enum', enum: ['issued', 'revoked', 'expired'], default: 'issued' })
  status: string;

  @Column({ type: 'bigint', unsigned: true, nullable: true })
  issuedBy: number;

  @CreateDateColumn()
  createdAt: Date;
}
```

### API Endpoints

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/api/certificates/my` | List user's certificates | STUDENT |
| GET | `/api/certificates/:id` | Get certificate details | STUDENT, ADMIN |
| GET | `/api/certificates/:id/download` | Download certificate PDF | STUDENT |
| GET | `/api/certificates/verify/:number` | Verify certificate by number (public) | NONE (public) |
| POST | `/api/certificates/generate` | Generate certificate for student | INSTRUCTOR, ADMIN |
| POST | `/api/certificates/bulk-generate` | Bulk generate for completed students | ADMIN |
| PATCH | `/api/certificates/:id/revoke` | Revoke a certificate | ADMIN |
| GET | `/api/certificates` | List all certificates (admin) | ADMIN |

### Business Logic
1. **Auto-generation**: When a student completes a course with passing grade, auto-generate certificate.
2. **Unique Number**: Generate unique certificate number (e.g., `EDU-2025-CS101-00001`).
3. **PDF Generation**: Generate PDF with course name, student name, grade, date, signatures.
4. **Verification**: Public endpoint to verify certificate authenticity by number.
5. **Revocation**: Admins can revoke certificates (e.g., academic dishonesty).
6. **Templates**: Support multiple certificate templates per course type.

### Frontend Components Using This Module
- **Student**: GradesTranscript.tsx (download certificates)

---

## Module Structure

```
src/modules/
├── payments/
│   ├── payments.module.ts
│   ├── entities/
│   │   ├── payment.entity.ts
│   │   ├── subscription-plan.entity.ts
│   │   └── user-subscription.entity.ts
│   ├── dto/
│   │   ├── create-payment.dto.ts
│   │   ├── process-refund.dto.ts
│   │   └── query-payments.dto.ts
│   ├── providers/
│   │   ├── payment-gateway.interface.ts
│   │   ├── stripe-gateway.service.ts
│   │   └── paypal-gateway.service.ts
│   ├── controllers/
│   │   ├── payments.controller.ts
│   │   └── subscriptions.controller.ts
│   └── services/
│       ├── payments.service.ts
│       ├── invoice.service.ts
│       └── subscription.service.ts
└── certificates/
    ├── certificates.module.ts
    ├── entities/
    │   └── certificate.entity.ts
    ├── dto/
    │   ├── generate-certificate.dto.ts
    │   └── query-certificates.dto.ts
    ├── templates/
    │   └── certificate.hbs             # PDF template
    ├── controllers/
    │   └── certificates.controller.ts
    └── services/
        ├── certificates.service.ts
        └── pdf-generator.service.ts
```
