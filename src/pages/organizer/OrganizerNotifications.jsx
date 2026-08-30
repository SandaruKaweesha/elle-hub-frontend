import React from 'react';
import CommonNotificationsPage from '../../components/common/CommonNotificationsPage';

export default function NotificationPageWrapper() {
  return (
    <CommonNotificationsPage 
      roleTitle="Organizer Notifications" 
      roleSubtitle="Stay updated on tournament approvals, user registrations, and system broadcasts." 
    />
  );
}