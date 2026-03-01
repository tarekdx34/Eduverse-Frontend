# Phase 5: Course Content & Materials

> **Priority**: 🟡 Medium  
> **Modules**: 1  
> **Reason**: Instructors and TAs need to upload and manage course materials.

---

## 5.1 Course Materials Module

### Database Tables
| Table | Description |
|-------|-------------|
| `course_materials` | Lectures, readings, slides, videos uploaded to courses |
| `lecture_sections_labs` | Organization of lectures/sections/labs by week |

### Entity Definitions

#### CourseMaterial Entity
```typescript
@Entity('course_materials')
export class CourseMaterial {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  materialId: number;

  @Column({ type: 'bigint', unsigned: true })
  sectionId: number;

  @ManyToOne(() => CourseSection)
  @JoinColumn({ name: 'section_id' })
  section: CourseSection;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: ['lecture', 'reading', 'slides', 'video', 'document', 'link', 'other'] })
  materialType: string;

  @Column({ type: 'bigint', unsigned: true, nullable: true })
  fileId: number;  // Reference to files table

  @ManyToOne(() => File)
  @JoinColumn({ name: 'file_id' })
  file: File;

  @Column({ type: 'varchar', length: 500, nullable: true })
  externalUrl: string;  // For links/external content

  @Column({ type: 'int', nullable: true })
  weekNumber: number;

  @Column({ type: 'int', default: 0 })
  orderIndex: number;

  @Column({ type: 'tinyint', default: 1 })
  isVisible: boolean;

  @Column({ type: 'timestamp', nullable: true })
  availableFrom: Date;

  @Column({ type: 'timestamp', nullable: true })
  availableUntil: Date;

  @Column({ type: 'int', default: 0 })
  downloadCount: number;

  @Column({ type: 'int', default: 0 })
  viewCount: number;

  @Column({ type: 'bigint', unsigned: true })
  uploadedBy: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'uploaded_by' })
  uploader: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

#### LectureSectionLab Entity
```typescript
@Entity('lecture_sections_labs')
export class LectureSectionLab {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'bigint', unsigned: true })
  sectionId: number;

  @ManyToOne(() => CourseSection)
  @JoinColumn({ name: 'section_id' })
  section: CourseSection;

  @Column({ type: 'int' })
  weekNumber: number;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: ['lecture', 'section', 'lab'] })
  type: string;

  @Column({ type: 'text', nullable: true })
  objectives: string;

  @Column({ type: 'json', nullable: true })
  topics: any;  // Array of topic strings

  @Column({ type: 'int', default: 0 })
  orderIndex: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### API Endpoints

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| **Materials** | | | |
| GET | `/api/courses/:courseId/sections/:sectionId/materials` | List materials for section | ALL |
| POST | `/api/courses/:courseId/sections/:sectionId/materials` | Upload/add material | INSTRUCTOR, TA |
| GET | `/api/materials/:id` | Get material details | ALL |
| PUT | `/api/materials/:id` | Update material metadata | INSTRUCTOR, TA |
| DELETE | `/api/materials/:id` | Delete material | INSTRUCTOR |
| PATCH | `/api/materials/:id/visibility` | Toggle visibility | INSTRUCTOR, TA |
| GET | `/api/materials/:id/download` | Download material file | ALL |
| POST | `/api/materials/bulk-upload` | Upload multiple materials | INSTRUCTOR, TA |
| **Course Structure** | | | |
| GET | `/api/courses/:courseId/sections/:sectionId/structure` | Get week-by-week structure | ALL |
| POST | `/api/courses/:courseId/sections/:sectionId/structure` | Add week/topic | INSTRUCTOR |
| PUT | `/api/structure/:id` | Update structure item | INSTRUCTOR |
| DELETE | `/api/structure/:id` | Delete structure item | INSTRUCTOR |
| PATCH | `/api/structure/reorder` | Reorder items | INSTRUCTOR |

### Query Parameters
```typescript
interface QueryMaterialsDto {
  materialType?: string;
  weekNumber?: number;
  isVisible?: boolean;
  search?: string;
  sortBy?: 'createdAt' | 'title' | 'weekNumber' | 'orderIndex';
  sortOrder?: 'ASC' | 'DESC';
  page?: number;
  limit?: number;
}
```

### Business Logic
1. **File Integration**: Uses the existing Files module for actual file storage. `CourseMaterial` references `files` table.
2. **Visibility Control**: Materials can be hidden from students until a specific date.
3. **Download Tracking**: Increment `downloadCount` on each download.
4. **View Tracking**: Increment `viewCount` when a student views the material.
5. **Week Organization**: Materials organized by week number for structured course delivery.
6. **Ordering**: Support manual reordering within weeks.
7. **Bulk Upload**: Support uploading multiple files at once.

### Frontend Components Using This Module
- **Instructor**: CourseDetail.tsx *(materials accessed via course view)*
- ~~**Instructor**: UploadMaterialsPage.tsx~~ *(Materials tab removed from CourseDetail — task I14)*
- **TA**: LabResourcesPage.tsx *(active as `lab-resources` tab)*
- **Student**: ClassTab.tsx *(viewing materials via `myclass` tab)*

---

## Module Structure

```
src/modules/
└── course-materials/
    ├── course-materials.module.ts
    ├── entities/
    │   ├── course-material.entity.ts
    │   └── lecture-section-lab.entity.ts
    ├── dto/
    │   ├── create-material.dto.ts
    │   ├── update-material.dto.ts
    │   ├── create-structure.dto.ts
    │   └── query-materials.dto.ts
    ├── controllers/
    │   ├── materials.controller.ts
    │   └── course-structure.controller.ts
    ├── services/
    │   ├── materials.service.ts
    │   └── course-structure.service.ts
    └── exceptions/
        └── material-not-found.exception.ts
```
