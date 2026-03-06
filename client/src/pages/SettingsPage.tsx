import React from 'react'
import { DashboardLayout } from '@/components/layout'
import { SectionHeading, Card, CardBody, CardHeader, Button, Tabs } from '@/components/ui'
import { Bell, Eye } from 'lucide-react'

const SettingsPage: React.FC = () => {
  const { theme } = useTheme()

  const tabs = [
    {
      id: 'appearance',
      label: 'Appearance',
      content: (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-text-primary dark:text-text-dark-primary flex items-center space-x-2">
              <Eye className="w-5 h-5" />
              <span>Appearance Settings</span>
            </h3>
          </CardHeader>
          <CardBody className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-text-primary dark:text-text-dark-primary">
                  Dark Mode
                </h4>
                <p className="text-sm text-text-secondary dark:text-text-dark-secondary">
                  Currently: {theme === 'dark' ? 'Enabled' : 'Disabled'}
                </p>
              </div>
              <Button size="sm" onClick={toggleTheme}>
                 Toggle Dark Mode
              </Button>
            </div>
          </CardBody>
        </Card>
      ),
    },
    {
      id: 'notifications',
      label: 'Notifications',
      content: (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-text-primary dark:text-text-dark-primary flex items-center space-x-2">
              <Bell className="w-5 h-5" />
              <span>Notification Settings</span>
            </h3>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-text-primary dark:text-text-dark-primary">
                  Email Notifications
                </h4>
              </div>
              <input type="checkbox" defaultChecked className="w-5 h-5" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-text-primary dark:text-text-dark-primary">
                  Course Updates
                </h4>
              </div>
              <input type="checkbox" defaultChecked className="w-5 h-5" />
            </div>
          </CardBody>
        </Card>
      ),
    },
    {
      id: 'security',
      label: 'Security',
      content: (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-text-primary dark:text-text-dark-primary flex items-center space-x-2">
              <Lock className="w-5 h-5" />
              <span>Security Settings</span>
            </h3>
          </CardHeader>
          <CardBody className="space-y-6">
            <Button variant="outline" className="w-full">
              Change Password
            </Button>
            <Button variant="outline" className="w-full">
              Enable Two-Factor Authentication
            </Button>
          </CardBody>
        </Card>
      ),
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <SectionHeading
          title="Settings"
          subtitle="Manage your account preferences"
        />

        <Tabs tabs={tabs} defaultTab="appearance" />
      </div>
    </DashboardLayout>
  )
}

export default SettingsPage
