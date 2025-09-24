import React, { useState, useEffect } from "react";
import { useWallet } from "./WalletContext.jsx";

function UserProfile() {
  const { account, contract } = useWallet();
  const [userDetails, setUserDetails] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    nationalId: "",
    homeAddress: "",
  });

  useEffect(() => {
    if (contract && account) {
      loadUserDetails();
    }
  }, [contract, account]);

  const loadUserDetails = async () => {
    try {
      setIsLoading(true);
      const details = await contract.methods.getUserDetails(account).call();

      if (details.isRegistered) {
        setUserDetails({
          fullName: details.fullName,
          email: details.email,
          phone: details.phone,
          nationalId: details.nationalId,
          homeAddress: details.homeAddress,
          isApproved: details.isApproved,
          isRegistered: details.isRegistered,
          registrationTime: Number(details.registrationTime),
        });
      } else {
        setUserDetails(null);
      }
    } catch (error) {
      console.error("Error loading user details:", error);
      setUserDetails(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!contract || !account) return;

    try {
      setIsRegistering(true);
      await contract.methods
        .registerUser(
          formData.fullName,
          formData.email,
          formData.phone,
          formData.nationalId,
          formData.homeAddress
        )
        .send({ from: account });

      alert(
        "Registration submitted successfully! Please wait for admin approval."
      );
      await loadUserDetails();
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        nationalId: "",
        homeAddress: "",
      });
    } catch (error) {
      console.error("Error registering user:", error);
      alert("Error registering user: " + error.message);
    } finally {
      setIsRegistering(false);
    }
  };

  if (!account) {
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
            Wallet Not Connected
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Please connect your wallet to access your profile.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-primary flex items-center justify-center">
        <div className="card p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-primary">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            User Profile
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage your account information and registration status
          </p>
        </div>

        {userDetails ? (
          // Existing User Profile
          <div className="space-y-6">
            {/* Status Card */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Registration Status
                </h2>
                <div
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    userDetails.isApproved
                      ? "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300"
                      : "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300"
                  }`}
                >
                  {userDetails.isApproved ? "Approved" : "Pending Approval"}
                </div>
              </div>

              {userDetails.isApproved ? (
                <div className="flex items-center text-green-600 dark:text-green-400">
                  <svg
                    className="w-5 h-5 mr-2"
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
                  <span>
                    Your account is approved. You can register land properties.
                  </span>
                </div>
              ) : (
                <div className="flex items-center text-yellow-600 dark:text-yellow-400">
                  <svg
                    className="w-5 h-5 mr-2"
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
                  <span>Your registration is pending admin approval.</span>
                </div>
              )}
            </div>

            {/* Profile Information */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Profile Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="form-label">Full Name</label>
                  <div className="form-input bg-gray-50 dark:bg-gray-600">
                    {userDetails.fullName}
                  </div>
                </div>

                <div>
                  <label className="form-label">Email</label>
                  <div className="form-input bg-gray-50 dark:bg-gray-600">
                    {userDetails.email}
                  </div>
                </div>

                <div>
                  <label className="form-label">Phone</label>
                  <div className="form-input bg-gray-50 dark:bg-gray-600">
                    {userDetails.phone}
                  </div>
                </div>

                <div>
                  <label className="form-label">National ID</label>
                  <div className="form-input bg-gray-50 dark:bg-gray-600">
                    {userDetails.nationalId}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="form-label">Home Address</label>
                  <div className="form-input bg-gray-50 dark:bg-gray-600">
                    {userDetails.homeAddress}
                  </div>
                </div>

                <div>
                  <label className="form-label">Wallet Address</label>
                  <div className="form-input bg-gray-50 dark:bg-gray-600 font-mono text-sm">
                    {account}
                  </div>
                </div>

                <div>
                  <label className="form-label">Registration Date</label>
                  <div className="form-input bg-gray-50 dark:bg-gray-600">
                    {new Date(
                      userDetails.registrationTime * 1000
                    ).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // User Registration Form
          <div className="card p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary-100 dark:bg-primary-900/50 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-primary-600 dark:text-primary-400"
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
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Register Your Account
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Complete your registration to access land management features
              </p>
            </div>

            <form onSubmit={handleRegister} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="fullName" className="form-label">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    className="form-input"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="form-label">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="form-input"
                    placeholder="Enter your email"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="form-label">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter your phone number"
                  />
                </div>

                <div>
                  <label htmlFor="nationalId" className="form-label">
                    National ID / Passport *
                  </label>
                  <input
                    type="text"
                    id="nationalId"
                    name="nationalId"
                    value={formData.nationalId}
                    onChange={handleChange}
                    required
                    className="form-input"
                    placeholder="Enter your national ID"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="homeAddress" className="form-label">
                  Home Address
                </label>
                <textarea
                  id="homeAddress"
                  name="homeAddress"
                  value={formData.homeAddress}
                  onChange={handleChange}
                  rows={3}
                  className="form-input"
                  placeholder="Enter your complete address"
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isRegistering}
                  className="w-full btn-primary"
                >
                  {isRegistering ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      Registering...
                    </>
                  ) : (
                    "Submit Registration"
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserProfile;
