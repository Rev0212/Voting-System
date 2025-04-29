const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const User = require('../models/User');
const Election = require('../models/Election');
const Candidate = require('../models/Candidate');
const Vote = require('../models/Vote');

/**
 * @route   GET api/admin/stats
 * @desc    Get admin dashboard statistics
 * @access  Private/Admin
 */
router.get('/stats', protect, authorize('admin'), async (req, res) => {
  try {
    // Get counts from all collections
    const [
      totalUsers,
      totalElections,
      totalVotes,
      totalCandidates,
      ongoingElections,
      pendingApplications
    ] = await Promise.all([
      User.countDocuments(),
      Election.countDocuments(),
      Vote.countDocuments(),
      Candidate.countDocuments({ status: 'Verified' }),
      Election.countDocuments({ status: 'Ongoing' }),
      Candidate.countDocuments({ status: 'Pending' })
    ]);

    res.json({
      totalUsers,
      totalElections,
      totalVotes,
      totalCandidates,
      ongoingElections,
      pendingApplications
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET api/admin/election-stats
 * @desc    Get election statistics for dashboard
 * @access  Private/Admin
 */
router.get('/election-stats', protect, authorize('admin'), async (req, res) => {
  try {
    // Get elections by status
    const [upcomingCount, ongoingCount, endedCount] = await Promise.all([
      Election.countDocuments({ status: 'Upcoming' }),
      Election.countDocuments({ status: 'Ongoing' }),
      Election.countDocuments({ status: 'Ended' })
    ]);

    // Get votes per election
    const elections = await Election.find().sort('-startDate').limit(5);
    
    const votesPerElection = await Promise.all(
      elections.map(async (election) => {
        const count = await Vote.countDocuments({ electionId: election._id });
        return {
          name: election.title,
          votes: count
        };
      })
    );
    
    // Calculate voter turnout
    const totalEligibleUsers = await User.countDocuments();
    const totalVoters = await Vote.aggregate([
      { $group: { _id: '$userId' } },
      { $count: 'count' }
    ]);
    
    const voterTurnout = totalEligibleUsers > 0 
      ? (((totalVoters[0]?.count || 0) / totalEligibleUsers) * 100).toFixed(1) + '%'
      : '0%';

    res.json({
      upcoming: upcomingCount,
      ongoing: ongoingCount,
      ended: endedCount,
      votesPerElection,
      voterTurnout
    });
  } catch (error) {
    console.error('Error fetching election stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET api/admin/recent-activity
 * @desc    Get recent activity for admin dashboard
 * @access  Private/Admin
 */
router.get('/recent-activity', protect, authorize('admin'), async (req, res) => {
  try {
    // Get recent votes
    const recentVotes = await Vote.find()
      .sort('-createdAt')
      .limit(5)
      .populate('userId', 'name')
      .populate('electionId', 'title')
      .populate({
        path: 'candidateId',
        populate: { path: 'userId', select: 'name' }
      });
    
    // Get recent candidate applications
    const recentCandidates = await Candidate.find()
      .sort('-createdAt')
      .limit(5)
      .populate('userId', 'name')
      .populate('electionId', 'title');
      
    // Get recently created elections
    const recentElections = await Election.find()
      .sort('-createdAt')
      .limit(3)
      .populate('createdBy', 'name');
    
    // Combine and format activities
    const activities = [
      ...recentVotes.map(vote => ({
        type: 'vote',
        message: `${vote.userId.name} voted for ${vote.candidateId.userId.name} in ${vote.electionId.title}`,
        timestamp: vote.createdAt
      })),
      ...recentCandidates.map(candidate => ({
        type: 'candidate',
        message: `${candidate.userId.name} applied as a candidate for ${candidate.electionId.title}`,
        timestamp: candidate.createdAt
      })),
      ...recentElections.map(election => ({
        type: 'election',
        message: `New election "${election.title}" was created by ${election.createdBy.name}`,
        timestamp: election.createdAt
      }))
    ];
    
    // Sort by timestamp (newest first)
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    res.json(activities.slice(0, 10)); // Return the 10 most recent activities
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET api/admin/analytics
 * @desc    Get advanced analytics
 * @access  Private/Admin
 */
router.get('/analytics', protect, authorize('admin'), async (req, res) => {
  try {
    // Voter engagement metrics
    const totalUsers = await User.countDocuments();
    const usersWhoVoted = await Vote.aggregate([
      { $group: { _id: '$userId' } },
      { $count: 'count' }
    ]);
    
    const voterParticipationRate = totalUsers > 0 
      ? ((usersWhoVoted[0]?.count || 0) / totalUsers)
      : 0;
    
    // Time-based voting patterns
    const votingHourDistribution = await Vote.aggregate([
      {
        $project: {
          hour: { $hour: '$createdAt' }
        }
      },
      {
        $group: {
          _id: '$hour',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);
    
    // Format hours for chart (0-23 hours)
    const hourlyVotes = Array(24).fill(0);
    votingHourDistribution.forEach(item => {
      hourlyVotes[item._id] = item.count;
    });
    
    // Election competitiveness
    const electionCompetitiveness = await Vote.aggregate([
      {
        $group: {
          _id: {
            electionId: '$electionId',
            candidateId: '$candidateId'
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.electionId',
          candidates: {
            $push: {
              candidateId: '$_id.candidateId',
              votes: '$count'
            }
          }
        }
      }
    ]);
    
    // Calculate competitiveness scores (higher = more competitive)
    const competitivenessData = await Promise.all(
      electionCompetitiveness.map(async (election) => {
        const electionInfo = await Election.findById(election._id);
        if (!electionInfo) return null;
        
        // Skip elections with less than 2 candidates with votes
        if (election.candidates.length < 2) return null;
        
        // Sort by votes descending
        const sortedCandidates = [...election.candidates].sort((a, b) => b.votes - a.votes);
        
        // Calculate margin between top 2 candidates (lower = more competitive)
        const margin = sortedCandidates[0].votes - sortedCandidates[1].votes;
        const totalVotes = sortedCandidates.reduce((sum, c) => sum + c.votes, 0);
        
        // Competitiveness score: 1 - (margin / total votes)
        // Higher score = more competitive (closer race)
        const competitivenessScore = totalVotes > 0 
          ? 1 - (margin / totalVotes)
          : 0;
          
        return {
          electionId: election._id,
          title: electionInfo.title,
          status: electionInfo.status,
          totalVotes,
          competitivenessScore: parseFloat(competitivenessScore.toFixed(2))
        };
      })
    );
    
    // Filter out null values
    const competitiveness = competitivenessData.filter(item => item !== null);
    
    res.json({
      voterEngagement: {
        participationRate: voterParticipationRate.toFixed(2),
        totalVoters: usersWhoVoted[0]?.count || 0,
        totalEligibleUsers: totalUsers
      },
      timeBasedAnalytics: {
        hourlyVotes
      },
      electionCompetitiveness: competitiveness
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;