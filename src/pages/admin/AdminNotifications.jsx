import React from 'react';
import CommonNotificationsPage from '../../components/common/CommonNotificationsPage';

export default function AdminNotifications() {
  return (
    <CommonNotificationsPage 
      roleTitle="System Notifications" 
      roleSubtitle="Monitor system-wide announcements, deletion requests, and administrative audit logs." 
    />
  );
}