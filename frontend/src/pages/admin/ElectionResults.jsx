import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from '../../api/axios';
import { useAuth } from '../../contexts/AuthContext';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const ElectionResults = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/votes/results/${id}`);
        setResults(response.data);
        setError(null);
      } catch (err) {
        console.error(err);
        const errorMsg = err.response?.data?.message || 'Failed to load results';
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [id]);

  // Prepare chart data
  const prepareChartData = () => {
    if (!results || !results.results) return null;

    // Get top 7 candidates for better visualization if there are many
    const displayResults = [...results.results]
      .sort((a, b) => b.votes - a.votes)
      .slice(0, 7);
    
    // Colors for chart
    const backgroundColors = [
      'rgba(54, 162, 235, 0.6)',
      'rgba(255, 99, 132, 0.6)',
      'rgba(255, 206, 86, 0.6)',
      'rgba(75, 192, 192, 0.6)',
      'rgba(153, 102, 255, 0.6)',
      'rgba(255, 159, 64, 0.6)',
      'rgba(199, 199, 199, 0.6)',
    ];
    
    // Bar chart data
    const barData = {
      labels: displayResults.map(r => r.candidateName),
      datasets: [
        {
          label: 'Votes',
          data: displayResults.map(r => r.votes),
          backgroundColor: backgroundColors,
          borderColor: backgroundColors.map(color => color.replace('0.6', '1')),
          borderWidth: 1,
        },
      ],
    };
    
    // Doughnut chart data
    const doughnutData = {
      labels: displayResults.map(r => r.candidateName),
      datasets: [
        {
          data: displayResults.map(r => r.votes),
          backgroundColor: backgroundColors,
          borderColor: backgroundColors.map(color => color.replace('0.6', '1')),
          borderWidth: 1,
        },
      ],
    };
    
    return { barData, doughnutData };
  };

  // Chart options
  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Vote Distribution by Candidate',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0, // Only show whole numbers
        },
      },
    },
  };
  
  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
      title: {
        display: true,
        text: 'Vote Share',
      },
    },
  };

  const chartData = !loading && !error && results ? prepareChartData() : null;

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
          <h3 className="text-lg font-medium text-red-800">Unable to Load Results</h3>
          <p className="mt-2 text-red-700">{error}</p>
          {error.includes('only available after') && (
            <p className="mt-2 text-red-600">
              Results will be visible once the election has ended.
            </p>
          )}
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

  if (!results) {
    return (
      <div className="text-center py-12">
        <p>No results found</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
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

        {/* Results header */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
            <h1 className="text-2xl font-bold">Election Results: {results.electionTitle}</h1>
            <p className="mt-1 text-indigo-100">
              {results.electionStatus === 'Ended' ? 'Final Results' : 'Current Results (Live)'}
            </p>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg">
              <div className="bg-white p-4 rounded shadow-sm">
                <h3 className="text-sm font-medium text-gray-500">Election Period</h3>
                <div className="mt-1 text-gray-900">
                  <p><strong>Started:</strong> {new Date(results.startDate).toLocaleDateString()}</p>
                  <p><strong>Ended:</strong> {new Date(results.endDate).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded shadow-sm">
                <h3 className="text-sm font-medium text-gray-500">Total Votes</h3>
                <p className="mt-1 text-3xl font-bold text-indigo-600">{results.totalVotes}</p>
              </div>
              
              <div className="bg-white p-4 rounded shadow-sm">
                <h3 className="text-sm font-medium text-gray-500">Voter Turnout</h3>
                <p className="mt-1 text-3xl font-bold text-indigo-600">{results.turnoutPercentage}</p>
                <p className="text-xs text-gray-500 mt-1">({results.totalVotes} out of {results.totalEligibleVoters} eligible voters)</p>
              </div>
            </div>
            
            {/* Winner section if election has ended */}
            {results.electionStatus === 'Ended' && results.results.length > 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-6 bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border border-emerald-100"
              >
                <h2 className="text-xl font-semibold text-emerald-800">Winner</h2>
                <div className="mt-4 flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    {results.results[0].profileImage ? (
                      <img 
                        src={results.results[0].profileImage} 
                        alt={results.results[0].candidateName}
                        className="h-16 w-16 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 text-xl font-bold">
                        {results.results[0].candidateName.charAt(0)}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900">
                      {results.results[0].candidateName}
                    </h3>
                    <p className="mt-1 text-emerald-700">
                      <span className="font-bold">{results.results[0].votes} votes</span>
                      {results.totalVotes > 0 && (
                        <span className="ml-2">
                          ({Math.round((results.results[0].votes / results.totalVotes) * 100)}%)
                        </span>
                      )}
                    </p>
                    <p className="mt-2 text-sm text-gray-600">{results.results[0].manifesto}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Charts section */}
        {chartData && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            <div className="bg-white rounded-xl shadow-md p-6">
              <Bar data={chartData.barData} options={barOptions} />
            </div>
            <div className="bg-white rounded-xl shadow-md p-6">
              <Doughnut data={chartData.doughnutData} options={doughnutOptions} />
            </div>
          </motion.div>
        )}

        {/* Results table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
            <h2 className="text-xl font-semibold text-gray-900">All Candidates Results</h2>
          </div>
          
          <div className="p-6">
            {results.results.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-gray-500">No votes have been cast in this election yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rank
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Candidate
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Votes
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Percentage
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {results.results.map((result, index) => (
                      <motion.tr 
                        key={result.candidateId}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 * index }}
                        className={index === 0 && results.electionStatus === 'Ended' ? 'bg-green-50' : ''}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">#{index + 1}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              {result.profileImage ? (
                                <img className="h-10 w-10 rounded-full" src={result.profileImage} alt="" />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                                  <span className="text-gray-700 font-medium">{result.candidateName.charAt(0)}</span>
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {result.candidateName}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {result.votes}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {results.totalVotes > 0 ? (
                            <div className="flex items-center">
                              <span className="text-sm text-gray-900">
                                {Math.round((result.votes / results.totalVotes) * 100)}%
                              </span>
                              <div className="ml-2 w-24 bg-gray-200 rounded-full h-2.5">
                                <div 
                                  className="bg-blue-600 h-2.5 rounded-full" 
                                  style={{ width: `${Math.round((result.votes / results.totalVotes) * 100)}%` }}
                                ></div>
                              </div>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-900">0%</span>
                          )}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ElectionResults;