import React from 'react';
import CommonNotificationsPage from '../../components/common/CommonNotificationsPage';

export default function NotificationPageWrapper() {
  return (
    <CommonNotificationsPage 
      roleTitle="Team Notifications" 
      roleSubtitle="Stay updated on tournament approvals, match schedules, and team alerts." 
    />
  );
}