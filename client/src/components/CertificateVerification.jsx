import React, { useState } from "react";
import { useWallet } from "./WalletContext.jsx";

function CertificateVerification() {
  const { contract, getAccountName } = useWallet();
  const [certificateHash, setCertificateHash] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [error, setError] = useState("");

  const verifyCertificate = async () => {
    if (!contract || !certificateHash.trim()) {
      setError("Please enter a certificate hash");
      return;
    }

    setIsVerifying(true);
    setError("");
    setVerificationResult(null);

    try {
      const result = await contract.methods
        .verifyCertificateHash(certificateHash.trim())
        .call();

      const [exists, landId, owner, issueDate] = result;

      if (exists && landId !== "0") {
        // Get land details
        const landDetails = await contract.methods.lands(landId).call();

        setVerificationResult({
          valid: true,
          landId: Number(landId),
          owner,
          ownerName: getAccountName(owner),
          issueDate: new Date(Number(issueDate) * 1000),
          landDetails: {
            plotNumber: landDetails.plotNumber,
            area: landDetails.area,
            city: landDetails.city,
            district: landDetails.district,
            state: landDetails.state,
            areaSqYd: landDetails.areaSqYd,
          },
        });
      } else {
        setVerificationResult({
          valid: false,
          message: "Certificate hash not found or invalid",
        });
      }
    } catch (err) {
      console.error("Verification error:", err);
      setError(`Verification failed: ${err.message}`);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    verifyCertificate();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-primary">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            🔍 Certificate Verification
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Verify the authenticity of land certificates using their unique hash
          </p>
        </div>

        {/* Verification Form */}
        <div className="card p-8 mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Certificate Hash
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={certificateHash}
                  onChange={(e) => setCertificateHash(e.target.value)}
                  placeholder="Enter the 64-character certificate hash..."
                  className="w-full input-field font-mono text-sm"
                  maxLength={64}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    />
                  </svg>
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                The certificate hash is a 64-character hexadecimal string
              </p>
            </div>

            <button
              type="submit"
              disabled={isVerifying || !certificateHash.trim()}
              className="w-full btn-primary"
            >
              {isVerifying ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-5 w-5"
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
                  Verifying Certificate...
                </>
              ) : (
                <>
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
                  Verify Certificate
                </>
              )}
            </button>
          </form>
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

        {/* Verification Results */}
        {verificationResult && (
          <div className="card overflow-hidden">
            {verificationResult.valid ? (
              <div>
                {/* Valid Certificate Header */}
                <div className="bg-green-50 dark:bg-green-900/20 border-b border-green-200 dark:border-green-800 p-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mr-4">
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
                    <div>
                      <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">
                        ✅ Certificate Valid & Authenticated
                      </h3>
                      <p className="text-green-600 dark:text-green-300 text-sm">
                        This certificate is genuine and verified on the
                        blockchain
                      </p>
                    </div>
                  </div>
                </div>

                {/* Certificate Details */}
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Land Information */}
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        🏠 Land Information
                      </h4>

                      <div className="bg-gray-50 dark:bg-dark-tertiary rounded-lg p-4">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Land ID
                        </div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          #{verificationResult.landId}
                        </div>
                      </div>

                      <div className="bg-gray-50 dark:bg-dark-tertiary rounded-lg p-4">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Plot Number
                        </div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {verificationResult.landDetails.plotNumber}
                        </div>
                      </div>

                      <div className="bg-gray-50 dark:bg-dark-tertiary rounded-lg p-4">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Location
                        </div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {verificationResult.landDetails.area}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          {verificationResult.landDetails.city},{" "}
                          {verificationResult.landDetails.district},{" "}
                          {verificationResult.landDetails.state}
                        </div>
                      </div>

                      <div className="bg-gray-50 dark:bg-dark-tertiary rounded-lg p-4">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Area
                        </div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {verificationResult.landDetails.areaSqYd} sq. yards
                        </div>
                      </div>
                    </div>

                    {/* Ownership Information */}
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        👤 Ownership Information
                      </h4>

                      <div className="bg-gray-50 dark:bg-dark-tertiary rounded-lg p-4">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Owner Name
                        </div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {verificationResult.ownerName}
                        </div>
                      </div>

                      <div className="bg-gray-50 dark:bg-dark-tertiary rounded-lg p-4">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Owner Address
                        </div>
                        <div className="font-mono text-xs bg-white dark:bg-dark-primary p-2 rounded border break-all text-gray-700 dark:text-gray-300">
                          {verificationResult.owner}
                        </div>
                      </div>

                      <div className="bg-gray-50 dark:bg-dark-tertiary rounded-lg p-4">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Certificate Issue Date
                        </div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {verificationResult.issueDate.toLocaleDateString()} at{" "}
                          {verificationResult.issueDate.toLocaleTimeString()}
                        </div>
                      </div>

                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                        <div className="text-sm text-blue-600 dark:text-blue-400 font-semibold mb-2">
                          🔐 Certificate Hash
                        </div>
                        <div className="font-mono text-xs bg-white dark:bg-dark-primary p-2 rounded border break-all text-gray-700 dark:text-gray-300">
                          {certificateHash}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center">
                      <svg
                        className="w-5 h-5 text-green-600 dark:text-green-400 mr-2"
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
                      <div>
                        <div className="text-sm font-semibold text-green-800 dark:text-green-200">
                          Blockchain Verified
                        </div>
                        <div className="text-xs text-green-600 dark:text-green-300">
                          This certificate is cryptographically secured and
                          cannot be forged
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Invalid Certificate */
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center mr-4">
                    <svg
                      className="w-6 h-6 text-red-600 dark:text-red-400"
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
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">
                      ❌ Invalid Certificate
                    </h3>
                    <p className="text-red-600 dark:text-red-300 text-sm">
                      {verificationResult.message}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* How It Works Section */}
        <div className="mt-12 card p-8">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            🔍 How Certificate Verification Works
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 dark:text-blue-400 font-bold">
                  1
                </span>
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                Enter Hash
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Paste the 64-character certificate hash from the certificate
                document
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 dark:text-blue-400 font-bold">
                  2
                </span>
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                Blockchain Check
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                System verifies the hash against blockchain records
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 dark:text-blue-400 font-bold">
                  3
                </span>
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                Instant Result
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Get complete land and ownership details if certificate is valid
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CertificateVerification;
