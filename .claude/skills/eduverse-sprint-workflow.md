# EduVerse Sprint Implementation Skill

## Project Context
- **Stack**: NestJS + TypeORM + MySQL/MariaDB
- **Port**: 8081 | **DB**: eduverse_db (root, no password, port 3306)
- **TypeORM**: synchronize: false — all schema changes via manual SQL
- **Auth**: POST /api/auth/login → {accessToken} (Bearer token)
- **Test password**: SecureP@ss123 for all *.tarek@example.com accounts
- **User PK**: userId field (user_id column), NOT id
- **Roles**: student, instructor, teaching_assistant, admin, it_admin, department_head
- **MySQL CLI**: `& "C:\Program Files\MySQL\MySQL Shell 9.5\bin\mysqlsh.exe" --sql -h localhost -u root --password="" -P 3306 --database=eduverse_db`
- **MySQL MCP**: READ-ONLY (use CLI for DDL, MCP for verification queries)

## Implementation Workflow (7 Phases)

### 1. Plan
- Gather requirements → user stories → API endpoints table → file change list
- Get user approval before coding

### 2. Schema (DB Changes)
- Write CREATE TABLE / ALTER TABLE SQL
- Execute via mysqlsh CLI
- Verify with MCP queries
- **Save as `DB_CHANGES_<FEATURE>.sql`** with comments + rollback statements

### 3. Entities & DTOs
- Entities: `src/modules/<mod>/entities/<name>.entity.ts`
- DTOs: `src/modules/<mod>/dto/create-<name>.dto.ts`, `update-<name>.dto.ts`, `<name>-query.dto.ts`
- Export from barrel `index.ts` files
- Use class-validator decorators, Swagger decorators

### 4. Services & Controllers
- Services: business logic + access control
- Controllers: route decorators, guards
- **Static routes BEFORE :id param routes** (NestJS requirement)
- Register in module: TypeOrmModule.forFeature(), controllers, providers
- Use @UseGuards(JwtAuthGuard, RolesGuard) + @Roles(...)

### 5. Test
- `npm run build` → start server → test each endpoint
- Test with multiple roles (student, admin, instructor)
- Verify access control (403 for unauthorized)
- Verify pagination format: {data:[], meta:{total, page, limit, totalPages}}

### 6. Document
- **Create `<FEATURE>_SUMMARY.md`**: architecture diagram, endpoints, access control, DB changes, files changed, test results
- Update FRONTEND_DASHBOARD_GUIDE.md
- Update EduVerse_Postman_Collection.json
- Update test HTML files if applicable

### 7. Commit
- Conventional commits format
- Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>

## Mandatory Deliverables
After EVERY feature/sprint, create these two files:
1. **`DB_CHANGES_<FEATURE>.sql`** — all DDL + seeds + rollback
2. **`<FEATURE>_SUMMARY.md`** — architecture, endpoints, access control, test results, files list

## Key Patterns
- Enrollment access: course_enrollments → course_sections → courses → departments
- All list endpoints: {data:[], meta:{total, page, limit, totalPages}}
- CORS: callback-based in main.ts (any localhost port)
- Socket.IO: /messaging namespace, auth via {auth:{token}}
- Password hashing: bcrypt, salt 10, via @BeforeInsert/@BeforeUpdate
- File structure: src/modules/<name>/{entities,dto,services,controllers}/<name>.<type>.ts
