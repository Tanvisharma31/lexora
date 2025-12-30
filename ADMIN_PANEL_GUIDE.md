# 🎯 Admin Panel - Complete Implementation Guide

## Overview

The Nyayik Admin Panel is a comprehensive, production-ready administrative dashboard built with **10x ideology**. It provides platform governance, monitoring, analytics, and management capabilities for SUPER_ADMIN and ADMIN roles.

---

## 📊 Features Implemented

### 1. **Core Admin Dashboard (15 Tabs)**

#### ✅ Tab 1: Overview
- **Key Metrics**: Organizations, Documents, Searches, Monthly Cost
- **System Health**: Uptime, Error Rate, Average Latency
- **Recent Activity**: 24h Requests, Active Users, New Signups

#### ✅ Tab 2: Organizations
- **Organization Stats**: Total orgs, Active orgs, By type (Firm/Court/Company)
- **Tenant Management UI**: Create, Edit, Delete organizations
- **Top Organizations**: By document count and user count
- **Organization Details**: User count, Document count, Creation date

#### ✅ Tab 3: Users & Roles (RBAC)
- **User Management**: View all users with filtering
- **Role Assignment**: Update user roles inline
- **Bulk Operations**: Batch role updates, activate/deactivate multiple users
- **User Stats**: Total users, Recent signups, Active users
- **Advanced Filters**: Filter by role, status, date range

#### ✅ Tab 4: Documents
- **Ingestion Stats**: Total documents, OCR success/failed/pending
- **Document Types**: Breakdown by file type (PDF, DOCX, Scanned)
- **Documents by Tenant**: Per-organization breakdown
- **Upload Statistics**: Track ingestion performance

#### ✅ Tab 5: Analytics
- **Search Analytics**: Total searches, Top features, Usage trends
- **Feature Usage**: Legal Search, Document Analysis, Draft Generation, etc.
- **Usage Over Time**: 30-day trend charts
- **Status Codes**: Request success/failure distribution

#### ✅ Tab 6: Cost Monitoring
- **Monthly Cost Tracking**: Compute, Storage, API costs
- **Cost Breakdown**: Detailed usage metrics
- **API Calls**: Current month tracking
- **Cost Forecasting**: (Future enhancement)

#### ✅ Tab 7: Jurisdictions
- **Jurisdiction Coverage**: Active jurisdictions list
- **Coverage Map**: Jurisdictions by source (Cases, Central Acts, State Acts)
- **Geographic Distribution**: Coverage count

#### ✅ Tab 8: Audit Logs
- **API Request Logs**: Immutable audit trail
- **Request Details**: Method, Endpoint, Status, Latency, IP
- **Legal Traceability**: Full request history for compliance
- **Log Filtering**: By date range, endpoint, status code

#### ✅ Tab 9: AI Model Monitoring
- **Hallucination Rate**: Track AI accuracy issues
- **Bias Score**: Monitor potential biases
- **Accuracy Metrics**: Overall model performance
- **Total LLM Calls**: Usage tracking

#### ✅ Tab 10: Data Isolation
- **Tenant Isolation Score**: Security health metric
- **Orphaned Documents**: Detection and alerting
- **Tenant Data Leakage**: Prevention monitoring
- **Isolation Status**: Healthy/Warning/Critical

#### ✅ Tab 11: Compliance
- **GDPR Status**: Data protection compliance
- **DPDP Compliance**: Digital Personal Data Protection
- **ISO 27001**: Certification status
- **Audit Trail**: Compliance verification

#### ✅ Tab 12: Incidents
- **Error Logs**: OCR failures, Ingestion failures, Timeouts
- **Severity Classification**: Low, Medium, High, Critical
- **Incident Timeline**: Chronological error history
- **Error Details**: Endpoint, Status code, Timestamp

#### ✅ Tab 13: Billing
- **Subscription View**: Current plan, Monthly cost
- **Usage vs Limit**: Visual progress bars
- **Billing Period**: Current month tracking
- **Plan Details**: Enterprise/Professional/Basic

#### ✅ Tab 14: API Usage
- **API Monitoring**: Total calls, Calls by endpoint
- **Performance Metrics**: Avg latency, Error counts
- **Endpoint Analytics**: Top endpoints by usage
- **Usage Trends**: 30-day API call history

#### ✅ Tab 15: Feature Toggles
- **Live Feature Flags**: Judge-safe mode, Student mode, AI assistance
- **Toggle Management**: Enable/disable features in real-time
- **Experimental Features**: Control rollout
- **Maintenance Mode**: Platform-wide controls

---

## 🚀 Advanced Components Created

### 1. **Date Range Picker** (`components/admin/date-range-picker.tsx`)
- **Presets**: Today, Yesterday, Last 7/30/90 days, This/Last month, This year
- **Custom Range**: Manual date selection
- **Dual Calendar**: Two-month view for better UX
- **Integration**: Works with all analytics tabs

### 2. **Export Menu** (`components/admin/export-menu.tsx`)
- **Multi-Format Export**: JSON, CSV, PDF (coming soon)
- **Date Range Support**: Export filtered data
- **Report Types**: Organizations, Users, Documents, Analytics
- **Auto-Download**: Browser-based file download

### 3. **Advanced Filters** (`components/admin/advanced-filters.tsx`)
- **Filter Types**: Text, Select, Number, Date
- **Active Filters Display**: Visual badges showing applied filters
- **Filter Persistence**: Maintains state across sessions
- **Slide-out Panel**: Clean, organized filter UI

### 4. **Data Table** (`components/admin/data-table.tsx`)
- **Sorting**: Click-to-sort on any column
- **Pagination**: Navigate large datasets
- **Column Visibility**: Show/hide columns
- **Row Selection**: Multi-select with checkboxes
- **Search**: Client-side filtering

### 5. **Tenant Management** (`components/admin/tenant-management.tsx`)
- **Full CRUD**: Create, Read, Update, Delete tenants
- **Card View**: Visual organization cards
- **Inline Editing**: Quick updates
- **Delete Confirmation**: Prevent accidental deletions
- **Stats Display**: Users, Documents per tenant

### 6. **Bulk Operations** (`components/admin/bulk-operations.tsx`)
- **Batch Role Updates**: Change multiple users at once
- **Status Management**: Activate/deactivate in bulk
- **User Preview**: See affected users before applying
- **Validation**: Prevent invalid operations

### 7. **System Health** (`components/admin/system-health.tsx`)
- **Real-time Metrics**: CPU, Memory, Disk usage
- **Database Performance**: Connections, Query time
- **API Performance**: Requests/sec, Latency, Error rate
- **Health Status Badges**: Healthy/Warning/Critical
- **Auto-refresh**: Updates every 10 seconds

### 8. **Security Dashboard** (`components/admin/security-dashboard.tsx`)
- **Failed Logins**: 24-hour tracking
- **Suspicious Activity**: Multi-failure detection
- **Account Lockouts**: Security event monitoring
- **Blocked IPs**: Threat prevention
- **Recent Events**: Security timeline
- **Top Threats**: Incident type breakdown

---

## 🛠️ Backend API Endpoints

### Tenant Management
```
GET    /admin/tenants                    # List all tenants
POST   /admin/tenants                    # Create tenant
GET    /admin/tenants/{tenant_id}        # Get tenant details
PUT    /admin/tenants/{tenant_id}        # Update tenant
DELETE /admin/tenants/{tenant_id}        # Delete tenant
```

### Bulk Operations
```
PUT    /admin/users/bulk                 # Bulk update users
```

### System Monitoring
```
GET    /admin/system/health              # System health metrics
GET    /admin/security/metrics           # Security dashboard data
```

### Existing Endpoints (Already Implemented)
```
GET    /admin/stats                      # Dashboard statistics
GET    /admin/logs                       # API logs
GET    /admin/organizations              # Organization stats
GET    /admin/documents                  # Document stats
GET    /admin/analytics                  # Search & AI usage
GET    /admin/costs                      # Cost & compute usage
GET    /admin/jurisdictions              # Jurisdiction coverage
GET    /admin/model-monitoring           # AI model metrics
GET    /admin/compliance                 # Compliance status
GET    /admin/incidents                  # Incident logs
GET    /admin/billing                    # Billing info
GET    /admin/api-usage                  # API usage stats
GET    /admin/data-isolation             # Data isolation view
GET    /admin/feature-toggles            # Get feature toggles
POST   /admin/feature-toggles            # Update feature toggles
GET    /admin/reports/export             # Export reports
```

---

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+
- Python 3.11+
- PostgreSQL (via Supabase)
- Required packages (see below)

### Frontend Dependencies

Add these to `package.json`:
```json
{
  "dependencies": {
    "@tanstack/react-table": "^8.10.7",
    "react-day-picker": "^8.10.0",
    "date-fns": "^3.0.0"
  }
}
```

Install:
```bash
cd lexora
npm install
```

### Backend Dependencies

Already included in `requirements.txt`:
- `psutil` - System metrics monitoring
- `asyncpg` - PostgreSQL async driver
- `fastapi` - API framework

---

## 🎨 Usage Examples

### 1. Using Date Range Picker

```tsx
import { DateRangePicker } from "@/components/admin/date-range-picker"

const [dateRange, setDateRange] = useState<DateRange | undefined>({
  from: new Date(),
  to: new Date()
})

<DateRangePicker date={dateRange} setDate={setDateRange} />
```

### 2. Using Export Menu

```tsx
import { ExportMenu } from "@/components/admin/export-menu"

<ExportMenu 
  reportType="analytics" 
  dateRange={dateRange}
  filters={{ role: "LAWYER", active: "true" }}
/>
```

### 3. Using Advanced Filters

```tsx
import { AdvancedFilters } from "@/components/admin/advanced-filters"

const filters: FilterConfig[] = [
  {
    id: "role",
    label: "Role",
    type: "select",
    options: [
      { label: "Lawyer", value: "LAWYER" },
      { label: "Judge", value: "JUDGE" }
    ]
  },
  {
    id: "email",
    label: "Email",
    type: "text",
    placeholder: "Search by email"
  }
]

<AdvancedFilters
  filters={filters}
  values={filterValues}
  onChange={setFilterValues}
  onApply={() => fetchFilteredData()}
  onReset={() => setFilterValues({})}
/>
```

### 4. Using Data Table

```tsx
import { DataTable } from "@/components/admin/data-table"
import { ColumnDef } from "@tanstack/react-table"

const columns: ColumnDef<User>[] = [
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "role",
    header: "Role",
  }
]

<DataTable 
  columns={columns} 
  data={users}
  searchColumn="email"
  searchPlaceholder="Search users..."
/>
```

### 5. Using Tenant Management

```tsx
import { TenantManagement } from "@/components/admin/tenant-management"

<TenantManagement 
  tenants={tenantsList}
  onRefresh={() => fetchTenants()}
/>
```

### 6. Using Bulk Operations

```tsx
import { BulkOperations } from "@/components/admin/bulk-operations"

<BulkOperations
  users={allUsers}
  selectedUserIds={selectedIds}
  onOperationComplete={() => {
    fetchUsers()
    setSelectedIds([])
  }}
/>
```

### 7. Using System Health

```tsx
import { SystemHealth } from "@/components/admin/system-health"

// Auto-fetches and refreshes every 10 seconds
<SystemHealth />
```

### 8. Using Security Dashboard

```tsx
import { SecurityDashboard } from "@/components/admin/security-dashboard"

// Auto-fetches and refreshes every 30 seconds
<SecurityDashboard />
```

---

## 🔐 Security & Permissions

### Role-Based Access Control

All admin endpoints require `SUPER_ADMIN` or `ADMIN` role:

```typescript
// Backend (FastAPI)
def require_admin(tenant_context: TenantContext = Depends(require_tenant_context)):
    user_role = tenant_context.user.get('role') if tenant_context.user else None
    if not user_role or user_role not in ['SUPER_ADMIN', 'ADMIN']:
        raise HTTPException(status_code=403, detail="Access denied")
    return tenant_context

// Frontend (Next.js API Routes)
export const GET = withAuthAndPermission(
  Permission.USER_MANAGE,
  async (context, request) => {
    // Handler logic
  }
)
```

### Permission Matrix

| Feature | SUPER_ADMIN | ADMIN | Others |
|---------|------------|-------|--------|
| View Dashboard | ✅ | ✅ | ❌ |
| User Management | ✅ | ✅ | ❌ |
| Tenant Management | ✅ | ⚠️ (Own tenant) | ❌ |
| System Health | ✅ | ✅ | ❌ |
| Security Dashboard | ✅ | ✅ | ❌ |
| Feature Toggles | ✅ | ❌ | ❌ |
| Export Reports | ✅ | ✅ | ❌ |
| Audit Logs | ✅ | ✅ (Own tenant) | ❌ |

---

## 📈 Performance Considerations

### Frontend Optimizations
- **Auto-refresh Intervals**: 30s for dashboard, 10s for system health, 30s for security
- **Pagination**: All large datasets paginated (50-100 items per page)
- **Lazy Loading**: Components loaded on demand
- **Memoization**: React.memo for expensive components

### Backend Optimizations
- **Connection Pooling**: asyncpg connection pool for PostgreSQL
- **Query Optimization**: Indexes on frequently queried columns
- **Caching**: (Future) Redis for frequently accessed data
- **Rate Limiting**: Prevents abuse

### Database Indexes (Recommended)

```sql
-- User table indexes
CREATE INDEX idx_user_role ON "User"(role);
CREATE INDEX idx_user_tenant ON "User"("tenantId");
CREATE INDEX idx_user_created ON "User"("createdAt");

-- API logs indexes
CREATE INDEX idx_logs_timestamp ON api_logs(timestamp);
CREATE INDEX idx_logs_status ON api_logs(status_code);
CREATE INDEX idx_logs_endpoint ON api_logs(endpoint);
CREATE INDEX idx_logs_user ON api_logs(user_id);

-- Document indexes
CREATE INDEX idx_doc_tenant ON "Document"("tenantId");
CREATE INDEX idx_doc_type ON "Document"("fileType");
CREATE INDEX idx_doc_created ON "Document"("createdAt");
```

---

## 🐛 Troubleshooting

### Common Issues

#### 1. "Failed to fetch admin data"
- **Cause**: Backend not running or CORS issues
- **Solution**: Check backend is running at `NEXT_PUBLIC_BACKEND_URL`, verify CORS settings

#### 2. "Access denied. Admin role required."
- **Cause**: User doesn't have SUPER_ADMIN or ADMIN role
- **Solution**: Update user role in database

#### 3. "Tenant table doesn't exist"
- **Cause**: Database migrations not run
- **Solution**: Admin panel handles this automatically with fallbacks

#### 4. System health shows "Failed to load"
- **Cause**: Backend missing `psutil` package
- **Solution**: `pip install psutil`

#### 5. Export downloads empty file
- **Cause**: No data matching filters
- **Solution**: Adjust date range or filters

---

## 🚀 Future Enhancements

### Priority 1: Real-time Features
- [ ] WebSocket integration for live updates
- [ ] Real-time alert notifications
- [ ] Live user activity tracking
- [ ] Real-time system metrics

### Priority 2: Advanced Analytics
- [ ] Custom dashboard widgets
- [ ] Drag-and-drop dashboard builder
- [ ] Comparison views (time periods, tenants)
- [ ] Predictive cost analytics
- [ ] ML-based anomaly detection

### Priority 3: Automation
- [ ] Scheduled reports (email delivery)
- [ ] Auto-scaling recommendations
- [ ] Automated backups
- [ ] Smart alerting rules

### Priority 4: Integration
- [ ] Third-party integrations management
- [ ] API key management UI
- [ ] Webhook configuration
- [ ] SSO configuration

### Priority 5: Mobile
- [ ] Progressive Web App (PWA)
- [ ] Mobile-optimized dashboard
- [ ] Push notifications
- [ ] Offline support

---

## 📚 API Documentation

Full API documentation available at:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

---

## 🤝 Contributing

When adding new admin features:

1. **Follow 10x Ideology**: Build comprehensive, production-ready features
2. **Add to Admin Router**: Include backend endpoint in `routers/admin.py`
3. **Create API Proxy**: Add Next.js route in `app/api/admin/`
4. **Update Frontend**: Add tab/component to admin dashboard
5. **Document**: Update this guide with new features
6. **Test**: Ensure RBAC enforcement works correctly
7. **Security Review**: Validate no data leakage between tenants

---

## 📞 Support

For questions or issues:
- Check troubleshooting section
- Review API documentation
- Check console logs (browser + backend)
- Verify user has correct role permissions

---

**Built with ❤️ using 10x Development Ideology**

