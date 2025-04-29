import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from '../api/axios';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import LoadingScreen from '../components/common/LoadingScreen';

const ElectionDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [election, setElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchElectionDetails = async () => {
      try {
        setLoading(true);
        const [electionRes, candidatesRes] = await Promise.all([
          axios.get(`/elections/${id}`),
          axios.get(`/candidates/election/${id}?status=Verified`)
        ]);
        
        setElection(electionRes.data);
        setCandidates(candidatesRes.data);
        setError(null);
      } catch (err) {
        console.error(err);
        setError('Failed to load election details');
      } finally {
        setLoading(false);
      }
    };

    fetchElectionDetails();
  }, [id]);

  if (loading) return <LoadingScreen />;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!election) return <div className="p-4">Election not found</div>;

  const isUpcoming = election.status === 'Upcoming';
  const isOngoing = election.status === 'Ongoing';
  const isEnded = election.status === 'Ended';

  return (
    <div className="max-w-4xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <Link to="/elections" className="inline-flex items-center text-primary-600 hover:text-primary-700">
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Elections
        </Link>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-start">
              <h1 className="text-2xl font-bold text-gray-900">{election.title}</h1>
              <span className={`px-3 py-1 rounded-full text-sm font-medium
                ${isUpcoming ? 'bg-blue-100 text-blue-800' : ''}
                ${isOngoing ? 'bg-green-100 text-green-800' : ''}
                ${isEnded ? 'bg-gray-100 text-gray-800' : ''}
              `}>
                {election.status}
              </span>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <h2 className="text-lg font-medium text-gray-900">About this Election</h2>
                <p className="mt-1 text-gray-600 whitespace-pre-line">{election.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-500">Start Date</p>
                  <p className="font-medium text-gray-900">
                    {new Date(election.startDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-500">End Date</p>
                  <p className="font-medium text-gray-900">
                    {new Date(election.endDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Candidates</h2>
                {candidates.length === 0 ? (
                  <p className="text-gray-500">No candidates available for this election yet.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {candidates.map(candidate => (
                      <div key={candidate._id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center space-x-3">
                          {candidate.profileImage ? (
                            <img 
                              src={candidate.profileImage} 
                              alt={candidate.userId.name}
                              className="h-12 w-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-800 text-xl font-bold">
                              {candidate.userId.name.charAt(0)}
                            </div>
                          )}
                          <div>
                            <h3 className="font-medium text-gray-900">{candidate.userId.name}</h3>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-6 flex flex-wrap gap-3">
                {user ? (
                  <>
                    {isOngoing && (
                      <Link to={`/user/vote/${election._id}`} className="btn btn-primary">
                        Vote Now
                      </Link>
                    )}
                    
                    {(isUpcoming || isOngoing) && (
                      <Link to={`/user/apply?election=${election._id}`} className="btn bg-secondary-600 hover:bg-secondary-700 text-white">
                        Apply as Candidate
                      </Link>
                    )}
                    
                    {isEnded && (
                      <Link to={`/elections/${election._id}/results`} className="btn bg-gray-600 hover:bg-gray-700 text-white">
                        View Results
                      </Link>
                    )}
                  </>
                ) : (
                  <Link to="/login" className="btn btn-primary">
                    Login to Participate
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ElectionDetails;