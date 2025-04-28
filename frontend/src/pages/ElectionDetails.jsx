import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from '../api/axios';
import { useAuth } from '../contexts/AuthContext';

const ElectionDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [election, setElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userIsEligible, setUserIsEligible] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    const fetchElectionData = async () => {
      try {
        setLoading(true);
        
        // Get election details
        const electionRes = await axios.get(`/elections/${id}`);
        setElection(electionRes.data);
        
        // Get verified candidates
        const candidatesRes = await axios.get('/candidates', {
          params: { electionId: id, status: 'Verified' }
        });
        setCandidates(candidatesRes.data);

        // Check eligibility and voting status if user is logged in
        if (user) {
          // Check if user is eligible
          const userRes = await axios.get('/auth/me');
          const isEligible = userRes.data.eligibleElections?.some(
            elId => elId === id || elId._id === id
          );
          setUserIsEligible(isEligible);
          
          // Check if user has already voted
          const votesRes = await axios.get('/votes/user');
          const alreadyVoted = votesRes.data.some(vote => 
            vote.electionId._id === id || vote.electionId === id
          );
          setHasVoted(alreadyVoted);
        }
        
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || 'Failed to load election details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchElectionData();
  }, [id, user]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Upcoming':
        return 'bg-blue-100 text-blue-800';
      case 'Ongoing':
        return 'bg-green-100 text-green-800';
      case 'Ended':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12"
        >
          <svg className="w-full h-full text-primary-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-red-50 border-l-4 border-red-500 p-4 max-w-xl mx-auto text-left"
        >
          <h3 className="text-lg font-medium text-red-800">Error</h3>
          <p className="mt-2 text-red-700">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 text-primary-600 hover:text-primary-800 font-medium"
          >
            &larr; Go Back
          </button>
        </motion.div>
      </div>
    );
  }

  if (!election) {
    return (
      <div className="text-center py-12">
        <p>Election not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Back button */}
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-primary-600 hover:text-primary-800 font-medium"
        >
          <svg className="mr-1 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </button>

        {/* Election header */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-primary-600 to-primary-700 text-white">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold">{election.title}</h1>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(election.status)}`}>
                {election.status}
              </span>
            </div>
            {election.createdBy && (
              <p className="mt-1 text-primary-100">
                Created by: {election.createdBy.name}
              </p>
            )}
          </div>
          
          <div className="p-6">
            <p className="text-gray-700 whitespace-pre-line">{election.description}</p>
            
            <div className="mt-6 bg-gray-50 p-4 rounded-lg grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Election Period</h3>
                <div className="mt-1 flex items-center text-gray-900">
                  <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>
                    <strong>Starts:</strong> {new Date(election.startDate).toLocaleDateString()} at {new Date(election.startDate).toLocaleTimeString()}
                    <br />
                    <strong>Ends:</strong> {new Date(election.endDate).toLocaleDateString()} at {new Date(election.endDate).toLocaleTimeString()}
                  </span>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Status</h3>
                <div className="mt-1">
                  {election.status === 'Upcoming' && (
                    <p className="text-blue-700">
                      This election has not started yet. It will begin on {new Date(election.startDate).toLocaleDateString()}.
                    </p>
                  )}
                  {election.status === 'Ongoing' && (
                    <p className="text-green-700">
                      This election is currently active. Voting is open until {new Date(election.endDate).toLocaleDateString()}.
                    </p>
                  )}
                  {election.status === 'Ended' && (
                    <p className="text-gray-700">
                      This election has ended. Results are now available.
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Action buttons based on status */}
            <div className="mt-6 flex flex-wrap gap-4">
              {user ? (
                <>
                  {election.status === 'Ongoing' && userIsEligible && !hasVoted && (
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Link
                        to={`/user/vote/${election._id}`}
                        className="btn btn-primary inline-flex items-center"
                      >
                        <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Vote Now
                      </Link>
                    </motion.div>
                  )}
                  
                  {election.status === 'Ongoing' && userIsEligible && hasVoted && (
                    <div className="inline-flex items-center px-4 py-2 border border-green-200 text-green-700 bg-green-50 rounded-md">
                      <svg className="mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      You have already voted
                    </div>
                  )}
                  
                  {(election.status === 'Upcoming' || election.status === 'Ongoing') && (
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Link
                        to={`/user/apply?election=${election._id}`}
                        className="btn bg-white border border-secondary-300 text-secondary-700 hover:bg-secondary-50 inline-flex items-center"
                      >
                        <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Apply as Candidate
                      </Link>
                    </motion.div>
                  )}
                  
                  {election.status === 'Ended' && (
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Link
                        to={`/elections/${election._id}/results`}
                        className="btn bg-indigo-600 hover:bg-indigo-700 text-white inline-flex items-center"
                      >
                        <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        View Results
                      </Link>
                    </motion.div>
                  )}
                </>
              ) : (
                <Link
                  to="/login"
                  className="btn btn-primary inline-flex items-center"
                >
                  <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Login to Participate
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Candidates section */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
            <h2 className="text-xl font-semibold text-gray-900">Verified Candidates</h2>
          </div>
          
          <div className="p-6">
            {candidates.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-gray-500">No verified candidates for this election yet.</p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2">
                {candidates.map(candidate => (
                  <motion.div 
                    key={candidate._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    whileHover={{ scale: 1.02 }}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        {candidate.profileImage ? (
                          <img 
                            src={candidate.profileImage} 
                            alt={candidate.userId.name}
                            className="h-14 w-14 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-14 w-14 rounded-full bg-primary-100 flex items-center justify-center text-primary-800 text-xl font-bold">
                            {candidate.userId.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {candidate.userId.name}
                        </h3>
                        <p className="mt-1 text-sm text-gray-600 line-clamp-3">{candidate.manifesto}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ElectionDetails;