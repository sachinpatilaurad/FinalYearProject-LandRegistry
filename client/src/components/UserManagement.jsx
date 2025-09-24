import React, { useState, useEffect } from "react";
import { useWallet } from "./WalletContext.jsx";

function UserManagement() {
  const { account, contract, isAdmin } = useWallet();
  const [pendingUsers, setPendingUsers] = useState([]);
  const [approvedUsers, setApprovedUsers] = useState([]);
  const [activeTab, setActiveTab] = useState("pending");
  const [isLoading, setIsLoading] = useState(true);
  const [processingUser, setProcessingUser] = useState(null);

  useEffect(() => {
    if (contract && account && isAdmin) {
      loadUsers();
    }
  }, [contract, account, isAdmin]);

  const loadUsers = async () => {
    try {
      setIsLoading(true);

      // Load pending users
      const pendingAddresses = await contract.methods
        .getPendingUsers()
        .call({ from: account });
      const pendingUsersDetails = await Promise.all(
        pendingAddresses.map(async (address) => {
          const details = await contract.methods.getUserDetails(address).call();
          return {
            address,
            fullName: details.fullName,
            email: details.email,
            phone: details.phone,
            nationalId: details.nationalId,
            homeAddress: details.homeAddress,
            registrationTime: Number(details.registrationTime),
          };
        })
      );
      setPendingUsers(pendingUsersDetails);

      // Load approved users
      const approvedAddresses = await contract.methods
        .getApprovedUsers()
        .call({ from: account });
      const approvedUsersDetails = await Promise.all(
        approvedAddresses.map(async (address) => {
          const details = await contract.methods.getUserDetails(address).call();
          return {
            address,
            fullName: details.fullName,
            email: details.email,
            phone: details.phone,
            nationalId: details.nationalId,
            homeAddress: details.homeAddress,
            registrationTime: Number(details.registrationTime),
          };
        })
      );
      setApprovedUsers(approvedUsersDetails);
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveUser = async (userAddress) => {
    try {
      setProcessingUser(userAddress);
      await contract.methods.approveUser(userAddress).send({ from: account });
      alert("User approved successfully!");
      await loadUsers();
    } catch (error) {
      console.error("Error approving user:", error);
      alert("Error approving user: " + error.message);
    } finally {
      setProcessingUser(null);
    }
  };

  const handleRejectUser = async (userAddress) => {
    if (
      !window.confirm("Are you sure you want to reject this user registration?")
    ) {
      return;
    }

    try {
      setProcessingUser(userAddress);
      await contract.methods.rejectUser(userAddress).send({ from: account });
      alert("User registration rejected.");
      await loadUsers();
    } catch (error) {
      console.error("Error rejecting user:", error);
      alert("Error rejecting user: " + error.message);
    } finally {
      setProcessingUser(null);
    }
  };

  if (!account) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-primary flex items-center justify-center">
        <div className="card p-8 text-center max-w-md">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Wallet Not Connected
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Please connect your wallet to access user management.
          </p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-primary flex items-center justify-center">
        <div className="card p-8 text-center max-w-md">
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
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Access Denied
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Only administrators can access user management.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            User Management
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage user registrations and approvals
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/50 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-yellow-600 dark:text-yellow-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Pending Approvals
                </h3>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {pendingUsers.length}
                </p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center">
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
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Approved Users
                </h3>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {approvedUsers.length}
                </p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center">
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
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Total Users
                </h3>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {pendingUsers.length + approvedUsers.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="card mb-6">
          <div className="border-b border-gray-200 dark:border-dark-border">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab("pending")}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === "pending"
                    ? "border-primary-500 text-primary-600 dark:text-primary-400"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                Pending Approvals ({pendingUsers.length})
              </button>
              <button
                onClick={() => setActiveTab("approved")}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === "approved"
                    ? "border-primary-500 text-primary-600 dark:text-primary-400"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                Approved Users ({approvedUsers.length})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-300">
                  Loading users...
                </p>
              </div>
            ) : (
              <>
                {activeTab === "pending" && (
                  <div className="space-y-4">
                    {pendingUsers.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                          <svg
                            className="w-8 h-8 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                            />
                          </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                          No Pending Registrations
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300">
                          All user registrations have been processed.
                        </p>
                      </div>
                    ) : (
                      pendingUsers.map((user) => (
                        <div
                          key={user.address}
                          className="border border-gray-200 dark:border-dark-border rounded-lg p-6"
                        >
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {user.fullName}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-300 font-mono">
                                {user.address}
                              </p>
                            </div>
                            <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300 rounded-full text-sm font-medium">
                              Pending
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Email
                              </p>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {user.email}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Phone
                              </p>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {user.phone || "Not provided"}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                National ID
                              </p>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {user.nationalId}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Registration Date
                              </p>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {new Date(
                                  user.registrationTime * 1000
                                ).toLocaleDateString()}
                              </p>
                            </div>
                            {user.homeAddress && (
                              <div className="md:col-span-2">
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  Home Address
                                </p>
                                <p className="font-medium text-gray-900 dark:text-white">
                                  {user.homeAddress}
                                </p>
                              </div>
                            )}
                          </div>

                          <div className="flex space-x-4">
                            <button
                              onClick={() => handleApproveUser(user.address)}
                              disabled={processingUser === user.address}
                              className="btn-primary"
                            >
                              {processingUser === user.address ? (
                                <>
                                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                                  Processing...
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
                                      d="M5 13l4 4L19 7"
                                    />
                                  </svg>
                                  Approve
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => handleRejectUser(user.address)}
                              disabled={processingUser === user.address}
                              className="btn-secondary text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                            >
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
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                              Reject
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {activeTab === "approved" && (
                  <div className="space-y-4">
                    {approvedUsers.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                          <svg
                            className="w-8 h-8 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                            />
                          </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                          No Approved Users
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300">
                          No users have been approved yet.
                        </p>
                      </div>
                    ) : (
                      approvedUsers.map((user) => (
                        <div
                          key={user.address}
                          className="border border-gray-200 dark:border-dark-border rounded-lg p-6"
                        >
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {user.fullName}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-300 font-mono">
                                {user.address}
                              </p>
                            </div>
                            <span className="px-3 py-1 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 rounded-full text-sm font-medium">
                              Approved
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Email
                              </p>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {user.email}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Phone
                              </p>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {user.phone || "Not provided"}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                National ID
                              </p>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {user.nationalId}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Registration Date
                              </p>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {new Date(
                                  user.registrationTime * 1000
                                ).toLocaleDateString()}
                              </p>
                            </div>
                            {user.homeAddress && (
                              <div className="md:col-span-2">
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  Home Address
                                </p>
                                <p className="font-medium text-gray-900 dark:text-white">
                                  {user.homeAddress}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserManagement;
