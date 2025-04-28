const Election = require('../models/Election');

/**
 * Updates the status of all elections based on their start and end dates
 */
async function updateElectionStatus() {
  try {
    const now = new Date();
    
    // Find and update upcoming elections that should now be ongoing
    await Election.updateMany(
      {
        status: 'Upcoming',
        startDate: { $lte: now }
      },
      { status: 'Ongoing' }
    );
    
    // Find and update ongoing elections that should now be ended
    await Election.updateMany(
      {
        status: 'Ongoing',
        endDate: { $lte: now }
      },
      { status: 'Ended' }
    );
    
    console.log('Election statuses updated');
  } catch (error) {
    console.error('Error updating election statuses:', error);
  }
}

module.exports = updateElectionStatus;