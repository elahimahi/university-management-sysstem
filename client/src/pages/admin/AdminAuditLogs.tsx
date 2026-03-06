import React from 'react'
import { DashboardLayout } from '@/components/layout'
import { SectionHeading, EmptyState } from '@/components/ui'

const AdminAuditLogs: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <SectionHeading
          title="Audit Logs"
          subtitle="System activity and changes"
        />
        <EmptyState
          title="No audit logs found"
          description="System activity will be logged here"
        />
      </div>
    </DashboardLayout>
  )
}

export default AdminAuditLogs
