import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from '../../api/axios';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

const AdvancedAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/admin/analytics');
        setAnalytics(response.data);
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError('Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  // Format hourly data for chart
  const hourlyData = analytics?.timeBasedAnalytics?.hourlyVotes.map((count, hour) => ({
    hour: hour,
    votes: count,
    label: `${hour}:00`
  })) || [];

  // Format competitiveness data
  const competitivenessData = analytics?.electionCompetitiveness || [];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
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
      <div className="p-6 bg-red-50 border-l-4 border-red-500 rounded">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold text-gray-900">Advanced Analytics</h1>
        <p className="mt-1 text-gray-600">
          Detailed insights into voter behavior and election metrics.
        </p>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        {/* Voter Engagement Section */}
        <motion.div variants={itemVariants}>
          <h2 className="text-xl font-semibold mb-4">Voter Engagement</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-medium text-gray-800 mb-2">Participation Rate</h3>
              <p className="text-3xl font-bold text-primary-600">
                {(analytics?.voterEngagement?.participationRate * 100).toFixed(1)}%
              </p>
              <p className="text-sm text-gray-500 mt-2">
                {analytics?.voterEngagement?.totalVoters} out of {analytics?.voterEngagement?.totalEligibleUsers} eligible users have voted
              </p>
            </div>
          </div>
        </motion.div>

        {/* Time-Based Analysis */}
        <motion.div variants={itemVariants}>
          <h2 className="text-xl font-semibold mb-4">Voting Time Patterns</h2>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Votes by Hour of Day</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="hour" 
                    tickFormatter={(hour) => `${hour}:00`}
                    label={{ value: 'Hour of Day (24h)', position: 'insideBottom', offset: -5 }}
                  />
                  <YAxis label={{ value: 'Number of Votes', angle: -90, position: 'insideLeft' }} />
                  <Tooltip 
                    formatter={(value) => [`${value} votes`, 'Count']}
                    labelFormatter={(hour) => `Hour: ${hour}:00 - ${hour+1}:00`}
                  />
                  <Legend />
                  <Bar dataKey="votes" fill="#8884d8" name="Votes" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              This chart shows when users are most active in voting. 
              Peak hours can help you understand user behavior.
            </p>
          </div>
        </motion.div>

        {/* Election Competitiveness */}
        <motion.div variants={itemVariants}>
          <h2 className="text-xl font-semibold mb-4">Election Competitiveness Index</h2>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-medium text-gray-800 mb-4">
              Competitiveness Score (higher = more competitive)
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={competitivenessData}
                  layout="vertical"
                  margin={{ left: 120 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 1]} />
                  <YAxis 
                    type="category" 
                    dataKey="title" 
                    width={100}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip 
                    formatter={(value) => [`${value} (${value * 100}%)`, 'Competitiveness']}
                    labelFormatter={(name) => name}
                  />
                  <Legend />
                  <Bar 
                    dataKey="competitivenessScore" 
                    fill="#82ca9d" 
                    name="Competitiveness Score"
                    label={{ position: 'right', formatter: (val) => val.toFixed(2) }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              Elections with scores closer to 1.0 had closer results between candidates.
              A score of 0 means a single candidate received all votes.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AdvancedAnalytics;