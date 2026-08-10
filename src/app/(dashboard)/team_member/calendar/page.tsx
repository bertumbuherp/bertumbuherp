'use client';

import dynamic from 'next/dynamic';

const CalendarView = dynamic(
  () => import('@/components/views/CalendarView').then(mod => mod.CalendarView),
  { ssr: false }
);

export default function TeamCalendarPage() {
  return <CalendarView role="Team Member" />;
}
