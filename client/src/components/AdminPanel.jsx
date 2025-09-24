import React, { useState, useEffect, useCallback } from "react";
import { useWallet } from "./WalletContext.jsx";

function AdminPanel() {
  const { contract, account, isAdmin, getAccountName } = useWallet();
  const [allLands, setAllLands] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUserTransactions, setSelectedUserTransactions] =
    useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("lands"); // "lands" or "users"

  const fetchAllLands = useCallback(async () => {
    if (!contract || !isAdmin) return;
    setIsLoading(true);
    setError("");
    try {
      const lands = await contract.methods
        .getAllLands()
        .call({ from: account });
      setAllLands(lands);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch lands. See console for details.");
    } finally {
      setIsLoading(false);
    }
  }, [contract, account, isAdmin]);

  const fetchAllUsers = useCallback(async () => {
    if (!contract || !isAdmin) return;
    setIsLoading(true);
    setError("");
    try {
      // Fetch user transaction summary
      const result = await contract.methods
        .getAllUsersTransactionSummary()
        .call({ from: account });

      const [addresses, registered, sold, purchased] = result;

      // Get user details for each address
      const usersData = await Promise.all(
        addresses.map(async (address, index) => {
          try {
            const userDetails = await contract.methods
              .getUserDetails(address)
              .call();
            return {
              address,
              fullName: userDetails.fullName,
              email: userDetails.email,
              isApproved: userDetails.isApproved,
              isRegistered: userDetails.isRegistered,
              registeredCount: Number(registered[index]),
              soldCount: Number(sold[index]),
              purchasedCount: Number(purchased[index]),
              totalTransactions:
                Number(registered[index]) +
                Number(sold[index]) +
                Number(purchased[index]),
            };
          } catch (err) {
            console.error("Error fetching user details for", address, err);
            return {
              address,
              fullName: getAccountName(address),
              email: "N/A",
              isApproved: false,
              isRegistered: false,
              registeredCount: Number(registered[index]),
              soldCount: Number(sold[index]),
              purchasedCount: Number(purchased[index]),
              totalTransactions:
                Number(registered[index]) +
                Number(sold[index]) +
                Number(purchased[index]),
            };
          }
        })
      );

      setAllUsers(usersData);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch users. See console for details.");
    } finally {
      setIsLoading(false);
    }
  }, [contract, account, isAdmin, getAccountName]);

  const fetchUserTransactions = async (userAddress) => {
    if (!contract || !isAdmin) return;
    setIsLoading(true);
    setError("");
    try {
      const result = await contract.methods
        .getUserTransactionHistory(userAddress)
        .call({ from: account });

      const [ownedIds, soldIds, purchasedIds] = result;

      // Fetch land details for each category
      const ownedLands = await Promise.all(
        ownedIds.map((id) => contract.methods.lands(Number(id)).call())
      );
      const soldLands = await Promise.all(
        soldIds.map((id) => contract.methods.lands(Number(id)).call())
      );
      const purchasedLands = await Promise.all(
        purchasedIds.map((id) => contract.methods.lands(Number(id)).call())
      );

      const userDetails = await contract.methods
        .getUserDetails(userAddress)
        .call();

      setSelectedUserTransactions({
        userAddress,
        userDetails,
        ownedLands: ownedLands.map((land) => ({
          ...land,
          id: Number(land.id),
        })),
        soldLands: soldLands.map((land) => ({ ...land, id: Number(land.id) })),
        purchasedLands: purchasedLands.map((land) => ({
          ...land,
          id: Number(land.id),
        })),
      });
    } catch (err) {
      console.error(err);
      setError("Failed to fetch user transactions. See console for details.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      if (activeTab === "lands") {
        fetchAllLands();
      } else if (activeTab === "users") {
        fetchAllUsers();
      }
    }
  }, [isAdmin, activeTab, fetchAllLands, fetchAllUsers]);

  const filteredLands = allLands.filter(
    (land) =>
      land.plotNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      land.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      land.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
      land.owner.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUsers = allUsers.filter(
    (user) =>
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-primary flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="card p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-red-600 dark:text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Access Denied
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              You need administrator privileges to access this panel.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Admin Panel
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage and monitor all registered lands and user transactions in the
            system.
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200 dark:border-dark-border">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("lands")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "lands"
                    ? "border-primary-500 text-primary-600 dark:text-primary-400"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
                }`}
              >
                All Lands ({allLands.length})
              </button>
              <button
                onClick={() => setActiveTab("users")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "users"
                    ? "border-primary-500 text-primary-600 dark:text-primary-400"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
                }`}
              >
                User Transactions ({allUsers.length})
              </button>
            </nav>
          </div>
        </div>

        {/* Stats Cards */}
        {activeTab === "lands" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="card p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/50 rounded-lg flex items-center justify-center mr-4">
                  <svg
                    className="w-6 h-6 text-primary-600 dark:text-primary-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Total Lands
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {allLands.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center mr-4">
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
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    For Sale
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {allLands.filter((land) => land.isForSale).length}
                  </p>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center mr-4">
                  <svg
                    className="w-6 h-6 text-blue-600 dark:text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Unique Owners
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {new Set(allLands.map((land) => land.owner)).size}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="card p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-lg flex items-center justify-center mr-4">
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
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Total Users
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {allUsers.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center mr-4">
                  <svg
                    className="w-6 h-6 text-blue-600 dark:text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Total Registrations
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {allUsers.reduce(
                      (sum, user) => sum + user.registeredCount,
                      0
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center mr-4">
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
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Total Sales
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {allUsers.reduce((sum, user) => sum + user.soldCount, 0)}
                  </p>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/50 rounded-lg flex items-center justify-center mr-4">
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
                      d="M16 11V7a4 4 0 00-8 0v4M8 11v6a2 2 0 002 2h4a2 2 0 002-2v-6M8 11h8"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Total Purchases
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {allUsers.reduce(
                      (sum, user) => sum + user.purchasedCount,
                      0
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search and Refresh */}
        <div className="card p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  placeholder={
                    activeTab === "lands"
                      ? "Search by plot number, city, state, or owner..."
                      : "Search by name, email, or address..."
                  }
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 input-field"
                />
              </div>
            </div>
            <button
              onClick={activeTab === "lands" ? fetchAllLands : fetchAllUsers}
              disabled={isLoading}
              className="btn-primary"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Refreshing...
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Refresh
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 rounded-lg border bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* User Transaction Detail Modal */}
        {selectedUserTransactions && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-dark-secondary rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 dark:border-dark-border">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      User Transaction History
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300">
                      {selectedUserTransactions.userDetails.fullName}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedUserTransactions(null)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-6">
                {/* User Info */}
                <div className="mb-6 p-4 bg-gray-50 dark:bg-dark-tertiary rounded-lg">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    User Details
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">
                        Email:
                      </span>
                      <span className="ml-2 text-gray-900 dark:text-white">
                        {selectedUserTransactions.userDetails.email}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">
                        Address:
                      </span>
                      <span className="ml-2 text-gray-900 dark:text-white font-mono text-xs">
                        {selectedUserTransactions.userAddress}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">
                        Phone:
                      </span>
                      <span className="ml-2 text-gray-900 dark:text-white">
                        {selectedUserTransactions.userDetails.phone}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">
                        Status:
                      </span>
                      <span
                        className={`ml-2 px-2 py-1 text-xs rounded-full ${
                          selectedUserTransactions.userDetails.isApproved
                            ? "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200"
                            : "bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200"
                        }`}
                      >
                        {selectedUserTransactions.userDetails.isApproved
                          ? "Approved"
                          : "Pending"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Transaction Categories */}
                <div className="space-y-6">
                  {/* Owned Lands */}
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                      Currently Owned Lands (
                      {selectedUserTransactions.ownedLands.length})
                    </h3>
                    {selectedUserTransactions.ownedLands.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedUserTransactions.ownedLands.map((land) => (
                          <div
                            key={land.id}
                            className="border border-gray-200 dark:border-dark-border rounded-lg p-3"
                          >
                            <div className="font-medium text-gray-900 dark:text-white">
                              Plot #{land.plotNumber}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {land.area}, {land.city}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {land.areaSqYd} sq yards
                            </div>
                            <div className="mt-2">
                              {land.isForSale ? (
                                <span className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 rounded-full">
                                  For Sale
                                </span>
                              ) : (
                                <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full">
                                  Private
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400 italic">
                        No lands currently owned
                      </p>
                    )}
                  </div>

                  {/* Sold Lands */}
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                      Previously Sold Lands (
                      {selectedUserTransactions.soldLands.length})
                    </h3>
                    {selectedUserTransactions.soldLands.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedUserTransactions.soldLands.map((land) => (
                          <div
                            key={land.id}
                            className="border border-gray-200 dark:border-dark-border rounded-lg p-3 bg-red-50 dark:bg-red-900/10"
                          >
                            <div className="font-medium text-gray-900 dark:text-white">
                              Plot #{land.plotNumber}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {land.area}, {land.city}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {land.areaSqYd} sq yards
                            </div>
                            <div className="text-sm text-red-600 dark:text-red-400 mt-1">
                              Current Owner: {getAccountName(land.owner)}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400 italic">
                        No lands sold
                      </p>
                    )}
                  </div>

                  {/* Purchased Lands */}
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                      Previously Purchased Lands (
                      {selectedUserTransactions.purchasedLands.length})
                    </h3>
                    {selectedUserTransactions.purchasedLands.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedUserTransactions.purchasedLands.map((land) => (
                          <div
                            key={land.id}
                            className="border border-gray-200 dark:border-dark-border rounded-lg p-3 bg-green-50 dark:bg-green-900/10"
                          >
                            <div className="font-medium text-gray-900 dark:text-white">
                              Plot #{land.plotNumber}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {land.area}, {land.city}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {land.areaSqYd} sq yards
                            </div>
                            <div className="text-sm text-green-600 dark:text-green-400 mt-1">
                              Purchased from previous owner
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400 italic">
                        No lands purchased
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Content Tables */}
        <div className="card overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              <span className="ml-3 text-gray-600 dark:text-gray-300">
                Loading {activeTab === "lands" ? "all lands" : "user data"}...
              </span>
            </div>
          ) : activeTab === "lands" ? (
            // Lands Table
            filteredLands.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-border">
                  <thead className="bg-gray-50 dark:bg-dark-tertiary">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Land ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Plot Number
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Area (Sq. Yards)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Owner
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-dark-secondary divide-y divide-gray-200 dark:divide-dark-border">
                    {filteredLands.map((land) => (
                      <tr
                        key={land.id}
                        className="hover:bg-gray-50 dark:hover:bg-dark-tertiary transition-colors duration-200"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          #{land.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {land.plotNumber}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                          <div>
                            <div>{land.area}</div>
                            <div className="text-gray-500 dark:text-gray-400">
                              {land.city}, {land.state}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {land.areaSqYd}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                          <div className="font-mono text-xs bg-gray-100 dark:bg-dark-tertiary px-2 py-1 rounded">
                            {land.owner.substring(0, 10)}...
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {land.isForSale ? (
                            <span className="px-2 py-1 text-xs font-medium bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 rounded-full">
                              For Sale
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full">
                              Private
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <svg
                  className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                <p className="text-gray-500 dark:text-gray-400">
                  {searchTerm
                    ? "No lands found matching your search."
                    : "No lands registered yet."}
                </p>
              </div>
            )
          ) : // Users Table
          filteredUsers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-border">
                <thead className="bg-gray-50 dark:bg-dark-tertiary">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Registered
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Sold
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Purchased
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Total Activity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-dark-secondary divide-y divide-gray-200 dark:divide-dark-border">
                  {filteredUsers.map((user) => (
                    <tr
                      key={user.address}
                      className="hover:bg-gray-50 dark:hover:bg-dark-tertiary transition-colors duration-200"
                    >
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                        <div>
                          <div className="font-medium">{user.fullName}</div>
                          <div className="text-gray-500 dark:text-gray-400 text-xs">
                            {user.email !== "N/A" ? user.email : ""}
                          </div>
                          <div className="font-mono text-xs text-gray-500 dark:text-gray-400">
                            {user.address.substring(0, 10)}...
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.isApproved ? (
                          <span className="px-2 py-1 text-xs font-medium bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 rounded-full">
                            Approved
                          </span>
                        ) : user.isRegistered ? (
                          <span className="px-2 py-1 text-xs font-medium bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200 rounded-full">
                            Pending
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full">
                            Not Registered
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        <div className="text-center">
                          <div className="text-lg font-semibold">
                            {user.registeredCount}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            lands
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        <div className="text-center">
                          <div className="text-lg font-semibold">
                            {user.soldCount}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            sales
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        <div className="text-center">
                          <div className="text-lg font-semibold">
                            {user.purchasedCount}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            purchases
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        <div className="text-center">
                          <div className="text-xl font-bold text-primary-600 dark:text-primary-400">
                            {user.totalTransactions}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            total
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => fetchUserTransactions(user.address)}
                          disabled={isLoading}
                          className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-200 font-medium"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <svg
                className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm
                  ? "No users found matching your search."
                  : "No users registered yet."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;
