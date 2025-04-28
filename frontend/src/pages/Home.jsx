import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const { user } = useAuth();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  // Features data
  const features = [
    {
      title: 'Secure Voting',
      description: 'Our system uses state-of-the-art security protocols to ensure your vote is secure and confidential.',
      icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z'
    },
    {
      title: 'Real-Time Results',
      description: 'Watch results update in real-time as votes are counted during and after elections.',
      icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
    },
    {
      title: 'Run for Office',
      description: 'Apply as a candidate in any eligible election and promote your platform to voters.',
      icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
    },
    {
      title: 'Multiple Elections',
      description: 'Participate in various elections ranging from local communities to national level votes.',
      icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10'
    },
    {
      title: 'Mobile Friendly',
      description: 'Vote from anywhere using your smartphone, tablet, or computer with our responsive design.',
      icon: 'M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z'
    },
    {
      title: 'Detailed Analytics',
      description: 'Access comprehensive election statistics and voter turnout data for each election.',
      icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
    }
  ];

  return (
    <div className="pb-16">
      {/* Hero section */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative bg-gradient-to-r from-primary-600 to-primary-800 overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative z-10 py-8 sm:py-16 md:py-20 lg:py-28 lg:max-w-2xl lg:w-full">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center lg:text-left"
            >
              <h1 className="text-4xl tracking-tight font-extrabold text-white sm:text-5xl md:text-6xl">
                <span className="block">Modern Solutions for</span>
                <span className="block text-indigo-200">Democratic Voting</span>
              </h1>
              <p className="mt-3 text-base text-white sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                Secure, transparent, and user-friendly online voting system for elections of all sizes. Exercise your democratic right with confidence.
              </p>
              <div className="mt-8 sm:flex sm:justify-center lg:justify-start space-x-4">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/elections"
                    className="btn btn-white px-8 py-3 text-base font-medium rounded-md shadow"
                  >
                    Browse Elections
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  {user ? (
                    <Link
                      to="/user"
                      className="btn bg-primary-700 border border-transparent text-white px-8 py-3 text-base font-medium rounded-md shadow hover:bg-primary-800"
                    >
                      My Dashboard
                    </Link>
                  ) : (
                    <Link
                      to="/login"
                      className="btn bg-primary-700 border border-transparent text-white px-8 py-3 text-base font-medium rounded-md shadow hover:bg-primary-800"
                    >
                      Get Started
                    </Link>
                  )}
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.15 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2"
        >
          <svg
            className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full"
            fill="none"
            viewBox="0 0 800 800"
          >
            <g opacity="0.8">
              <circle cx="400" cy="400" r="200" stroke="white" strokeWidth="2" />
              <circle cx="400" cy="400" r="300" stroke="white" strokeWidth="2" />
              <circle cx="400" cy="400" r="100" stroke="white" strokeWidth="2" />
              <line x1="0" y1="400" x2="800" y2="400" stroke="white" strokeWidth="2" />
              <line x1="400" y1="0" x2="400" y2="800" stroke="white" strokeWidth="2" />
            </g>
          </svg>
        </motion.div>
      </motion.div>

      {/* Stats section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gray-50 py-12 sm:py-16"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Trusted by voters worldwide
            </h2>
            <p className="mt-3 text-xl text-gray-500 sm:mt-4">
              Our platform has been used for elections at all levels, from local communities to national organizations.
            </p>
          </div>
          <dl className="mt-10 text-center sm:max-w-3xl sm:mx-auto sm:grid sm:grid-cols-3 sm:gap-8">
            <div className="flex flex-col">
              <dt className="order-2 mt-2 text-lg leading-6 font-medium text-gray-500">Elections Conducted</dt>
              <dd className="order-1 text-5xl font-extrabold text-primary-600">1,000+</dd>
            </div>
            <div className="flex flex-col mt-10 sm:mt-0">
              <dt className="order-2 mt-2 text-lg leading-6 font-medium text-gray-500">Registered Voters</dt>
              <dd className="order-1 text-5xl font-extrabold text-primary-600">250K+</dd>
            </div>
            <div className="flex flex-col mt-10 sm:mt-0">
              <dt className="order-2 mt-2 text-lg leading-6 font-medium text-gray-500">Votes Cast</dt>
              <dd className="order-1 text-5xl font-extrabold text-primary-600">5M+</dd>
            </div>
          </dl>
        </div>
      </motion.div>

      {/* Features section */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="py-12 bg-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-primary-600 font-semibold tracking-wide uppercase">Features</h2>
            <motion.p variants={itemVariants} className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              A better way to vote
            </motion.p>
            <motion.p variants={itemVariants} className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Our system combines security, ease of use, and transparent results to create the perfect voting experience.
            </motion.p>
          </div>

          <div className="mt-10">
            <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-8">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  variants={itemVariants}
                  className="pt-6"
                >
                  <div className="flow-root bg-gray-50 rounded-lg px-6 pb-8 h-full border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="-mt-6">
                      <div>
                        <span className="inline-flex items-center justify-center p-3 bg-primary-600 rounded-md shadow-lg">
                          <svg 
                            className="h-6 w-6 text-white" 
                            xmlns="http://www.w3.org/2000/svg" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feature.icon} />
                          </svg>
                        </span>
                      </div>
                      <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">{feature.title}</h3>
                      <p className="mt-5 text-base text-gray-500">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* CTA Section */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-primary-700"
      >
        <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            <span className="block">Ready to get started?</span>
            <span className="block">Join our platform today.</span>
          </h2>
          <p className="mt-4 text-lg leading-6 text-primary-200">
            Create an account, browse active elections, or apply as a candidate. Democracy starts with your participation.
          </p>
          <motion.div 
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.95 }}
            className="mt-8"
          >
            {user ? (
              <Link
                to="/user"
                className="btn btn-white py-3 px-8 text-lg font-medium rounded-md shadow-md"
              >
                Go to Dashboard
              </Link>
            ) : (
              <Link
                to="/register"
                className="btn btn-white py-3 px-8 text-lg font-medium rounded-md shadow-md"
              >
                Sign up for free
              </Link>
            )}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Home;