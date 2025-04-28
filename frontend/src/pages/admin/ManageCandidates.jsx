import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import axios from '../../api/axios';

const ManageCandidates = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [currentCandidate, setCurrentCandidate] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterElection, setFilterElection] = useState('all');
  const [elections, setElections] = useState([]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  useEffect(() => {
    fetchCandidates();
    fetchElections();
  }, []);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/candidates');
      setCandidates(res.data);
    } catch (error) {
      console.error('Error fetching candidates:', error);
      toast.error('Failed to load candidate applications');
    } finally {
      setLoading(false);
    }
  };

  const fetchElections = async () => {
    try {
      const res = await axios.get('/elections');
      setElections(res.data);
    } catch (error) {
      console.error('Error fetching elections:', error);
    }
  };

  const handleVerifyCandidate = async (candidateId, status) => {
    try {
      await axios.patch(`/candidates/${candidateId}/verify`, { status });
      
      // Update the candidate in state
      setCandidates(prev => 
        prev.map(candidate => 
          candidate._id === candidateId 
            ? { ...candidate, status } 
            : candidate
        )
      );
      
      setShowDetailModal(false);
      
      toast.success(`Candidate ${status === 'Verified' ? 'approved' : 'rejected'} successfully`);
    } catch (error) {
      console.error('Error updating candidate:', error);
      toast.error('Failed to update candidate status');
    }
  };

  const handleDeleteCandidate = async (candidateId) => {
    if (!window.confirm('Are you sure you want to delete this application?')) {
      return;
    }
    
    try {
      await axios.delete(`/candidates/${candidateId}`);
      
      // Remove the candidate from state
      setCandidates(prev => prev.filter(candidate => candidate._id !== candidateId));
      
      setShowDetailModal(false);
      
      toast.success('Candidate application deleted successfully');
    } catch (error) {
      console.error('Error deleting candidate:', error);
      toast.error('Failed to delete candidate application');
    }
  };

  const openDetailModal = (candidate) => {
    setCurrentCandidate(candidate);
    setShowDetailModal(true);
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Verified':
        return 'bg-green-100 text-green-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Filter candidates based on search, status and election filters
  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = 
      candidate.userId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.electionId?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (candidate.manifesto && candidate.manifesto.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = 
      filterStatus === 'all' || 
      candidate.status.toLowerCase() === filterStatus.toLowerCase();
    
    const matchesElection = 
      filterElection === 'all' || 
      candidate.electionId?._id === filterElection;
    
    return matchesSearch && matchesStatus && matchesElection;
  });

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center mb-8"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Candidate Applications</h1>
          <p className="mt-1 text-gray-600">
            Review, approve, and manage candidate applications.
          </p>
        </div>
      </motion.div>

      {/* Search and filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            className="form-input pl-10 py-3 w-full"
            placeholder="Search candidates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="form-input py-3 w-full"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        
        <div>
          <select
            value={filterElection}
            onChange={(e) => setFilterElection(e.target.value)}
            className="form-input py-3 w-full"
          >
            <option value="all">All Elections</option>
            {elections.map(election => (
              <option key={election._id} value={election._id}>
                {election.title}
              </option>
            ))}
          </select>
        </div>
      </motion.div>

      {/* Candidates list */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
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
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {filteredCandidates.length === 0 ? (
            <motion.div
              variants={itemVariants}
              className="bg-white rounded-lg shadow-sm p-10 text-center"
            >
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <p className="mt-2 text-gray-500">
                No candidate applications found. {searchTerm && 'Try a different search term.'}
              </p>
            </motion.div>
          ) : (
            filteredCandidates.map(candidate => (
              <motion.div
                key={candidate._id}
                variants={itemVariants}
                className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="p-5">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
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
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900">{candidate.userId.name}</h3>
                        <p className="text-sm text-gray-600">{candidate.userId.email}</p>
                      </div>
                    </div>
                    
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(candidate.status)}`}>
                      {candidate.status}
                    </span>
                  </div>
                  
                  <div className="mt-4">
                    <div className="text-sm text-gray-500">
                      <p className="font-medium">Election:</p>
                      <p>{candidate.electionId?.title || 'Unknown Election'}</p>
                    </div>
                    
                    <div className="mt-3 text-sm">
                      <p className="font-medium text-gray-500">Manifesto excerpt:</p>
                      <p className="text-gray-700 line-clamp-2">{candidate.manifesto}</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex justify-end space-x-3">
                    <button
                      onClick={() => openDetailModal(candidate)}
                      className="btn-sm bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      View Details
                    </button>
                    
                    {candidate.status === 'Pending' && (
                      <>
                        <button
                          onClick={() => handleVerifyCandidate(candidate._id, 'Verified')}
                          className="btn-sm bg-green-100 text-green-800 hover:bg-green-200"
                        >
                          Approve
                        </button>
                        
                        <button
                          onClick={() => handleVerifyCandidate(candidate._id, 'Rejected')}
                          className="btn-sm bg-red-100 text-red-800 hover:bg-red-200"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
      )}

      {/* Candidate detail modal */}
      <AnimatePresence>
        {showDetailModal && currentCandidate && (
          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.75 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                onClick={() => setShowDetailModal(false)}
              />
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: 'spring', damping: 20 }}
                className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6"
              >
                <div className="absolute top-0 right-0 pt-4 pr-4">
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div>
                  <div className="text-center sm:text-left">
                    <div className="flex items-center mb-4">
                      <div className="flex-shrink-0 mr-4">
                        {currentCandidate.profileImage ? (
                          <img 
                            src={currentCandidate.profileImage} 
                            alt={currentCandidate.userId.name}
                            className="h-16 w-16 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center text-primary-800 text-xl font-bold">
                            {currentCandidate.userId.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                          {currentCandidate.userId.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {currentCandidate.userId.email}
                        </p>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg mb-4">
                      <p className="text-sm font-medium text-gray-500">Election</p>
                      <p className="font-medium text-gray-900">{currentCandidate.electionId?.title}</p>
                      <div className="mt-1 flex items-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(currentCandidate.status)}`}>
                          {currentCandidate.status}
                        </span>
                        <span className="ml-2 text-sm text-gray-500">
                          Applied on {new Date(currentCandidate.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-500 mb-2">Manifesto</p>
                      <div className="bg-gray-50 p-4 rounded-lg max-h-60 overflow-y-auto">
                        <p className="text-gray-900 whitespace-pre-line">{currentCandidate.manifesto}</p>
                      </div>
                    </div>
                    
                    {currentCandidate.profileImage && (
                      <div className="mb-6">
                        <p className="text-sm font-medium text-gray-500 mb-2">Profile Image</p>
                        <img 
                          src={currentCandidate.profileImage} 
                          alt={currentCandidate.userId.name}
                          className="max-h-40 rounded-lg mx-auto"
                        />
                      </div>
                    )}
                    
                    <div className="mt-5 sm:mt-6 flex justify-between">
                      <button
                        onClick={() => handleDeleteCandidate(currentCandidate._id)}
                        className="btn border border-red-300 text-red-700 hover:bg-red-50"
                      >
                        Delete Application
                      </button>
                      
                      <div className="flex space-x-3">
                        {currentCandidate.status === 'Pending' && (
                          <>
                            <button
                              onClick={() => handleVerifyCandidate(currentCandidate._id, 'Rejected')}
                              className="btn bg-red-100 text-red-800 hover:bg-red-200"
                            >
                              Reject
                            </button>
                            
                            <button
                              onClick={() => handleVerifyCandidate(currentCandidate._id, 'Verified')}
                              className="btn bg-green-600 text-white hover:bg-green-700"
                            >
                              Approve
                            </button>
                          </>
                        )}
                        
                        {currentCandidate.status !== 'Pending' && (
                          <button
                            onClick={() => setShowDetailModal(false)}
                            className="btn btn-primary"
                          >
                            Close
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ManageCandidates;