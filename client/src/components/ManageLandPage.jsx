import React, { useState, useEffect, useCallback } from "react";
import { useWallet } from "./WalletContext.jsx";
import ConfirmationDialog from "./ConfirmationDialog.jsx";
import LandSelectionMap from "./LandSelectionMap.jsx";
import LandCertificate from "./LandCertificate.jsx";

function ManageLandPage() {
  const {
    contract,
    account,
    getAccountName,
    isUserApproved,
    isUserRegistered,
  } = useWallet();
  const [activeSection, setActiveSection] = useState("show");
  const [isLoading, setIsLoading] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState(null);

  // State for Forms
  const [formData, setFormData] = useState({
    plotNumber: "",
    area: "",
    district: "",
    city: "",
    state: "",
    areaSqYd: "",
  });

  // State for Displaying Data
  const [ownedLands, setOwnedLands] = useState([]);
  const [landsForSale, setLandsForSale] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);

  // State for Dialog
  const [confirmDialog, setConfirmDialog] = useState({
    show: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  // --- Data Fetching ---
  const fetchAllData = useCallback(async () => {
    if (!contract || !account) return;
    setIsLoading(true);
    try {
      // Fetch Owned Lands
      const ownedLandIds = await contract.methods
        .getLandsByOwner(account)
        .call();
      const ownedDetails = await Promise.all(
        ownedLandIds.map((id) => contract.methods.lands(id).call())
      );
      setOwnedLands(ownedDetails);

      // Fetch Pending Requests
      const pendingRequestIds = await contract.methods
        .getPendingTransferRequests(account)
        .call();
      const requestDetails = await Promise.all(
        pendingRequestIds.map(async (id) => {
          const land = await contract.methods.lands(id).call();
          return {
            ...land,
            requesterName: getAccountName(land.transferRequest),
          };
        })
      );
      setPendingRequests(requestDetails);

      // Fetch All Lands for Sale
      const landCount = await contract.methods.landCount().call();
      const forSale = [];
      for (let i = 1; i <= landCount; i++) {
        const land = await contract.methods.lands(i).call();
        if (
          land.isForSale &&
          land.owner.toLowerCase() !== account.toLowerCase()
        ) {
          forSale.push({ ...land, ownerName: getAccountName(land.owner) });
        }
      }
      setLandsForSale(forSale);
    } catch (error) {
      console.error("Error fetching data:", error);
      setTransactionStatus({
        type: "error",
        message: "Failed to fetch blockchain data.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [contract, account, getAccountName]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // --- Handlers for Contract Interactions ---
  const handleInputChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // Handle location data from map selection
  const handleLocationDataChange = (locationData) => {
    if (locationData) {
      setFormData((prev) => ({
        ...prev,
        area: locationData.area || prev.area,
        city: locationData.city || prev.city,
        district: locationData.district || prev.district,
        state: locationData.state || prev.state,
        areaSqYd: locationData.areaSqYd
          ? locationData.areaSqYd.toString()
          : prev.areaSqYd,
        // Store coordinates for future use if needed
        coordinates: locationData.coordinates,
        centerCoordinates: locationData.centerCoordinates,
      }));
    }
  };

  const handleRegister = async () => {
    setConfirmDialog({ show: false });
    setIsLoading(true);
    setTransactionStatus({
      type: "info",
      message: "Processing registration...",
    });
    try {
      await contract.methods
        .registerLand(
          formData.plotNumber,
          formData.area,
          formData.district,
          formData.city,
          formData.state,
          formData.areaSqYd
        )
        .send({ from: account, gas: "1000000" });
      setTransactionStatus({
        type: "success",
        message: "Land registered successfully!",
      });
      setFormData({
        plotNumber: "",
        area: "",
        district: "",
        city: "",
        state: "",
        areaSqYd: "",
      });
      fetchAllData();
    } catch (error) {
      console.error(error);
      setTransactionStatus({
        type: "error",
        message: `Registration failed: ${error.message}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePutForSale = async (landId) => {
    setConfirmDialog({ show: false });
    setIsLoading(true);
    setTransactionStatus({ type: "info", message: "Putting land for sale..." });
    try {
      await contract.methods.putLandForSale(landId).send({ from: account });
      setTransactionStatus({
        type: "success",
        message: "Land is now for sale!",
      });
      fetchAllData();
    } catch (error) {
      console.error(error);
      setTransactionStatus({
        type: "error",
        message: `Operation failed: ${error.message}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestTransfer = async (landId) => {
    setConfirmDialog({ show: false });
    setIsLoading(true);
    setTransactionStatus({
      type: "info",
      message: "Sending transfer request...",
    });
    try {
      await contract.methods.requestTransfer(landId).send({ from: account });
      setTransactionStatus({
        type: "success",
        message: "Transfer request sent.",
      });
      fetchAllData();
    } catch (error) {
      console.error(error);
      setTransactionStatus({
        type: "error",
        message: `Request failed: ${error.message}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (landId) => {
    setConfirmDialog({ show: false });
    setIsLoading(true);
    setTransactionStatus({ type: "info", message: "Approving transfer..." });
    try {
      await contract.methods.approveTransfer(landId).send({ from: account });
      setTransactionStatus({ type: "success", message: "Transfer approved!" });
      fetchAllData();
    } catch (error) {
      console.error(error);
      setTransactionStatus({
        type: "error",
        message: `Approval failed: ${error.message}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeny = async (landId) => {
    setConfirmDialog({ show: false });
    setIsLoading(true);
    setTransactionStatus({ type: "info", message: "Denying transfer..." });
    try {
      await contract.methods.denyTransfer(landId).send({ from: account });
      setTransactionStatus({ type: "success", message: "Transfer denied." });
      fetchAllData();
    } catch (error) {
      console.error(error);
      setTransactionStatus({
        type: "error",
        message: `Denial failed: ${error.message}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // --- Confirmation Dialog Triggers ---
  const confirmRegister = (e) => {
    e.preventDefault();
    setConfirmDialog({
      show: true,
      title: "Confirm Registration",
      message: "Are you sure you want to register this land?",
      onConfirm: handleRegister,
    });
  };
  const confirmPutForSale = (landId) =>
    setConfirmDialog({
      show: true,
      title: "Confirm Action",
      message: "Put this land up for sale?",
      onConfirm: () => handlePutForSale(landId),
    });
  const confirmRequest = (landId) =>
    setConfirmDialog({
      show: true,
      title: "Confirm Request",
      message: "Request ownership of this land?",
      onConfirm: () => handleRequestTransfer(landId),
    });
  const confirmApprove = (landId) =>
    setConfirmDialog({
      show: true,
      title: "Confirm Approval",
      message: "Approve this transfer? This action is irreversible.",
      onConfirm: () => handleApprove(landId),
    });
  const confirmDeny = (landId) =>
    setConfirmDialog({
      show: true,
      title: "Confirm Denial",
      message: "Deny this transfer request?",
      onConfirm: () => handleDeny(landId),
    });

  const handleCertificateGenerated = (landId) => {
    // Refresh data when certificate is generated
    fetchAllData();
  };

  const tabs = [
    { id: "show", label: "My Lands", count: ownedLands.length },
    { id: "approve", label: "Pending Requests", count: pendingRequests.length },
    { id: "explore", label: "Explore Lands", count: landsForSale.length },
    { id: "register", label: "Register New Land", count: null },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Status Check */}
        {!isUserRegistered ? (
          <div className="card p-8 text-center max-w-2xl mx-auto">
            <div className="w-16 h-16 mx-auto mb-4 bg-yellow-100 dark:bg-yellow-900/50 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-yellow-600 dark:text-yellow-400"
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
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Registration Required
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              You need to register your account and get approval from the admin
              before you can manage land properties.
            </p>
            <a
              href="/profile"
              className="inline-flex items-center px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              Complete Registration
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
          </div>
        ) : !isUserApproved ? (
          <div className="card p-8 text-center max-w-2xl mx-auto">
            <div className="w-16 h-16 mx-auto mb-4 bg-orange-100 dark:bg-orange-900/50 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-orange-600 dark:text-orange-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Approval Pending
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Your account registration is pending admin approval. Please wait
              for the administrator to approve your account before you can
              manage land properties.
            </p>
            <a
              href="/profile"
              className="inline-flex items-center px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              View Profile
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
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </a>
          </div>
        ) : (
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Manage Land
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Register, transfer, and manage your land properties on the
              blockchain.
            </p>
          </div>
        )}

        {/* Transaction Status */}
        {transactionStatus && (
          <div
            className={`mb-6 p-4 rounded-lg border ${
              transactionStatus.type === "success"
                ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200"
                : transactionStatus.type === "error"
                ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200"
                : "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200"
            }`}
          >
            <div className="flex items-center">
              {transactionStatus.type === "success" && (
                <svg
                  className="w-5 h-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              {transactionStatus.type === "error" && (
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
              )}
              {transactionStatus.type === "info" && (
                <svg
                  className="w-5 h-5 mr-2 animate-spin"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              <span className="font-medium">{transactionStatus.message}</span>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-1 bg-gray-100 dark:bg-dark-tertiary rounded-lg p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id)}
                className={`flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                  activeSection === tab.id
                    ? "bg-white dark:bg-dark-primary text-primary-600 dark:text-primary-400 shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                {tab.label}
                {tab.count !== null && (
                  <span
                    className={`ml-2 px-2 py-1 text-xs rounded-full ${
                      activeSection === tab.id
                        ? "bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400"
                        : "bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <span className="ml-3 text-gray-600 dark:text-gray-300">
              Loading blockchain data...
            </span>
          </div>
        )}

        {/* Content Sections */}
        {!isLoading && (
          <>
            {/* My Lands Section */}
            {activeSection === "show" && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  My Registered Lands
                </h2>
                {ownedLands.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {ownedLands.map((land) => (
                      <div key={land.id} className="card p-6">
                        <div className="flex items-start justify-between mb-4">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Plot #{land.plotNumber}
                          </h3>
                          {land.isForSale ? (
                            <span className="px-2 py-1 text-xs font-medium bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 rounded-full">
                              For Sale
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full">
                              Private
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">
                          {land.area}, {land.city}, {land.state}
                        </p>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                          Area: {land.areaSqYd} sq. yards
                        </p>

                        {/* Certificate Section */}
                        <LandCertificate
                          land={land}
                          onCertificateGenerated={handleCertificateGenerated}
                        />

                        {/* Put for Sale Button */}
                        {!land.isForSale && (
                          <div className="mt-4">
                            <button
                              onClick={() => confirmPutForSale(land.id)}
                              disabled={isLoading}
                              className="w-full btn-primary"
                            >
                              Put for Sale
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
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
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                    <p className="text-gray-500 dark:text-gray-400">
                      You do not own any registered land.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Pending Requests Section */}
            {activeSection === "approve" && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Pending Transfer Requests
                </h2>
                {pendingRequests.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pendingRequests.map((req) => (
                      <div key={req.id} className="card p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          Plot #{req.plotNumber}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">
                          {req.area}, {req.city}, {req.state}
                        </p>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                          Request from:{" "}
                          <span className="font-medium">
                            {req.requesterName}
                          </span>
                        </p>
                        <div className="flex space-x-3">
                          <button
                            onClick={() => confirmApprove(req.id)}
                            disabled={isLoading}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => confirmDeny(req.id)}
                            disabled={isLoading}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                          >
                            Deny
                          </button>
                        </div>
                      </div>
                    ))}
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
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p className="text-gray-500 dark:text-gray-400">
                      You have no pending transfer requests.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Explore Lands Section */}
            {activeSection === "explore" && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Lands Available for Sale
                </h2>
                {landsForSale.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {landsForSale.map((land) => (
                      <div key={land.id} className="card p-6">
                        <div className="flex items-start justify-between mb-4">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Plot #{land.plotNumber}
                          </h3>
                          <span className="px-2 py-1 text-xs font-medium bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 rounded-full">
                            For Sale
                          </span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">
                          {land.area}, {land.city}, {land.state}
                        </p>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">
                          Area: {land.areaSqYd} sq. yards
                        </p>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                          Owner:{" "}
                          <span className="font-medium">{land.ownerName}</span>
                        </p>
                        <button
                          onClick={() => confirmRequest(land.id)}
                          disabled={isLoading}
                          className="w-full btn-primary"
                        >
                          Request Transfer
                        </button>
                      </div>
                    ))}
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
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 3H4a1 1 0 00-1 1v1m4 8v5a2 2 0 002 2h7a2 2 0 002-2v-5M9 21V9a2 2 0 012-2h2a2 2 0 012 2v12"
                      />
                    </svg>
                    <p className="text-gray-500 dark:text-gray-400">
                      There are currently no lands for sale.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Register Land Section */}
            {activeSection === "register" && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Register a New Land
                </h2>

                <div className="space-y-8">
                  {/* Interactive Map Section */}
                  <div className="card p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Select Land Location and Boundaries
                    </h3>
                    <LandSelectionMap
                      onLocationDataChange={handleLocationDataChange}
                    />
                  </div>

                  {/* Form Section */}
                  <div className="card p-8">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                      Land Registration Details
                    </h3>
                    <form onSubmit={confirmRegister} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Plot Number
                          </label>
                          <input
                            name="plotNumber"
                            value={formData.plotNumber}
                            onChange={handleInputChange}
                            className="input-field"
                            placeholder="Enter plot number"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Area / Locality
                            {formData.area && (
                              <span className="text-green-600 dark:text-green-400 text-xs ml-2">
                                (Auto-filled from map)
                              </span>
                            )}
                          </label>
                          <input
                            name="area"
                            value={formData.area}
                            onChange={handleInputChange}
                            className="input-field"
                            placeholder="Enter area or locality"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            City
                            {formData.city && (
                              <span className="text-green-600 dark:text-green-400 text-xs ml-2">
                                (Auto-filled from map)
                              </span>
                            )}
                          </label>
                          <input
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            className="input-field"
                            placeholder="Enter city"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            District
                            {formData.district && (
                              <span className="text-green-600 dark:text-green-400 text-xs ml-2">
                                (Auto-filled from map)
                              </span>
                            )}
                          </label>
                          <input
                            name="district"
                            value={formData.district}
                            onChange={handleInputChange}
                            className="input-field"
                            placeholder="Enter district"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            State
                            {formData.state && (
                              <span className="text-green-600 dark:text-green-400 text-xs ml-2">
                                (Auto-filled from map)
                              </span>
                            )}
                          </label>
                          <input
                            name="state"
                            value={formData.state}
                            onChange={handleInputChange}
                            className="input-field"
                            placeholder="Enter state"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Area (Sq. Yards)
                            {formData.areaSqYd && (
                              <span className="text-green-600 dark:text-green-400 text-xs ml-2">
                                (Calculated from map selection)
                              </span>
                            )}
                          </label>
                          <input
                            name="areaSqYd"
                            value={formData.areaSqYd}
                            onChange={handleInputChange}
                            className="input-field"
                            placeholder="Enter area in square yards"
                            type="number"
                            required
                          />
                        </div>
                      </div>
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full btn-primary"
                      >
                        {isLoading ? "Registering..." : "Register Land"}
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        <ConfirmationDialog
          show={confirmDialog.show}
          title={confirmDialog.title}
          message={confirmDialog.message}
          onConfirm={confirmDialog.onConfirm}
          onCancel={() => setConfirmDialog({ ...confirmDialog, show: false })}
        />
      </div>
    </div>
  );
}

export default ManageLandPage;
