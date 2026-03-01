# Phase 9: System & IT Administration

> **Priority**: 🟢 Lower  
> **Modules**: 4  
> **Reason**: IT Admin dashboard features. Important for production but not for core LMS.

---

## 9.1 Security & Audit Module

### Database Tables
| Table | Description |
|-------|-------------|
| `security_logs` | Security events (login, permission changes) |
| `audit_logs` | Comprehensive audit trail of actions |
| `activity_logs` | General user activity tracking (shared with analytics) |
| `login_attempts` | Login attempt history |

### Entity Definitions

#### SecurityLog Entity
```typescript
@Entity('security_logs')
export class SecurityLog {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  logId: number;

  @Column({ type: 'bigint', unsigned: true, nullable: true })
  userId: number;

  @Column({ type: 'enum', enum: ['login_success', 'login_failure', 'logout', 'password_change', 'permission_change', 'role_change', 'account_locked', 'suspicious_activity', 'ip_blocked', 'session_hijack', 'brute_force'] })
  eventType: string;

  @Column({ type: 'enum', enum: ['info', 'warning', 'critical'], default: 'info' })
  severity: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ipAddress: string;

  @Column({ type: 'text', nullable: true })
  userAgent: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  location: string;

  @Column({ type: 'json', nullable: true })
  metadata: any;

  @CreateDateColumn()
  createdAt: Date;
}
```

#### AuditLog Entity
```typescript
@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  logId: number;

  @Column({ type: 'bigint', unsigned: true })
  userId: number;

  @Column({ type: 'varchar', length: 50 })
  action: string;  // 'CREATE', 'UPDATE', 'DELETE', 'VIEW'

  @Column({ type: 'varchar', length: 50 })
  entityType: string;  // 'user', 'course', 'grade', etc.

  @Column({ type: 'bigint', unsigned: true, nullable: true })
  entityId: number;

  @Column({ type: 'json', nullable: true })
  oldValues: any;

  @Column({ type: 'json', nullable: true })
  newValues: any;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ipAddress: string;

  @CreateDateColumn()
  createdAt: Date;
}
```

### API Endpoints

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| **Security Logs** | | | |
| GET | `/api/security/logs` | List security events (filter by type, severity, date) | ADMIN, IT_ADMIN |
| GET | `/api/security/logs/stats` | Security dashboard stats | ADMIN, IT_ADMIN |
| GET | `/api/security/threats` | List active threats/alerts | IT_ADMIN |
| **Audit Logs** | | | |
| GET | `/api/audit/logs` | List audit trail (filter by user, action, entity) | ADMIN, IT_ADMIN |
| GET | `/api/audit/logs/entity/:type/:id` | Get audit history for specific entity | ADMIN, IT_ADMIN |
| **Sessions** | | | |
| GET | `/api/security/sessions` | List active user sessions | ADMIN, IT_ADMIN |
| DELETE | `/api/security/sessions/:id` | Revoke a session | ADMIN, IT_ADMIN |
| DELETE | `/api/security/sessions/user/:userId` | Revoke all user sessions | ADMIN, IT_ADMIN |
| **IP Management** | | | |
| GET | `/api/security/blocked-ips` | List blocked IPs | IT_ADMIN |
| POST | `/api/security/block-ip` | Block an IP address | IT_ADMIN |
| DELETE | `/api/security/blocked-ips/:id` | Unblock IP | IT_ADMIN |
| **Export** | | | |
| POST | `/api/security/logs/export` | Export security logs | IT_ADMIN |
| POST | `/api/audit/logs/export` | Export audit logs | IT_ADMIN |

### Business Logic
1. **Auto-logging**: Use NestJS interceptors to automatically log all write operations.
2. **Threat Detection**: Flag multiple failed login attempts. Auto-block after threshold.
3. **Session Management**: Allow admins to view and revoke active sessions.
4. **IP Blocking**: Maintain a blocklist. Check against it in auth middleware.
5. **Retention**: Keep security logs for 90 days, audit logs for 1 year.

### Frontend Components Using This Module
- ~~**Admin**: SecurityLogsPage.tsx~~ *(Not in Admin sidebar — deleted)*
- **IT Admin**: SecurityPage.tsx, SecurityLogsPage.tsx *(active as `security` and `security-logs` tabs)*

---

## 9.2 System Settings Module

### Database Tables
| Table | Description |
|-------|-------------|
| `system_settings` | Global platform configuration |
| `branding_settings` | Campus-specific branding (logos, colors) |
| `api_integrations` | External API integrations |
| `api_rate_limits` | API rate limiting config |

### API Endpoints

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| **System Settings** | | | |
| GET | `/api/settings` | Get all system settings | ADMIN, IT_ADMIN |
| PUT | `/api/settings` | Update system settings | ADMIN, IT_ADMIN |
| GET | `/api/settings/:key` | Get specific setting | ADMIN, IT_ADMIN |
| PUT | `/api/settings/:key` | Update specific setting | ADMIN, IT_ADMIN |
| **Branding** | | | |
| GET | `/api/settings/branding` | Get branding settings | ALL |
| PUT | `/api/settings/branding` | Update branding | ADMIN, IT_ADMIN |
| POST | `/api/settings/branding/logo` | Upload logo | ADMIN, IT_ADMIN |
| **Integrations** | | | |
| GET | `/api/integrations` | List API integrations | ADMIN, IT_ADMIN |
| POST | `/api/integrations` | Add integration | IT_ADMIN |
| PUT | `/api/integrations/:id` | Update integration | IT_ADMIN |
| DELETE | `/api/integrations/:id` | Remove integration | IT_ADMIN |
| POST | `/api/integrations/:id/test` | Test integration connection | IT_ADMIN |
| POST | `/api/integrations/:id/sync` | Trigger sync | IT_ADMIN |
| **Rate Limits** | | | |
| GET | `/api/settings/rate-limits` | Get rate limit configs | IT_ADMIN |
| PUT | `/api/settings/rate-limits` | Update rate limits | IT_ADMIN |
| **Email Config** | | | |
| POST | `/api/settings/email/test` | Test SMTP connection | ADMIN, IT_ADMIN |

### Business Logic
1. **Settings Cache**: Cache settings in memory. Invalidate on update.
2. **Validation**: Validate setting values against their expected types.
3. **Audit**: Log all settings changes in audit log.
4. **Branding**: Serve branding assets (logo, colors) to frontend.
5. **Integration Health**: Periodically check integration health status.

### Frontend Components Using This Module
- ~~**Admin**: SettingsHubPage.tsx, SystemConfigPage.tsx~~ *(Not in Admin sidebar — deleted)*
- **IT Admin**: SystemConfigPage.tsx, IntegrationsPage.tsx *(active as `config` and `integrations` tabs)*

---

## 9.3 Monitoring & Infrastructure Module

### Database Tables
| Table | Description |
|-------|-------------|
| `server_monitoring` | Server health/resource monitoring |
| `system_errors` | Application error logging |
| `ssl_certificates` | SSL certificate management |

### API Endpoints

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| **Server Monitoring** | | | |
| GET | `/api/monitoring/servers` | List servers with status | IT_ADMIN |
| GET | `/api/monitoring/servers/:id` | Get server details | IT_ADMIN |
| POST | `/api/monitoring/servers` | Add server to monitoring | IT_ADMIN |
| PUT | `/api/monitoring/servers/:id` | Update server config | IT_ADMIN |
| DELETE | `/api/monitoring/servers/:id` | Remove from monitoring | IT_ADMIN |
| POST | `/api/monitoring/servers/:id/restart` | Restart server | IT_ADMIN |
| **Health** | | | |
| GET | `/api/monitoring/health` | System health check (CPU, memory, disk, DB) | IT_ADMIN |
| GET | `/api/monitoring/metrics` | Performance metrics | IT_ADMIN |
| GET | `/api/monitoring/uptime` | Uptime statistics | IT_ADMIN |
| **Error Logs** | | | |
| GET | `/api/errors` | List application errors (filter by severity, type) | IT_ADMIN |
| GET | `/api/errors/:id` | Get error details with stack trace | IT_ADMIN |
| PUT | `/api/errors/:id` | Update error status (acknowledged, resolved) | IT_ADMIN |
| DELETE | `/api/errors/:id` | Delete error log | IT_ADMIN |
| GET | `/api/errors/stats` | Error statistics | IT_ADMIN |
| **SSL** | | | |
| GET | `/api/ssl/certificates` | List SSL certificates | IT_ADMIN |
| POST | `/api/ssl/certificates` | Add certificate | IT_ADMIN |
| PUT | `/api/ssl/certificates/:id/renew` | Renew certificate | IT_ADMIN |
| GET | `/api/ssl/certificates/expiring` | Certificates expiring soon | IT_ADMIN |

### Business Logic
1. **Health Checks**: Collect CPU, memory, disk usage, DB connection status.
2. **Alerting**: Alert when resources exceed thresholds (CPU > 90%, disk > 85%).
3. **Error Grouping**: Group similar errors by stack trace. Track occurrence count.
4. **SSL Monitoring**: Check certificate expiry dates. Alert 30 days before expiry.
5. **Uptime Tracking**: Record uptime/downtime events.

### Frontend Components Using This Module
- **IT Admin**: DashboardOverview.tsx, MonitoringPage.tsx, ErrorLogsPage.tsx

---

## 9.4 Backup Module

### API Endpoints

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/api/backups` | List backup history | ADMIN, IT_ADMIN |
| POST | `/api/backups` | Create manual backup | IT_ADMIN |
| POST | `/api/backups/:id/restore` | Restore from backup | IT_ADMIN |
| DELETE | `/api/backups/:id` | Delete backup | IT_ADMIN |
| GET | `/api/backups/schedule` | Get backup schedule | IT_ADMIN |
| PUT | `/api/backups/schedule` | Update backup schedule | IT_ADMIN |
| GET | `/api/backups/:id/download` | Download backup file | IT_ADMIN |
| POST | `/api/backups/integrity-check` | Run integrity check | IT_ADMIN |
| GET | `/api/database/stats` | Database size, tables, connections | IT_ADMIN |

### Business Logic
1. **Scheduled Backups**: Cron job for automated backups (daily, weekly configurable).
2. **Backup Types**: Full backup, incremental backup, database-only.
3. **Storage**: Store backups locally or upload to cloud storage.
4. **Retention Policy**: Auto-delete backups older than configured period.
5. **Integrity Check**: Verify backup file integrity before restore.
6. **Database Stats**: Query MySQL for database size, table sizes, active connections.

### Frontend Components Using This Module
- ~~**Admin**: BackupCenterPage.tsx~~ *(Not in Admin sidebar — deleted)*
- **IT Admin**: BackupCenterPage.tsx, DatabasePage.tsx *(active as `backup` and `database` tabs)*

---

## Module Structure

```
src/modules/
├── security/
│   ├── security.module.ts
│   ├── entities/
│   │   ├── security-log.entity.ts
│   │   ├── audit-log.entity.ts
│   │   └── blocked-ip.entity.ts
│   ├── dto/
│   ├── controllers/
│   │   ├── security.controller.ts
│   │   └── audit.controller.ts
│   ├── services/
│   │   ├── security.service.ts
│   │   ├── audit.service.ts       (shared - exported for auto-logging)
│   │   └── ip-blocker.service.ts
│   ├── interceptors/
│   │   └── audit-log.interceptor.ts   (auto-log all write operations)
│   └── exceptions/
├── settings/
│   ├── settings.module.ts
│   ├── entities/
│   │   ├── system-setting.entity.ts
│   │   ├── branding-setting.entity.ts
│   │   ├── api-integration.entity.ts
│   │   └── api-rate-limit.entity.ts
│   ├── dto/
│   ├── controllers/
│   │   ├── settings.controller.ts
│   │   └── integrations.controller.ts
│   └── services/
│       ├── settings.service.ts
│       └── integrations.service.ts
├── monitoring/
│   ├── monitoring.module.ts
│   ├── entities/
│   │   ├── server-monitoring.entity.ts
│   │   ├── system-error.entity.ts
│   │   └── ssl-certificate.entity.ts
│   ├── dto/
│   ├── controllers/
│   │   ├── monitoring.controller.ts
│   │   └── errors.controller.ts
│   └── services/
│       ├── monitoring.service.ts
│       ├── health-check.service.ts
│       └── error-log.service.ts
└── backup/
    ├── backup.module.ts
    ├── dto/
    ├── controllers/
    │   └── backup.controller.ts
    └── services/
        ├── backup.service.ts
        └── database-stats.service.ts
```
