import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import axios from '../../api/axios';
import { useAuth } from '../../contexts/AuthContext';

const Voting = () => {
  const { electionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [election, setElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        when: "beforeChildren", 
        staggerChildren: 0.1 
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  useEffect(() => {
    const fetchElectionData = async () => {
      try {
        setLoading(true);
        
        // Get election details
        const electionRes = await axios.get(`/elections/${electionId}`);
        setElection(electionRes.data);
        
        // Check if election is ongoing
        if (electionRes.data.status !== 'Ongoing') {
          throw new Error(`This election is ${electionRes.data.status.toLowerCase()} and not open for voting.`);
        }
        
        // Check if user is eligible to vote
        const userRes = await axios.get('/auth/me');
        const isEligible = userRes.data.eligibleElections?.some(
          id => id === electionId || id._id === electionId
        );
        
        if (!isEligible) {
          throw new Error('You are not eligible to vote in this election.');
        }
        
        // Check if user has already voted
        const votesRes = await axios.get('/votes/user');
        const alreadyVoted = votesRes.data.some(vote => 
          vote.electionId._id === electionId || vote.electionId === electionId
        );
        
        if (alreadyVoted) {
          setHasVoted(true);
        }
        
        // Get verified candidates for this election
        const candidatesRes = await axios.get('/candidates', {
          params: { 
            electionId, 
            status: 'Verified' 
          }
        });
        
        setCandidates(candidatesRes.data);
        
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || err.message || 'Failed to load voting data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchElectionData();
  }, [electionId]);

  const handleVote = async () => {
    if (!selectedCandidate) {
      return toast.error('Please select a candidate');
    }
    
    try {
      setSubmitting(true);
      
      await axios.post('/votes', {
        electionId,
        candidateId: selectedCandidate
      });
      
      toast.success('Your vote has been cast successfully!');
      setHasVoted(true);
      
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to cast vote');
    } finally {
      setSubmitting(false);
    }
  };

  const renderCandidateCards = () => {
    if (candidates.length === 0) {
      return (
        <motion.div 
          variants={itemVariants}
          className="text-center py-10"
        >
          <p className="text-gray-500">No verified candidates found for this election.</p>
        </motion.div>
      );
    }
    
    return candidates.map(candidate => (
      <motion.div
        key={candidate._id}
        variants={itemVariants}
        whileHover={{ scale: 1.02 }}
        className={`
          border rounded-xl p-6 cursor-pointer transition-all
          ${selectedCandidate === candidate._id 
            ? 'border-primary-500 bg-primary-50 shadow-md' 
            : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'}
        `}
        onClick={() => !hasVoted && setSelectedCandidate(candidate._id)}
      >
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            {candidate.profileImage ? (
              <img 
                src={candidate.profileImage} 
                alt={candidate.userId.name}
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center text-primary-800 text-xl font-bold">
                {candidate.userId.name.charAt(0)}
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              {candidate.userId.name}
              {selectedCandidate === candidate._id && (
                <motion.svg 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="ml-2 h-5 w-5 text-primary-600" 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </motion.svg>
              )}
            </h3>
            
            <div className="mt-2 text-sm text-gray-600 line-clamp-3">
              <strong>Manifesto:</strong> {candidate.manifesto}
            </div>
          </div>
        </div>
      </motion.div>
    ));
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      {/* Back button */}
      <motion.div 
        initial={{ x: -10, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
      >
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-primary-600 hover:text-primary-800 font-medium"
        >
          <svg className="mr-1 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </button>
      </motion.div>

      {error ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-lg bg-red-50 border-l-4 border-red-500 p-6 text-center"
        >
          <h2 className="text-xl font-semibold text-red-700 mb-2">Unable to Vote</h2>
          <p className="text-red-600">{error}</p>
          <div className="mt-4">
            <Link 
              to="/user" 
              className="btn btn-primary px-6"
            >
              Return to Dashboard
            </Link>
          </div>
        </motion.div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Election header */}
          <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-primary-600 to-primary-700 text-white">
              <h1 className="text-2xl font-bold">Vote: {election?.title}</h1>
              <p className="mt-1 text-primary-100">
                Ends on {new Date(election?.endDate).toLocaleDateString()}
              </p>
            </div>
            <div className="p-6">
              <p className="text-gray-700">{election?.description}</p>
              
              {hasVoted && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-4 p-4 bg-green-50 border border-green-100 rounded-lg"
                >
                  <div className="flex items-center text-green-700">
                    <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">You have already cast your vote for this election.</span>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Candidates section */}
          <motion.div variants={itemVariants} className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {hasVoted ? 'Election Candidates' : 'Select a Candidate'}
            </h2>
            
            {hasVoted ? (
              <p className="text-gray-600 mb-4">
                Your vote has been recorded. Results will be available when the election ends.
              </p>
            ) : (
              <p className="text-gray-600 mb-4">
                Click on a candidate to select, then click the "Cast Vote" button to confirm your choice.
              </p>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {renderCandidateCards()}
            </div>
          </motion.div>

          {/* Vote button */}
          {!hasVoted && (
            <motion.div 
              variants={itemVariants}
              className="flex justify-center pt-4"
            >
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleVote}
                disabled={!selectedCandidate || submitting}
                className={`
                  btn py-3 px-8 text-lg flex items-center 
                  ${selectedCandidate ? 'btn-primary' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}
                `}
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    Cast Vote
                    <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </motion.button>
            </motion.div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

export default Voting;