import React from 'react';
import { DiscussionPage as SharedDiscussionPage } from '../../ta-dashboard/components/DiscussionPage';

export function DiscussionPage() {
  return (
    <SharedDiscussionPage
      userRole="instructor"
      userName="Dr. Jane Smith"
    />
  );
}

export default DiscussionPage;
