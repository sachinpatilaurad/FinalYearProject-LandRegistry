import React from "react";

function FeaturesPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Core Features
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Discover the powerful features that make our blockchain land
            registry the most secure and efficient solution for property
            management.
          </p>
        </div>

        {/* Main Features */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {/* Feature 1 */}
          <div className="group">
            <div className="card p-8 text-center hover:shadow-xl transform hover:scale-105 transition-all duration-300 h-full">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg
                  className="w-10 h-10 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                User-Owned Registration
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Any user can register their own property directly on the
                blockchain, establishing a clear and immediate proof of
                ownership without intermediaries.
              </p>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="group">
            <div className="card p-8 text-center hover:shadow-xl transform hover:scale-105 transition-all duration-300 h-full">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg
                  className="w-10 h-10 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Secure Transfer Protocol
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                A multi-step transfer process (listing, request, approve/deny)
                ensures that property transfers are intentional, secure, and
                properly authorized.
              </p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="group">
            <div className="card p-8 text-center hover:shadow-xl transform hover:scale-105 transition-all duration-300 h-full">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg
                  className="w-10 h-10 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Admin Oversight
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                A designated admin account has the ability to view all
                properties on the network, ensuring regulatory compliance and
                system oversight.
              </p>
            </div>
          </div>
        </div>

        {/* Technical Features */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">
            Technical Excellence
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="card p-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-6 h-6 text-purple-600 dark:text-purple-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Smart Contract Security
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300">
                    Built with Solidity 0.8.9, our smart contracts include
                    comprehensive access controls, ownership verification, and
                    protection against common vulnerabilities.
                  </p>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-6 h-6 text-indigo-600 dark:text-indigo-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Ownership History Tracking
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300">
                    Complete audit trail of all ownership changes with
                    timestamps, providing transparency and historical
                    verification for all property transfers.
                  </p>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-6 h-6 text-green-600 dark:text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Gas Optimized Operations
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300">
                    Efficient smart contract design minimizes transaction costs
                    while maintaining security and functionality for all
                    operations.
                  </p>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-6 h-6 text-orange-600 dark:text-orange-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Web3 Integration
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300">
                    Seamless integration with MetaMask and other Web3 wallets
                    for secure transaction signing and account management.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* User Journey */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">
            How It Works
          </h2>
          <div className="relative">
            {/* Timeline */}
            <div className="hidden md:block absolute left-1/2 transform -translate-x-px h-full w-0.5 bg-gray-300 dark:bg-gray-600"></div>

            <div className="space-y-12">
              {/* Step 1 */}
              <div className="relative flex items-center md:justify-start">
                <div className="flex items-center md:w-1/2 md:pr-8">
                  <div className="card p-6 w-full">
                    <div className="flex items-center mb-4">
                      <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                        1
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Connect Wallet
                      </h3>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300">
                      Connect your Web3 wallet (MetaMask) to interact with the
                      blockchain and establish your identity.
                    </p>
                  </div>
                </div>
                <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 w-3 h-3 bg-primary-600 rounded-full"></div>
              </div>

              {/* Step 2 */}
              <div className="relative flex items-center md:justify-end">
                <div className="flex items-center md:w-1/2 md:pl-8">
                  <div className="card p-6 w-full">
                    <div className="flex items-center mb-4">
                      <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                        2
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Register Property
                      </h3>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300">
                      Submit your land details including plot number, location,
                      and area to register it on the blockchain.
                    </p>
                  </div>
                </div>
                <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 w-3 h-3 bg-primary-600 rounded-full"></div>
              </div>

              {/* Step 3 */}
              <div className="relative flex items-center md:justify-start">
                <div className="flex items-center md:w-1/2 md:pr-8">
                  <div className="card p-6 w-full">
                    <div className="flex items-center mb-4">
                      <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                        3
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Manage & Transfer
                      </h3>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300">
                      Put your land for sale, approve transfer requests, or
                      explore other properties available in the marketplace.
                    </p>
                  </div>
                </div>
                <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 w-3 h-3 bg-primary-600 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <div className="card p-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Ready to Secure Your Land?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Join the future of property management with our blockchain-powered
              land registry system.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/manage-land"
                className="inline-flex items-center px-8 py-4 text-lg font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                Get Started Now
                <svg
                  className="w-5 h-5 ml-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </a>
              <a
                href="/about"
                className="inline-flex items-center px-8 py-4 text-lg font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-dark-tertiary hover:bg-gray-50 dark:hover:bg-gray-600 border border-gray-300 dark:border-dark-border rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                Learn More
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FeaturesPage;
