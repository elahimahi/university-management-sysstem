import React from 'react';
import Card from '../ui/Card';
import StatCard from '../ui/StatCard';
import SectionHeading from '../ui/SectionHeading';
import Button from '../ui/Button';
import Footer from '../components/layout/Footer';
import { AcademicCapIcon, UserGroupIcon, ShieldCheckIcon, LightningBoltIcon, ChartBarIcon } from '@heroicons/react/outline';

const modules = [
  { icon: <AcademicCapIcon className="w-8 h-8 text-blue-600" />, title: 'Course Management', desc: 'Organize, schedule, and manage courses with ease.' },
  { icon: <UserGroupIcon className="w-8 h-8 text-green-600" />, title: 'User Roles', desc: 'Admin, Teacher, and Student dashboards.' },
  { icon: <ShieldCheckIcon className="w-8 h-8 text-purple-600" />, title: 'Attendance', desc: 'Track and manage attendance records.' },
  { icon: <LightningBoltIcon className="w-8 h-8 text-yellow-500" />, title: 'Results', desc: 'Publish and view academic results securely.' },
];

const metrics = [
  { label: 'Active Users', value: '2,500+' },
  { label: 'Courses Managed', value: '180+' },
  { label: 'Departments', value: '12' },
  { label: 'Avg. Uptime', value: '99.99%' },
];

const Home = () => (
  <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 transition-colors">
    {/* Hero Section */}
    <header className="container mx-auto px-4 pt-20 pb-16 text-center animate-fade-in">
      <h1 className="text-4xl md:text-5xl font-extrabold text-blue-800 dark:text-blue-200 mb-4 tracking-tight">University Management System</h1>
      <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8">Modern ERP for academic excellence, integrity, and efficiency.</p>
      <Button className="text-lg px-8 py-3 shadow-lg animate-bounce-slow">Get Started</Button>
    </header>

    {/* Core Modules Grid */}
    <section className="container mx-auto px-4 py-12 animate-fade-in-up">
      <SectionHeading>Core Modules</SectionHeading>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mt-6">
        {modules.map((mod) => (
          <Card key={mod.title} className="flex flex-col items-center gap-3 py-8 hover:shadow-xl transition-shadow duration-300">
            {mod.icon}
            <div className="font-semibold text-lg text-gray-800 dark:text-gray-100">{mod.title}</div>
            <div className="text-gray-500 text-sm text-center">{mod.desc}</div>
          </Card>
        ))}
      </div>
    </section>

    {/* How It Works */}
    <section className="container mx-auto px-4 py-12 animate-fade-in-up">
      <SectionHeading>How It Works</SectionHeading>
      <ol className="flex flex-col md:flex-row gap-8 justify-center items-center mt-6">
        <li className="flex flex-col items-center max-w-xs">
          <span className="bg-blue-100 text-blue-600 rounded-full w-12 h-12 flex items-center justify-center mb-2 text-xl font-bold">1</span>
          <div className="font-semibold mb-1">Register & Login</div>
          <div className="text-gray-500 text-sm text-center">Sign up as Admin, Teacher, or Student to access your dashboard.</div>
        </li>
        <li className="flex flex-col items-center max-w-xs">
          <span className="bg-blue-100 text-blue-600 rounded-full w-12 h-12 flex items-center justify-center mb-2 text-xl font-bold">2</span>
          <div className="font-semibold mb-1">Manage Academics</div>
          <div className="text-gray-500 text-sm text-center">Admins manage courses, teachers, and students. Teachers handle offerings and grades. Students enroll and view results.</div>
        </li>
        <li className="flex flex-col items-center max-w-xs">
          <span className="bg-blue-100 text-blue-600 rounded-full w-12 h-12 flex items-center justify-center mb-2 text-xl font-bold">3</span>
          <div className="font-semibold mb-1">Track & Report</div>
          <div className="text-gray-500 text-sm text-center">Attendance, results, and audit logs ensure transparency and academic integrity.</div>
        </li>
      </ol>
    </section>

    {/* Role Based Access */}
    <section className="container mx-auto px-4 py-12 animate-fade-in-up">
      <SectionHeading>Role Based Access</SectionHeading>
      <div className="flex flex-col md:flex-row gap-6 justify-center items-stretch mt-6">
        <Card className="flex-1 text-center py-8 border-t-4 border-blue-500">
          <div className="font-bold text-blue-700 dark:text-blue-300 text-lg mb-2">Admin</div>
          <div className="text-gray-500 text-sm">Full control over departments, courses, users, and audit logs.</div>
        </Card>
        <Card className="flex-1 text-center py-8 border-t-4 border-green-500">
          <div className="font-bold text-green-700 dark:text-green-300 text-lg mb-2">Teacher</div>
          <div className="text-gray-500 text-sm">Manage course offerings, attendance, and grade submissions.</div>
        </Card>
        <Card className="flex-1 text-center py-8 border-t-4 border-yellow-500">
          <div className="font-bold text-yellow-700 dark:text-yellow-400 text-lg mb-2">Student</div>
          <div className="text-gray-500 text-sm">Enroll in courses, track attendance, and view results.</div>
        </Card>
      </div>
    </section>

    {/* Academic Integrity */}
    <section className="container mx-auto px-4 py-12 animate-fade-in-up">
      <SectionHeading>Academic Integrity</SectionHeading>
      <div className="flex flex-col md:flex-row gap-6 items-center">
        <Card className="flex-1 flex items-center gap-4 p-6">
          <ShieldCheckIcon className="w-12 h-12 text-purple-600" />
          <div>
            <div className="font-semibold text-lg text-gray-800 dark:text-gray-100">Secure & Auditable</div>
            <div className="text-gray-500 text-sm">All actions are logged and monitored for compliance and transparency.</div>
          </div>
        </Card>
        <Card className="flex-1 flex items-center gap-4 p-6">
          <LightningBoltIcon className="w-12 h-12 text-yellow-500" />
          <div>
            <div className="font-semibold text-lg text-gray-800 dark:text-gray-100">Fast & Reliable</div>
            <div className="text-gray-500 text-sm">Robust infrastructure ensures high availability and performance.</div>
          </div>
        </Card>
      </div>
    </section>

    {/* Impact Metrics */}
    <section className="container mx-auto px-4 py-12 animate-fade-in-up">
      <SectionHeading>Impact Metrics</SectionHeading>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-6">
        {metrics.map((m) => (
          <StatCard key={m.label} label={m.label} value={m.value} />
        ))}
      </div>
    </section>

    {/* Final CTA */}
    <section className="container mx-auto px-4 py-16 text-center animate-fade-in-up">
      <h2 className="text-2xl md:text-3xl font-bold mb-4 text-blue-800 dark:text-blue-200">Ready to transform your campus?</h2>
      <Button className="text-lg px-8 py-3 shadow-lg">Request a Demo</Button>
    </section>

    {/* Footer */}
    <Footer />
  </div>
);

export default Home;
