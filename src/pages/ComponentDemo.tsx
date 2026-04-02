import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  AnimatedButton,
  CourseCard,
  FacultyCard,
  StatsCard,
  EventCard,
  TextInput,
  Select,
  FileUpload,
  Checkbox,
  RadioGroup,
  Modal,
  ConfirmModal,
  FormModal,
  Navbar,
  Breadcrumbs,
  Tabs,
  Skeleton,
  CardSkeleton,
  ListSkeleton,
  ProgressBar,
  CircularProgress,
  Tooltip,
  toast
} from '../components/ui';
import { staggerContainerVariants, fadeInVariants } from '../constants/animations.constants';

const ComponentDemo: React.FC = () => {
  // State for demonstrations
  const [inputValue, setInputValue] = useState('');
  const [selectValue, setSelectValue] = useState('');
  const [isChecked, setIsChecked] = useState(false);
  const [radioValue, setRadioValue] = useState('option1');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('tab1');
  const [progress, setProgress] = useState(65);

  // Mock data
  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'Courses', href: '/courses' },
    { label: 'About', href: '/about' },
  ];

  const selectOptions = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
  ];

  const radioOptions = [
    { value: 'option1', label: 'Option 1', description: 'Description for option 1' },
    { value: 'option2', label: 'Option 2', description: 'Description for option 2' },
    { value: 'option3', label: 'Option 3', description: 'Description for option 3' },
  ];

  const tabs = [
    { 
      id: 'tab1', 
      label: 'Overview', 
      content: <div className="p-4">Overview content with detailed information</div> 
    },
    { 
      id: 'tab2', 
      label: 'Details', 
      content: <div className="p-4">Details content with specifications</div> 
    },
    { 
      id: 'tab3', 
      label: 'Settings', 
      content: <div className="p-4">Settings content with configuration options</div> 
    },
  ];

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Components', href: '/components' },
    { label: 'Demo' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-50 to-gold-50 dark:from-navy-950 dark:to-navy-900">
      {/* Navbar */}
      <Navbar items={navItems} />

      <div className="container mx-auto px-4 py-24">
        <motion.div
          variants={staggerContainerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-16"
        >
          {/* Header */}
          <motion.div variants={fadeInVariants} className="text-center">
            <h1 className="text-5xl font-display font-bold gradient-text mb-4">
              UI Component Library
            </h1>
            <p className="text-xl text-navy-600 dark:text-navy-300">
              Comprehensive collection of reusable, animated components
            </p>
          </motion.div>

          {/* Breadcrumbs */}
          <motion.section variants={fadeInVariants} className="card">
            <h2 className="text-2xl font-display font-bold text-navy-900 dark:text-white mb-6">
              Breadcrumbs
            </h2>
            <Breadcrumbs items={breadcrumbItems} />
          </motion.section>

          {/* Buttons */}
          <motion.section variants={fadeInVariants} className="card">
            <h2 className="text-2xl font-display font-bold text-navy-900 dark:text-white mb-6">
              Animated Buttons
            </h2>
            <div className="flex flex-wrap gap-4">
              <AnimatedButton variant="primary">Primary</AnimatedButton>
              <AnimatedButton variant="secondary">Secondary</AnimatedButton>
              <AnimatedButton variant="outline">Outline</AnimatedButton>
              <AnimatedButton variant="success">Success</AnimatedButton>
              <AnimatedButton variant="danger">Danger</AnimatedButton>
              <AnimatedButton variant="primary" isLoading>Loading</AnimatedButton>
              <AnimatedButton variant="primary" size="sm">Small</AnimatedButton>
              <AnimatedButton variant="primary" size="lg">Large</AnimatedButton>
            </div>
          </motion.section>

          {/* Cards */}
          <motion.section variants={fadeInVariants} className="space-y-6">
            <h2 className="text-2xl font-display font-bold text-navy-900 dark:text-white">
              Card Components
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <CourseCard
                title="Introduction to Computer Science"
                code="CS101"
                instructor="Dr. John Smith"
                duration="12 weeks"
                students={150}
                level="Beginner"
              />
              
              <FacultyCard
                name="Dr. Jane Doe"
                designation="Professor"
                department="Computer Science"
                email="jane.doe@university.edu"
                phone="+1 (555) 123-4567"
                specialization={['AI', 'Machine Learning', 'Data Science']}
              />
              
              <StatsCard
                title="Total Students"
                value={2500}
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                }
                color="navy"
                trend={{ value: 12.5, isPositive: true }}
              />
            </div>

            <EventCard
              title="Annual Tech Summit 2024"
              description="Join us for the biggest technology conference of the year featuring keynote speakers, workshops, and networking opportunities."
              date={new Date('2024-06-15T09:00:00')}
              location="Main Auditorium, Building A"
              category="Conference"
              attendees={500}
              status="upcoming"
            />
          </motion.section>

          {/* Inputs */}
          <motion.section variants={fadeInVariants} className="card space-y-6">
            <h2 className="text-2xl font-display font-bold text-navy-900 dark:text-white">
              Input Components
            </h2>
            
            <TextInput
              label="Email Address"
              type="email"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              helperText="We'll never share your email"
              required
              fullWidth
            />

            <Select
              label="Select Option"
              options={selectOptions}
              value={selectValue}
              onChange={(e) => setSelectValue(e.target.value)}
              fullWidth
              searchable
            />

            <FileUpload
              label="Upload Files"
              accept=".pdf,.doc,.docx"
              multiple
              maxSize={5}
              helperText="Upload PDF or Word documents (Max 5MB)"
            />

            <Checkbox
              label="Accept Terms and Conditions"
              checked={isChecked}
              onChange={(e) => setIsChecked(e.target.checked)}
              description="I agree to the terms and conditions"
            />

            <RadioGroup
              label="Choose an option"
              name="demo"
              options={radioOptions}
              value={radioValue}
              onChange={setRadioValue}
            />
          </motion.section>

          {/* Tabs */}
          <motion.section variants={fadeInVariants} className="card">
            <h2 className="text-2xl font-display font-bold text-navy-900 dark:text-white mb-6">
              Tabs
            </h2>
            <Tabs tabs={tabs} defaultTab="tab1" onChange={setActiveTab} />
          </motion.section>

          {/* Progress */}
          <motion.section variants={fadeInVariants} className="card space-y-6">
            <h2 className="text-2xl font-display font-bold text-navy-900 dark:text-white">
              Progress Indicators
            </h2>
            
            <div className="space-y-4">
              <ProgressBar value={progress} showLabel label="Course Progress" />
              <ProgressBar value={80} variant="success" showLabel label="Assignments" />
              <ProgressBar value={45} variant="warning" showLabel label="Attendance" />
            </div>

            <div className="flex gap-8 justify-center">
              <CircularProgress value={75} label="Overall" />
              <CircularProgress value={90} variant="success" label="Grades" />
              <CircularProgress value={60} variant="warning" label="Participation" />
            </div>
          </motion.section>

          {/* Skeletons */}
          <motion.section variants={fadeInVariants} className="card space-y-6">
            <h2 className="text-2xl font-display font-bold text-navy-900 dark:text-white">
              Loading Skeletons
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <CardSkeleton />
              <CardSkeleton />
            </div>
            <ListSkeleton items={3} />
          </motion.section>

          {/* Modals & Toasts */}
          <motion.section variants={fadeInVariants} className="card">
            <h2 className="text-2xl font-display font-bold text-navy-900 dark:text-white mb-6">
              Modals & Notifications
            </h2>
            
            <div className="flex flex-wrap gap-4">
              <AnimatedButton variant="primary" onClick={() => setIsModalOpen(true)}>
                Open Modal
              </AnimatedButton>
              <AnimatedButton variant="secondary" onClick={() => setIsConfirmOpen(true)}>
                Confirm Dialog
              </AnimatedButton>
              <AnimatedButton variant="secondary" onClick={() => setIsFormModalOpen(true)}>
                Form Modal
              </AnimatedButton>
              <AnimatedButton variant="success" onClick={() => toast.success('Success message!')}>
                Success Toast
              </AnimatedButton>
              <AnimatedButton variant="danger" onClick={() => toast.error('Error message!')}>
                Error Toast
              </AnimatedButton>
              <Tooltip content="This is a helpful tooltip!" position="top">
                <AnimatedButton variant="outline">Hover for Tooltip</AnimatedButton>
              </Tooltip>
            </div>
          </motion.section>

          {/* Tooltips */}
          <motion.section variants={fadeInVariants} className="card">
            <h2 className="text-2xl font-display font-bold text-navy-900 dark:text-white mb-6">
              Tooltips
            </h2>
            <div className="flex flex-wrap gap-4">
              <Tooltip content="Top tooltip" position="top">
                <AnimatedButton variant="outline">Top</AnimatedButton>
              </Tooltip>
              <Tooltip content="Bottom tooltip" position="bottom">
                <AnimatedButton variant="outline">Bottom</AnimatedButton>
              </Tooltip>
              <Tooltip content="Left tooltip" position="left">
                <AnimatedButton variant="outline">Left</AnimatedButton>
              </Tooltip>
              <Tooltip content="Right tooltip" position="right">
                <AnimatedButton variant="outline">Right</AnimatedButton>
              </Tooltip>
            </div>
          </motion.section>
        </motion.div>
      </div>

      {/* Modals */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Example Modal">
        <div className="space-y-4">
          <p className="text-navy-600 dark:text-navy-300">
            This is a basic modal with customizable content. You can put any React components inside.
          </p>
          <AnimatedButton variant="primary" onClick={() => setIsModalOpen(false)}>
            Close Modal
          </AnimatedButton>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={() => {
          toast.success('Action confirmed!');
          setIsConfirmOpen(false);
        }}
        title="Confirm Action"
        message="Are you sure you want to proceed with this action?"
        variant="warning"
      />

      <FormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={(e) => {
          e.preventDefault();
          toast.success('Form submitted!');
          setIsFormModalOpen(false);
        }}
        title="Example Form"
      >
        <TextInput label="Name" required fullWidth />
        <TextInput label="Email" type="email" required fullWidth />
        <Select label="Category" options={selectOptions} required fullWidth />
      </FormModal>
    </div>
  );
};

export default ComponentDemo;
