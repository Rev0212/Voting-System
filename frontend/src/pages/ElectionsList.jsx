import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from '../api/axios';
import { useAuth } from '../contexts/AuthContext';
import LoadingScreen from '../components/common/LoadingScreen'; // Your custom loader

const ElectionsList = () => {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const { user } = useAuth();

  useEffect(() => {
    const fetchElections = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/elections');
        setElections(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to load elections. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchElections();
  }, []);

  const filteredElections = elections.filter(election => {
    if (filter === 'all') return true;
    return election.status.toLowerCase() === filter;
  });

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } }
  };

  return (
    <div className="space-y-8">
      <div>
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-gray-900"
        >
          Elections
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { delay: 0.2 } }}
          className="mt-2 text-gray-600"
        >
          Browse all elections, apply as a candidate, or cast your vote.
        </motion.p>
      </div>

      {/* Filter Tabs */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0, transition: { delay: 0.3 } }}
        className="border-b border-gray-200"
      >
        <nav className="-mb-px flex space-x-8">
          {['all', 'upcoming', 'ongoing', 'ended'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`
                whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm capitalize
                ${filter === tab
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
              `}
            >
              {tab === 'all' ? 'All Elections' : `${tab} Elections`}
            </button>
          ))}
        </nav>
      </motion.div>

      {/* Elections Grid or Loader/Error */}
      {loading ? (
        <LoadingScreen />
      ) : error ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-red-50 border-l-4 border-red-500 p-4 rounded"
        >
          <p className="text-red-700">{error}</p>
        </motion.div>
      ) : filteredElections.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-gray-50 rounded-lg p-8 text-center"
        >
          <p className="text-gray-600">No elections found with the selected filter.</p>
        </motion.div>
      ) : (
        <AnimatePresence>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredElections.map((election) => {
              const startDate = new Date(election.startDate);
              const endDate = new Date(election.endDate);

              let statusClass = '';
              let statusBgClass = '';
              switch (election.status) {
                case 'Upcoming':
                  statusClass = 'text-blue-800';
                  statusBgClass = 'bg-blue-100';
                  break;
                case 'Ongoing':
                  statusClass = 'text-green-800';
                  statusBgClass = 'bg-green-100';
                  break;
                case 'Ended':
                  statusClass = 'text-gray-800';
                  statusBgClass = 'bg-gray-100';
                  break;
                default:
                  statusClass = 'text-gray-800';
                  statusBgClass = 'bg-gray-100';
              }

              return (
                <motion.div
                  key={election._id}
                  layout
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col"
                >
                  <div className="p-6 flex-grow">
                    <div className="flex justify-between items-start">
                      <h3 className="text-xl font-semibold text-gray-900 truncate">
                        {election.title}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClass} ${statusBgClass}`}>
                        {election.status}
                      </span>
                    </div>

                    <p className="mt-3 text-gray-600 line-clamp-3">
                      {election.description}
                    </p>

                    <div className="mt-4 space-y-2">
                      <div className="flex items-center text-sm text-gray-500">
                        <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <div>
                          <div>Starts: {startDate.toLocaleDateString()}</div>
                          <div>Ends: {endDate.toLocaleDateString()}</div>
                        </div>
                      </div>

                      {election.createdBy && (
                        <div className="flex items-center text-sm text-gray-500">
                          <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span>Created by: {election.createdBy.name}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
                    <div className="flex justify-between">
                      {user ? (
                        <>
                          {election.status === 'Ongoing' && (
                            <Link
                              to={`/user/vote/${election._id}`}
                              className="text-primary-600 hover:text-primary-700 font-medium"
                            >
                              Vote Now
                            </Link>
                          )}
                          {(election.status === 'Upcoming' || election.status === 'Ongoing') && (
                            <Link
                              to={`/user/apply?election=${election._id}`}
                              className="text-secondary-600 hover:text-secondary-700 font-medium"
                            >
                              Apply as Candidate
                            </Link>
                          )}
                          {election.status === 'Ended' && user.role === 'admin' && (
                            <Link
                              to={`/admin/elections/${election._id}/results`}
                              className="text-blue-600 hover:text-blue-800 font-medium"
                            >
                              View Results (Admin)
                            </Link>
                          )}
                          {election.status === 'Ended' && user.role !== 'admin' && (
                            <Link
                              to={`/elections/${election._id}/results`}
                              className="text-gray-600 hover:text-gray-800 font-medium"
                            >
                              View Results
                            </Link>
                          )}
                        </>
                      ) : (
                        <Link
                          to="/login"
                          className="text-primary-600 hover:text-primary-700 font-medium"
                        >
                          Login to participate
                        </Link>
                      )}

                      <Link
                        to={`/elections/${election._id}`}
                        className="text-gray-600 hover:text-gray-800 font-medium"
                      >
                        View Details →
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};

export default ElectionsList;