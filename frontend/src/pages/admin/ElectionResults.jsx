import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from '../../api/axios';
import { FaArrowLeft, FaDownload, FaChartBar } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import LoadingScreen from '../../components/common/LoadingScreen';


const ElectionResults = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [election, setElection] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewType, setViewType] = useState('chart');

  useEffect(() => {
    const fetchElectionData = async () => {
      try {
        setLoading(true);

        const electionResponse = await axios.get(`/elections/${id}`);
        setElection(electionResponse.data);

        let resultsResponse;
        if (electionResponse.data.status === 'Ended') {
          resultsResponse = await axios.get(`/votes/results/${id}`);
        } else {
          resultsResponse = await axios.get(`/elections/live/${id}`);
        }

        setResults(resultsResponse.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching election results:', err);
        setError(err.response?.data?.message || 'Failed to load election results');
      } finally {
        setLoading(false);
      }
    };

    if (user && user.role === 'admin') {
      fetchElectionData();
    } else {
      setError('You must be an admin to view this page');
      setLoading(false);
    }
  }, [id, user]);

  const calculatePercentage = (votes, totalVotes) => {
    if (totalVotes === 0) return 0;
    return ((votes / totalVotes) * 100).toFixed(1);
  };

  const exportCSV = () => {
    if (!results) return;

    const csvContent = [
      ['Candidate', 'Votes', 'Percentage'],
      ...results.results.map(candidate => [
        candidate.candidateName,
        candidate.votes,
        `${calculatePercentage(candidate.votes, results.totalVotes)}%`
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${election.title.replace(/\s+/g, '_')}_results.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorAlert message={error} />;
  if (!election || !results) return <ErrorAlert message="Election data could not be loaded" />;

  const sortedResults = [...results.results].sort((a, b) => b.votes - a.votes);
  const winner = sortedResults[0]?.candidateName || 'No candidates';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex justify-between items-center">
        <Link to="/admin/elections" className="flex items-center text-primary-600 hover:text-primary-700">
          <FaArrowLeft className="mr-2" />
          Back to Elections
        </Link>

        <div className="flex space-x-2">
          <button
            onClick={() => setViewType('chart')}
            className={`px-3 py-2 rounded ${viewType === 'chart' ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}
          >
            <FaChartBar className="inline mr-1" /> Chart View
          </button>
          <button
            onClick={() => setViewType('table')}
            className={`px-3 py-2 rounded ${viewType === 'table' ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}
          >
            Table View
          </button>
          <button
            onClick={exportCSV}
            className="bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700"
          >
            <FaDownload className="inline mr-1" /> Export CSV
          </button>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h1 className="text-2xl font-bold mb-2">{election.title} - Results</h1>
        <div className="text-sm text-gray-500 mb-4">
          Status: <span className={`font-semibold ${election.status === 'Ended' ? 'text-red-500' : 'text-green-500'}`}>
            {election.status}
          </span>
          {election.status === 'Ended' ? ' (Final Results)' : ' (Live Results)'}
        </div>

        <div className="mb-4">
          <p className="text-lg">Total Votes: <span className="font-bold">{results.totalVotes}</span></p>
          {election.status === 'Ended' && (
            <p className="text-lg">Winner: <span className="font-bold text-primary-600">{winner}</span></p>
          )}
        </div>
      </div>

      {viewType === 'chart' ? (
        <div className="bg-white shadow-md rounded-lg p-6">
          {sortedResults.map((candidate) => (
            <div key={candidate.candidateId} className="mb-4">
              <div className="flex justify-between mb-1">
                <span className="font-semibold">{candidate.candidateName}</span>
                <span>{candidate.votes} votes ({calculatePercentage(candidate.votes, results.totalVotes)}%)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div 
                  className="bg-primary-600 h-4 rounded-full transition-all duration-500 ease-in-out" 
                  style={{ width: `${calculatePercentage(candidate.votes, results.totalVotes)}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Candidate</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Votes</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedResults.map((candidate, index) => (
                <tr key={candidate.candidateId} className={index === 0 && election.status === 'Ended' ? 'bg-green-50' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap">{index + 1}</td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">
                    {candidate.candidateName}
                    {index === 0 && election.status === 'Ended' && <span className="ml-2 text-green-600">(Winner)</span>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{candidate.votes}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{calculatePercentage(candidate.votes, results.totalVotes)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ElectionResults;
