# Phase 8: User Management & Administration

> **Priority**: 🟡 Medium  
> **Modules**: 2  
> **Reason**: Admin and IT Admin dashboards need enhanced user management and role/permission configuration.

---

## 8.1 User Management Module (Enhanced)

### Current State
The Auth module already handles login, register, JWT, and basic user operations. This phase enhances it with full admin-level user management.

### Database Tables (Already Exist)
| Table | Description |
|-------|-------------|
| `users` | User accounts with profiles |
| `user_roles` | Maps users to roles |
| `language_preferences` | User language/format/timezone preferences |
| `theme_preferences` | User UI theme preferences |

### New/Enhanced API Endpoints

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| **Admin User Management** | | | |
| GET | `/api/users` | List all users (paginated, filterable) | ADMIN, IT_ADMIN |
| POST | `/api/users` | Create user (admin creates accounts) | ADMIN, IT_ADMIN |
| GET | `/api/users/:id` | Get user details | ADMIN, IT_ADMIN |
| PUT | `/api/users/:id` | Update user (admin edit) | ADMIN, IT_ADMIN |
| DELETE | `/api/users/:id` | Deactivate/delete user | ADMIN, IT_ADMIN |
| PATCH | `/api/users/:id/status` | Change user status (active/suspended/inactive) | ADMIN, IT_ADMIN |
| PATCH | `/api/users/:id/roles` | Assign/remove roles | ADMIN, IT_ADMIN |
| POST | `/api/users/bulk-create` | Bulk create users (CSV import) | ADMIN, IT_ADMIN |
| POST | `/api/users/bulk-status` | Bulk status change | ADMIN, IT_ADMIN |
| **Profile Management** | | | |
| GET | `/api/users/profile` | Get current user profile | ALL |
| PUT | `/api/users/profile` | Update current user profile | ALL |
| POST | `/api/users/profile/avatar` | Upload profile picture | ALL |
| **Preferences** | | | |
| GET | `/api/users/preferences` | Get user preferences (language, theme, notifications) | ALL |
| PUT | `/api/users/preferences` | Update preferences | ALL |
| GET | `/api/users/preferences/language` | Get language preference | ALL |
| PUT | `/api/users/preferences/language` | Update language preference | ALL |
| GET | `/api/users/preferences/theme` | Get theme preference | ALL |
| PUT | `/api/users/preferences/theme` | Update theme preference | ALL |
| **Password & Security** | | | |
| PATCH | `/api/users/password` | Change own password | ALL |
| PATCH | `/api/users/:id/reset-password` | Force reset user's password | ADMIN |
| PUT | `/api/users/2fa` | Enable/disable 2FA | ALL |
| **Search & Filter** | | | |
| GET | `/api/users/search` | Search users by name, email, department | ALL |
| GET | `/api/users/by-role/:role` | List users by role | ADMIN, IT_ADMIN |
| GET | `/api/users/by-department/:departmentId` | List users by department | ADMIN, IT_ADMIN |
| GET | `/api/users/stats` | User statistics (total, by role, by status) | ADMIN, IT_ADMIN |

### Query Parameters
```typescript
interface QueryUsersDto {
  search?: string;       // Search in name, email
  role?: string;         // Filter by role
  status?: string;       // active, suspended, inactive, pending
  departmentId?: number;
  campusId?: number;
  sortBy?: 'name' | 'email' | 'createdAt' | 'lastLoginAt';
  sortOrder?: 'ASC' | 'DESC';
  page?: number;
  limit?: number;
}
```

### DTOs

#### CreateUserDto (Admin)
```typescript
export class AdminCreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @Length(2, 50)
  firstName: string;

  @IsString()
  @Length(2, 50)
  lastName: string;

  @IsString()
  @MinLength(8)
  @IsOptional()
  password?: string;  // Auto-generate if not provided

  @IsArray()
  @IsEnum(Role, { each: true })
  roles: Role[];

  @IsNumber()
  @IsOptional()
  departmentId?: number;

  @IsNumber()
  @IsOptional()
  campusId?: number;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsBoolean()
  @IsOptional()
  sendWelcomeEmail?: boolean;  // Default true
}
```

#### UpdateProfileDto
```typescript
export class UpdateProfileDto {
  @IsString()
  @Length(2, 50)
  @IsOptional()
  firstName?: string;

  @IsString()
  @Length(2, 50)
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  bio?: string;

  @IsString()
  @IsOptional()
  academicTitle?: string;

  @IsString()
  @IsOptional()
  officeLocation?: string;
}
```

#### UpdatePreferencesDto
```typescript
export class UpdatePreferencesDto {
  @IsString()
  @IsOptional()
  language?: string;  // 'en', 'ar', 'fr', etc.

  @IsString()
  @IsOptional()
  theme?: string;  // 'light', 'dark', 'system'

  @IsString()
  @IsOptional()
  timezone?: string;

  @IsString()
  @IsOptional()
  dateFormat?: string;

  @IsString()
  @IsOptional()
  timeFormat?: string;  // '12h', '24h'
}
```

### Business Logic
1. **Bulk Import**: Parse CSV file with user data. Validate each row. Create users in batch.
2. **Welcome Email**: Send welcome email with temporary password when admin creates account.
3. **Status Management**: `PENDING` → `ACTIVE` → `SUSPENDED` → `INACTIVE`.
4. **Profile Picture**: Upload to local storage or cloud. Update `profilePictureUrl`.
5. **Preference Defaults**: Set defaults based on campus/department settings.
6. **Password Policy**: Min 8 chars, at least 1 uppercase, 1 number, 1 special char.

### Frontend Components Using This Module
- **Admin**: StudentManagementPage.tsx *(active as `students` tab)*
- ~~**Admin**: UserManagementPage.tsx~~ *(Not in Admin sidebar — deleted; StudentManagementPage used instead)*
- **IT Admin**: UserManagementPage.tsx *(active as `users` tab)*
- **All Dashboards**: ProfilePage.tsx / DashboardProfileTab.tsx *(active as `profile` tab)*
- **Student**: SettingsPreferences.tsx *(active as `settings` tab)*
- ~~**Instructor**: SettingsPage.tsx~~ *(Removed from Instructor sidebar — task I16)*

---

## 8.2 Roles & Permissions Module (Enhanced)

### Database Tables (Already Exist)
| Table | Description |
|-------|-------------|
| `roles` | Role definitions |
| `permissions` | Permission definitions |
| `role_permissions` | Role-permission mappings |
| `ta_instructor_access` | TA access permissions granted by instructors |

### API Endpoints

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/api/roles` | List all roles with permissions | ADMIN, IT_ADMIN |
| GET | `/api/roles/:id` | Get role details with full permission matrix | ADMIN, IT_ADMIN |
| POST | `/api/roles` | Create custom role | ADMIN, IT_ADMIN |
| PUT | `/api/roles/:id` | Update custom role | ADMIN, IT_ADMIN |
| DELETE | `/api/roles/:id` | Delete custom role (if no users assigned) | ADMIN, IT_ADMIN |
| PUT | `/api/roles/:id/permissions` | Update role permissions | ADMIN, IT_ADMIN |
| GET | `/api/permissions` | List all available permissions | ADMIN, IT_ADMIN |
| GET | `/api/permissions/modules` | List permission modules (courses, users, etc.) | ADMIN, IT_ADMIN |
| **TA Access** | | | |
| GET | `/api/ta-access/:taId` | Get TA's access permissions | INSTRUCTOR |
| PUT | `/api/ta-access/:taId` | Grant/revoke TA permissions | INSTRUCTOR |

### Permission Matrix Structure
```typescript
interface PermissionModule {
  module: string;    // 'courses', 'users', 'grades', etc.
  actions: {
    create: boolean;
    read: boolean;
    update: boolean;
    delete: boolean;
  };
}

interface RolePermissions {
  roleId: number;
  roleName: string;
  isCustom: boolean;
  modules: PermissionModule[];
}
```

### Business Logic
1. **Built-in Roles**: STUDENT, INSTRUCTOR, TA, ADMIN, IT_ADMIN cannot be deleted.
2. **Custom Roles**: Allow creating custom roles with specific permission sets.
3. **Permission Inheritance**: Custom roles can inherit from built-in roles.
4. **Guard Integration**: `@Permissions()` decorator checks specific permissions, not just roles.
5. **TA Access Control**: Instructors grant specific permissions to their TAs per course.

### Frontend Components Using This Module
- ~~**Admin**: RoleManagementPage.tsx~~ *(Not in Admin sidebar — deleted)*
- **IT Admin**: RoleManagementPage.tsx *(active as `roles` tab)*

---

## Module Structure

```
src/modules/
├── user-management/
│   ├── user-management.module.ts       (or enhance existing auth module)
│   ├── dto/
│   │   ├── admin-create-user.dto.ts
│   │   ├── update-profile.dto.ts
│   │   ├── update-preferences.dto.ts
│   │   ├── change-password.dto.ts
│   │   ├── query-users.dto.ts
│   │   └── bulk-create-users.dto.ts
│   ├── controllers/
│   │   ├── user-management.controller.ts  (admin operations)
│   │   ├── profile.controller.ts          (self-service)
│   │   └── preferences.controller.ts
│   └── services/
│       ├── user-management.service.ts
│       ├── profile.service.ts
│       └── preferences.service.ts
└── roles/
    ├── roles.module.ts
    ├── entities/
    │   └── ta-instructor-access.entity.ts
    ├── dto/
    │   ├── create-role.dto.ts
    │   ├── update-permissions.dto.ts
    │   └── ta-access.dto.ts
    ├── controllers/
    │   ├── roles.controller.ts
    │   └── ta-access.controller.ts
    └── services/
        ├── roles.service.ts
        └── ta-access.service.ts
```
