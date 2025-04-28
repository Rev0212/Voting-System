import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import axios from '../../api/axios';
import { format } from 'date-fns';

const ManageElections = () => {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentElection, setCurrentElection] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: ''
  });

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
    fetchElections();
  }, []);

  const fetchElections = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/elections');
      setElections(res.data);
    } catch (error) {
      console.error('Error fetching elections:', error);
      toast.error('Failed to load elections');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateDates = () => {
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      toast.error('Please enter valid dates');
      return false;
    }
    
    if (start >= end) {
      toast.error('End date must be after start date');
      return false;
    }
    
    return true;
  };

  const handleCreateElection = async (e) => {
    e.preventDefault();
    
    if (!validateDates()) return;
    
    try {
      const res = await axios.post('/elections', formData);
      setElections(prev => [...prev, res.data]);
      setShowCreateModal(false);
      setFormData({
        title: '',
        description: '',
        startDate: '',
        endDate: ''
      });
      toast.success('Election created successfully');
    } catch (error) {
      console.error('Error creating election:', error);
      toast.error(error.response?.data?.message || 'Failed to create election');
    }
  };

  const handleEditElection = async (e) => {
    e.preventDefault();
    
    if (!validateDates()) return;
    
    try {
      const res = await axios.put(`/elections/${currentElection._id}`, formData);
      setElections(prev => 
        prev.map(election => 
          election._id === currentElection._id ? { ...election, ...res.data } : election
        )
      );
      setShowEditModal(false);
      toast.success('Election updated successfully');
    } catch (error) {
      console.error('Error updating election:', error);
      toast.error(error.response?.data?.message || 'Failed to update election');
    }
  };

  const handleDeleteElection = async (electionId) => {
    if (!window.confirm('Are you sure you want to delete this election? This will also remove any associated candidates.')) {
      return;
    }
    
    try {
      await axios.delete(`/elections/${electionId}`);
      setElections(prev => prev.filter(election => election._id !== electionId));
      toast.success('Election deleted successfully');
    } catch (error) {
      console.error('Error deleting election:', error);
      if (error.response?.status === 400) {
        toast.error('Cannot delete an election with existing votes');
      } else {
        toast.error('Failed to delete election');
      }
    }
  };

  const handleEndElection = async (electionId) => {
    if (!window.confirm('Are you sure you want to end this election? This action cannot be undone.')) {
      return;
    }
    
    try {
      const res = await axios.patch(`/elections/${electionId}/end`);
      setElections(prev => 
        prev.map(election => 
          election._id === electionId ? { ...election, status: 'Ended' } : election
        )
      );
      toast.success('Election ended successfully');
    } catch (error) {
      console.error('Error ending election:', error);
      toast.error('Failed to end election');
    }
  };

  const openEditModal = (election) => {
    setCurrentElection(election);
    setFormData({
      title: election.title,
      description: election.description,
      startDate: new Date(election.startDate).toISOString().split('T')[0],
      endDate: new Date(election.endDate).toISOString().split('T')[0]
    });
    setShowEditModal(true);
  };

  const getStatusBadgeColor = (status) => {
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

  const filteredElections = elections.filter(election => {
    const matchesSearch = 
      election.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      election.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      filterStatus === 'all' || 
      election.status.toLowerCase() === filterStatus.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center mb-8"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Elections</h1>
          <p className="mt-1 text-gray-600">
            Create, edit, and manage election status.
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Create Election
        </motion.button>
      </motion.div>

      {/* Search and filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 flex flex-col sm:flex-row gap-4"
      >
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            className="form-input pl-10 py-3 w-full"
            placeholder="Search elections..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-48">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="form-input py-3 w-full"
          >
            <option value="all">All Statuses</option>
            <option value="upcoming">Upcoming</option>
            <option value="ongoing">Ongoing</option>
            <option value="ended">Ended</option>
          </select>
        </div>
      </motion.div>

      {/* Elections grid */}
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
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredElections.length === 0 ? (
            <motion.div
              variants={itemVariants}
              className="col-span-full text-center py-12 bg-white rounded-lg shadow"
            >
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="mt-2 text-gray-500">
                No elections found. {searchTerm && 'Try a different search term or '}
                <button 
                  onClick={() => setShowCreateModal(true)}
                  className="text-primary-600 hover:text-primary-800 underline"
                >
                  create a new election
                </button>.
              </p>
            </motion.div>
          ) : (
            filteredElections.map(election => (
              <motion.div
                key={election._id}
                variants={itemVariants}
                className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{election.title}</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(election.status)}`}>
                      {election.status}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                    {election.description}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                    <div>
                      <p className="text-gray-500">Start Date</p>
                      <p className="font-medium">{format(new Date(election.startDate), 'MMM d, yyyy')}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">End Date</p>
                      <p className="font-medium">{format(new Date(election.endDate), 'MMM d, yyyy')}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <Link 
                      to={`/admin/elections/${election._id}/results`}
                      className="btn-sm bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                    >
                      Results
                    </Link>
                    <Link 
                      to={`/admin/elections/${election._id}/candidates`}
                      className="btn-sm bg-purple-50 text-purple-700 hover:bg-purple-100"
                    >
                      Candidates
                    </Link>
                    <Link 
                      to={`/admin/elections/${election._id}/voters`}
                      className="btn-sm bg-blue-50 text-blue-700 hover:bg-blue-100"
                    >
                      Voters
                    </Link>
                  </div>
                </div>
                
                <div className="px-5 py-3 bg-gray-50 flex justify-between border-t border-gray-200">
                  <div className="space-x-2">
                    <button
                      onClick={() => openEditModal(election)}
                      className="btn-sm bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteElection(election._id)}
                      className="btn-sm bg-white border border-red-300 text-red-700 hover:bg-red-50"
                      disabled={election.status === 'Ongoing' || election.status === 'Ended'}
                    >
                      Delete
                    </button>
                  </div>
                  {election.status === 'Ongoing' && (
                    <button
                      onClick={() => handleEndElection(election._id)}
                      className="btn-sm bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                    >
                      End Election
                    </button>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
      )}

      {/* Create Election Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.75 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                onClick={() => setShowCreateModal(false)}
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
                    onClick={() => setShowCreateModal(false)}
                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div>
                  <div className="mt-3 text-center sm:mt-0 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Create New Election
                    </h3>
                    <div className="mt-4">
                      <form onSubmit={handleCreateElection} className="space-y-4">
                        <div>
                          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                            Title
                          </label>
                          <input
                            type="text"
                            name="title"
                            id="title"
                            required
                            value={formData.title}
                            onChange={handleInputChange}
                            className="mt-1 form-input block w-full"
                            placeholder="Enter election title"
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                            Description
                          </label>
                          <textarea
                            name="description"
                            id="description"
                            rows="3"
                            required
                            value={formData.description}
                            onChange={handleInputChange}
                            className="mt-1 form-input block w-full"
                            placeholder="Enter election description"
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                              Start Date
                            </label>
                            <input
                              type="date"
                              name="startDate"
                              id="startDate"
                              required
                              value={formData.startDate}
                              onChange={handleInputChange}
                              className="mt-1 form-input block w-full"
                            />
                          </div>
                          
                          <div>
                            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                              End Date
                            </label>
                            <input
                              type="date"
                              name="endDate"
                              id="endDate"
                              required
                              value={formData.endDate}
                              onChange={handleInputChange}
                              className="mt-1 form-input block w-full"
                            />
                          </div>
                        </div>
                        
                        <div className="mt-5 sm:mt-6 flex justify-end space-x-3">
                          <button
                            type="button"
                            onClick={() => setShowCreateModal(false)}
                            className="btn border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="btn btn-primary"
                          >
                            Create Election
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Election Modal */}
      <AnimatePresence>
        {showEditModal && (
          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.75 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                onClick={() => setShowEditModal(false)}
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
                    onClick={() => setShowEditModal(false)}
                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div>
                  <div className="mt-3 text-center sm:mt-0 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Edit Election
                    </h3>
                    <div className="mt-4">
                      <form onSubmit={handleEditElection} className="space-y-4">
                        <div>
                          <label htmlFor="edit-title" className="block text-sm font-medium text-gray-700">
                            Title
                          </label>
                          <input
                            type="text"
                            name="title"
                            id="edit-title"
                            required
                            value={formData.title}
                            onChange={handleInputChange}
                            className="mt-1 form-input block w-full"
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700">
                            Description
                          </label>
                          <textarea
                            name="description"
                            id="edit-description"
                            rows="3"
                            required
                            value={formData.description}
                            onChange={handleInputChange}
                            className="mt-1 form-input block w-full"
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="edit-startDate" className="block text-sm font-medium text-gray-700">
                              Start Date
                            </label>
                            <input
                              type="date"
                              name="startDate"
                              id="edit-startDate"
                              required
                              value={formData.startDate}
                              onChange={handleInputChange}
                              className="mt-1 form-input block w-full"
                            />
                          </div>
                          
                          <div>
                            <label htmlFor="edit-endDate" className="block text-sm font-medium text-gray-700">
                              End Date
                            </label>
                            <input
                              type="date"
                              name="endDate"
                              id="edit-endDate"
                              required
                              value={formData.endDate}
                              onChange={handleInputChange}
                              className="mt-1 form-input block w-full"
                            />
                          </div>
                        </div>
                        
                        <div className="mt-5 sm:mt-6 flex justify-end space-x-3">
                          <button
                            type="button"
                            onClick={() => setShowEditModal(false)}
                            className="btn border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="btn btn-primary"
                          >
                            Update Election
                          </button>
                        </div>
                      </form>
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

export default ManageElections;