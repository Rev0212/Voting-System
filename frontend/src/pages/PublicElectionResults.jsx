import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from '../api/axios';

const PublicElectionResults = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [election, setElection] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        
        // Get election details
        const electionRes = await axios.get(`/elections/${id}`);
        setElection(electionRes.data);
        
        if (electionRes.data.status !== 'Ended') {
          throw new Error('Results are only available after the election has ended');
        }
        
        // Get results
        const resultsRes = await axios.get(`/votes/results/${id}`);
        setResults(resultsRes.data);
        setError(null);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchResults();
  }, [id]);

  const calculatePercentage = (votes, totalVotes) => {
    if (totalVotes === 0) return 0;
    return ((votes / totalVotes) * 100).toFixed(1);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <h3 className="text-lg font-medium text-red-800">Error</h3>
          <p className="mt-2 text-red-700">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 text-primary-600 hover:text-primary-800 font-medium"
          >
            &larr; Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!election || !results) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <p>Election results could not be loaded</p>
        </div>
      </div>
    );
  }

  // Sort candidates by votes
  const sortedResults = [...results.results].sort((a, b) => b.votes - a.votes);
  const winner = sortedResults[0]?.candidateName || 'No candidates';

  return (
    <div className="max-w-4xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
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

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-primary-600 to-primary-700 text-white">
            <h1 className="text-2xl font-bold">{election.title} - Results</h1>
            <p className="mt-1 text-primary-100">Election has ended</p>
          </div>
          
          <div className="p-6">
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="text-lg">Total Votes: <span className="font-bold">{results.totalVotes}</span></p>
                  <p className="text-lg">Turnout: <span className="font-bold">{results.turnoutPercentage}</span></p>
                  <p className="text-lg">Winner: <span className="font-bold text-primary-600">{winner}</span></p>
                </div>
              </div>
              
              {/* Results visualization */}
              <div className="mt-8 space-y-6">
                <h2 className="text-xl font-semibold">Vote Distribution</h2>
                
                {sortedResults.map((candidate, index) => (
                  <div key={candidate.candidateId} className="relative">
                    <div className="flex justify-between mb-1">
                      <span className={`font-semibold ${index === 0 ? 'text-primary-600' : ''}`}>
                        {candidate.candidateName} {index === 0 && <span className="text-sm ml-1">(Winner)</span>}
                      </span>
                      <span>{candidate.votes} votes ({calculatePercentage(candidate.votes, results.totalVotes)}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-5">
                      <div 
                        className={`${index === 0 ? 'bg-primary-600' : 'bg-gray-500'} h-5 rounded-full transition-all duration-500`}
                        style={{ width: `${calculatePercentage(candidate.votes, results.totalVotes)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PublicElectionResults;