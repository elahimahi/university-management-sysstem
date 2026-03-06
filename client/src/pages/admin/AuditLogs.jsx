import React from 'react';
import Card from '../../ui/Card';
import SectionHeading from '../../ui/SectionHeading';

const dummyLogs = [
  { id: 1, action: 'User login', user: 'Alice', time: '2026-03-01 09:00' },
  { id: 2, action: 'Course created', user: 'Carol', time: '2026-03-02 10:30' },
  { id: 3, action: 'Grade submitted', user: 'Bob', time: '2026-03-03 14:15' },
];

const AuditLogs = () => (
  <div>
    <SectionHeading>Audit Logs</SectionHeading>
    <Card className="max-w-2xl mx-auto">
      <ul className="divide-y">
        {dummyLogs.map((log) => (
          <li key={log.id} className="py-3 flex flex-col md:flex-row md:items-center md:justify-between">
            <span className="font-semibold text-gray-700">{log.action}</span>
            <span className="text-xs text-gray-400">{log.user} &middot; {log.time}</span>
          </li>
        ))}
      </ul>
    </Card>
  </div>
);

export default AuditLogs;
