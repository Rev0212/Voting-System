import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import axios from '../../api/axios';

const CandidateApplication = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const electionIdFromQuery = queryParams.get('election');

  const [formData, setFormData] = useState({
    electionId: electionIdFromQuery || '',
    manifesto: '',
    profileImage: '',
  });
  
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEligibleElections = async () => {
      try {
        setLoading(true);
        // Get elections that haven't ended where user can apply
        const response = await axios.get('/elections');
        const eligibleElections = response.data.filter(
          election => election.status !== 'Ended'
        );
        setElections(eligibleElections);
      } catch (err) {
        setError('Failed to load eligible elections.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEligibleElections();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.electionId) {
      return setError('Please select an election');
    }
    
    if (!formData.manifesto.trim()) {
      return setError('Please provide your manifesto');
    }
    
    try {
      setSubmitting(true);
      setError(null);
      
      await axios.post('/candidates/apply', formData);
      
      toast.success('Application submitted successfully!');
      navigate('/user');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to submit application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Animation variants
  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
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
    <div className="max-w-3xl mx-auto">
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <h1 className="text-3xl font-bold text-gray-900">Apply as a Candidate</h1>
          <p className="mt-2 text-gray-600">
            Complete the form below to submit your candidacy for an election
          </p>
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

        <motion.div
          variants={formVariants}
          initial="hidden"
          animate="visible"
          className="bg-white rounded-xl shadow-sm overflow-hidden"
        >
          <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
            <h2 className="text-xl font-semibold text-gray-900">Candidate Information</h2>
          </div>
          
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="electionId" className="block text-sm font-medium text-gray-700">
                  Select Election
                </label>
                <div className="mt-1">
                  <select
                    id="electionId"
                    name="electionId"
                    required
                    value={formData.electionId}
                    onChange={handleChange}
                    className="form-input"
                    disabled={!!electionIdFromQuery}
                  >
                    <option value="">Select an election</option>
                    {elections.map(election => (
                      <option key={election._id} value={election._id}>
                        {election.title} ({election.status})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="manifesto" className="block text-sm font-medium text-gray-700">
                  Your Manifesto
                </label>
                <div className="mt-1">
                  <textarea
                    id="manifesto"
                    name="manifesto"
                    rows={6}
                    required
                    value={formData.manifesto}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Describe your goals, plans, and why voters should choose you..."
                  />
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Write a compelling statement about your candidacy (500-1000 characters recommended)
                </p>
              </div>

              <div>
                <label htmlFor="profileImage" className="block text-sm font-medium text-gray-700">
                  Profile Image URL (Optional)
                </label>
                <div className="mt-1">
                  <input
                    id="profileImage"
                    name="profileImage"
                    type="url"
                    value={formData.profileImage}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="https://example.com/your-profile-image.jpg"
                  />
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Add a URL to your profile image to appear on the ballot
                </p>
              </div>

              <div className="flex items-center justify-between pt-4">
                <button
                  type="button"
                  onClick={() => navigate('/user')}
                  className="btn bg-gray-100 text-gray-800 hover:bg-gray-200"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary py-2 px-6"
                >
                  {submitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </>
                  ) : (
                    'Submit Application'
                  )}
                </motion.button>
              </div>
            </form>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { delay: 0.3 } }}
          className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded"
        >
          <h3 className="text-lg font-medium text-blue-800">Important Information</h3>
          <ul className="mt-2 text-blue-700 list-disc list-inside space-y-1">
            <li>Your application will need to be approved by administrators</li>
            <li>You can only apply once per election</li>
            <li>Make sure your manifesto is clear and convincing</li>
            <li>Applications cannot be modified after submission</li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
};

export default CandidateApplication;