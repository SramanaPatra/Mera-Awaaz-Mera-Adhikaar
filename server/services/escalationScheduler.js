import { dbState } from '../db.js';

export function runEscalationCheck(thresholdHours = 48) {
  const now = new Date().getTime();
  const thresholdMs = thresholdHours * 60 * 60 * 1000;

  let escalatedCount = 0;

  dbState.complaints.forEach(complaint => {
    if (complaint.status === 'Pending' || complaint.status === 'Under Investigation') {
      const reportedTime = new Date(complaint.reported_at).getTime();
      if (now - reportedTime > thresholdMs) {
        const prev = complaint.status;
        complaint.status = 'Escalated';
        escalatedCount++;

        dbState.logs.push({
          id: dbState.logs.length + 1,
          complaint_id: complaint.id,
          previous_status: prev,
          new_status: 'Escalated',
          action_by: 'AUTOMATED_48HR_SLA_CRON',
          action_timestamp: new Date().toISOString()
        });
      }
    }
  });

  return {
    timestamp: new Date().toISOString(),
    thresholdHours,
    escalatedCount,
    totalEscalated: dbState.complaints.filter(c => c.status === 'Escalated').length
  };
}
