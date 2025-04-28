import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from '../../api/axios';
import { useAuth } from '../../contexts/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [eligibleElections, setEligibleElections] = useState([]);
  const [candidateApplications, setCandidateApplications] = useState([]);
  const [votingHistory, setVotingHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // Fetch eligible elections
        const electionsResponse = await axios.get('/elections/eligible');
        setEligibleElections(electionsResponse.data);
        
        // Fetch candidate applications
        const candidatesResponse = await axios.get('/candidates', {
          params: { userId: user._id }
        });
        setCandidateApplications(candidatesResponse.data.filter(app => 
          app.userId._id === user._id
        ));
        
        // Fetch voting history
        const votesResponse = await axios.get('/votes/user');
        setVotingHistory(votesResponse.data);
        
        setError(null);
      } catch (err) {
        console.error(err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user._id]);

  const ongoingElections = eligibleElections.filter(
    election => election.status === 'Ongoing'
  );

  const upcomingElections = eligibleElections.filter(
    election => election.status === 'Upcoming'
  );

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4 }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16"
        >
          <svg className="w-full h-full text-primary-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-10"
    >
      {/* Header */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-2"
      >
        <motion.h1 variants={itemVariants} className="text-3xl font-bold text-gray-900">
          Welcome, {user.name}
        </motion.h1>
        <motion.p variants={itemVariants} className="text-gray-600 text-lg">
          Your personal voting dashboard
        </motion.p>
      </motion.div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-red-50 border-l-4 border-red-500 p-4 rounded"
        >
          <p className="text-red-700">{error}</p>
        </motion.div>
      )}

      {/* Active elections section */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="bg-white rounded-xl shadow-sm overflow-hidden"
      >
        <motion.div variants={itemVariants} className="px-6 py-5 border-b border-gray-200 bg-gray-50">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <svg className="w-5 h-5 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Ongoing Elections ({ongoingElections.length})
          </h2>
        </motion.div>

        <div className="divide-y divide-gray-200">
          {ongoingElections.length === 0 ? (
            <motion.div variants={itemVariants} className="px-6 py-8 text-center">
              <p className="text-gray-500">There are no ongoing elections you're eligible to vote in.</p>
            </motion.div>
          ) : (
            ongoingElections.map(election => {
              // Check if user has already voted in this election
              const hasVoted = votingHistory.some(
                vote => vote.electionId._id === election._id
              );
              
              return (
                <motion.div 
                  key={election._id} 
                  variants={itemVariants}
                  className="px-6 py-4 flex justify-between items-center"
                >
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {election.title}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Ends on {new Date(election.endDate).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="flex gap-3">
                    {hasVoted ? (
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                        Vote Cast
                      </span>
                    ) : (
                      <Link 
                        to={`/user/vote/${election._id}`}
                        className="btn btn-primary"
                      >
                        Vote Now
                      </Link>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </motion.div>
      
      {/* Upcoming elections */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="bg-white rounded-xl shadow-sm overflow-hidden"
      >
        <motion.div variants={itemVariants} className="px-6 py-5 border-b border-gray-200 bg-gray-50">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Upcoming Elections ({upcomingElections.length})
          </h2>
        </motion.div>

        <div className="divide-y divide-gray-200">
          {upcomingElections.length === 0 ? (
            <motion.div variants={itemVariants} className="px-6 py-8 text-center">
              <p className="text-gray-500">There are no upcoming elections you're eligible for.</p>
            </motion.div>
          ) : (
            upcomingElections.map(election => (
              <motion.div 
                key={election._id} 
                variants={itemVariants}
                className="px-6 py-4"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {election.title}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Starts on {new Date(election.startDate).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <Link 
                    to={`/elections/${election._id}`}
                    className="text-primary-600 hover:text-primary-700 font-medium"
                  >
                    View Details
                  </Link>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>

      {/* Candidate applications */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="bg-white rounded-xl shadow-sm overflow-hidden"
      >
        <motion.div variants={itemVariants} className="px-6 py-5 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <svg className="w-5 h-5 mr-2 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Your Candidate Applications ({candidateApplications.length})
          </h2>
          
          <Link to="/user/apply" className="btn btn-secondary">
            Apply Now
          </Link>
        </motion.div>

        <div className="divide-y divide-gray-200">
          {candidateApplications.length === 0 ? (
            <motion.div variants={itemVariants} className="px-6 py-8 text-center">
              <p className="text-gray-500">You haven't applied as a candidate for any elections yet.</p>
            </motion.div>
          ) : (
            candidateApplications.map(application => {
              let statusBadge;
              
              switch (application.status) {
                case 'Pending':
                  statusBadge = (
                    <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                      Pending Approval
                    </span>
                  );
                  break;
                case 'Verified':
                  statusBadge = (
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                      Approved
                    </span>
                  );
                  break;
                case 'Rejected':
                  statusBadge = (
                    <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                      Rejected
                    </span>
                  );
                  break;
                default:
                  statusBadge = (
                    <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                      {application.status}
                    </span>
                  );
              }
              
              return (
                <motion.div 
                  key={application._id} 
                  variants={itemVariants}
                  className="px-6 py-4"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {application.electionId.title}
                      </h3>
                      <p className="text-gray-600 text-sm mt-1">
                        Applied on {new Date(application.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    
                    {statusBadge}
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </motion.div>

      {/* Voting history */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="bg-white rounded-xl shadow-sm overflow-hidden"
      >
        <motion.div variants={itemVariants} className="px-6 py-5 border-b border-gray-200 bg-gray-50">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            Your Voting History ({votingHistory.length})
          </h2>
        </motion.div>

        <div className="divide-y divide-gray-200">
          {votingHistory.length === 0 ? (
            <motion.div variants={itemVariants} className="px-6 py-8 text-center">
              <p className="text-gray-500">You haven't voted in any elections yet.</p>
            </motion.div>
          ) : (
            votingHistory.map(vote => (
              <motion.div 
                key={vote._id} 
                variants={itemVariants}
                className="px-6 py-4"
              >
                <h3 className="text-lg font-medium text-gray-900">
                  {vote.electionId.title}
                </h3>
                <p className="text-gray-600 mt-1">
                  You voted for: <span className="font-medium">{vote.candidateId.userId.name}</span>
                </p>
                <p className="text-gray-500 text-sm mt-1">
                  Vote cast on {new Date(vote.createdAt).toLocaleDateString()}
                </p>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;