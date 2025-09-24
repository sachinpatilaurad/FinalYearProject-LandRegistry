import React, { useState } from "react";
import { useWallet } from "./WalletContext.jsx";

const LandCertificate = ({ land, onCertificateGenerated }) => {
  const { contract, account, getAccountName } = useWallet();
  const [isGenerating, setIsGenerating] = useState(false);
  const [certificate, setCertificate] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);

  // Check if certificate exists for this land
  const checkCertificate = async () => {
    if (!contract || !land) return;
    setIsLoading(true);
    try {
      const hasCert = await contract.methods.landHasCertificate(land.id).call();
      if (hasCert) {
        const certData = await contract.methods.getCertificate(land.id).call();
        setCertificate({
          certificateId: certData.certificateId,
          owner: certData.owner,
          certificateHash: certData.certificateHash,
          issueDate: new Date(Number(certData.issueDate) * 1000),
          isValid: certData.isValid,
        });
      }
    } catch (error) {
      console.error("Error checking certificate:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate certificate
  const generateCertificate = async () => {
    if (!contract || !land) return;
    setIsGenerating(true);
    try {
      await contract.methods
        .generateLandCertificate(land.id)
        .send({ from: account, gas: "500000" });

      // Refresh certificate data
      await checkCertificate();
      if (onCertificateGenerated) {
        onCertificateGenerated(land.id);
      }
    } catch (error) {
      console.error("Error generating certificate:", error);
      alert(`Failed to generate certificate: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Load certificate on mount
  React.useEffect(() => {
    if (land && contract) {
      checkCertificate();
    }
  }, [land, contract]);

  const downloadCertificatePDF = () => {
    if (!certificate || !land) return;

    // Create a simple HTML content for PDF generation
    const certificateContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Land Certificate</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            padding: 40px; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
          }
          .certificate {
            background: white;
            padding: 40px;
            border-radius: 15px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            max-width: 800px;
            margin: 0 auto;
            border: 3px solid #gold;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #667eea;
            padding-bottom: 20px;
          }
          .title {
            font-size: 32px;
            font-weight: bold;
            color: #667eea;
            margin-bottom: 10px;
          }
          .subtitle {
            font-size: 18px;
            color: #666;
          }
          .content {
            margin: 30px 0;
          }
          .field {
            margin: 15px 0;
            padding: 10px;
            background: #f8f9ff;
            border-radius: 8px;
          }
          .field-label {
            font-weight: bold;
            color: #333;
            display: inline-block;
            width: 150px;
          }
          .field-value {
            color: #666;
          }
          .hash-section {
            background: #e8f2ff;
            padding: 20px;
            border-radius: 10px;
            margin: 20px 0;
          }
          .hash {
            font-family: monospace;
            font-size: 12px;
            word-break: break-all;
            color: #0066cc;
            background: white;
            padding: 10px;
            border-radius: 5px;
          }
          .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #667eea;
            color: #666;
            font-size: 14px;
          }
          .seal {
            width: 80px;
            height: 80px;
            border: 3px solid #667eea;
            border-radius: 50%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            color: #667eea;
            margin: 20px;
          }
        </style>
      </head>
      <body>
        <div class="certificate">
          <div class="header">
            <div class="title">🏠 BLOCKCHAIN LAND CERTIFICATE</div>
            <div class="subtitle">Official Land Ownership Certificate</div>
          </div>
          
          <div class="content">
            <div class="field">
              <span class="field-label">Certificate ID:</span>
              <span class="field-value">#${certificate.certificateId}</span>
            </div>
            
            <div class="field">
              <span class="field-label">Land ID:</span>
              <span class="field-value">#${land.id}</span>
            </div>
            
            <div class="field">
              <span class="field-label">Plot Number:</span>
              <span class="field-value">${land.plotNumber}</span>
            </div>
            
            <div class="field">
              <span class="field-label">Location:</span>
              <span class="field-value">${land.area}, ${land.city}, ${
      land.district
    }, ${land.state}</span>
            </div>
            
            <div class="field">
              <span class="field-label">Area:</span>
              <span class="field-value">${land.areaSqYd} Square Yards</span>
            </div>
            
            <div class="field">
              <span class="field-label">Owner:</span>
              <span class="field-value">${getAccountName(
                certificate.owner
              )}</span>
            </div>
            
            <div class="field">
              <span class="field-label">Owner Address:</span>
              <span class="field-value">${certificate.owner}</span>
            </div>
            
            <div class="field">
              <span class="field-label">Issue Date:</span>
              <span class="field-value">${certificate.issueDate.toLocaleDateString()}</span>
            </div>
            
            <div class="hash-section">
              <h3 style="margin-top: 0; color: #0066cc;">🔐 Unique Certificate Hash</h3>
              <p style="margin-bottom: 10px;">This hash guarantees authenticity and prevents forgery:</p>
              <div class="hash">${certificate.certificateHash}</div>
            </div>
          </div>
          
          <div class="footer">
            <div class="seal">
              VERIFIED
            </div>
            <p><strong>This certificate is secured by blockchain technology</strong></p>
            <p>Generated on ${new Date().toLocaleDateString()} | Blockchain Land Registry System</p>
            <p style="font-size: 12px; color: #999;">
              Certificate Hash: ${certificate.certificateHash}
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Create a blob and download
    const blob = new Blob([certificateContent], { type: "text/html" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Land_Certificate_${land.plotNumber}_${certificate.certificateId}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
        <span className="ml-2 text-gray-600 dark:text-gray-300">
          Checking certificate...
        </span>
      </div>
    );
  }

  return (
    <div className="border-t border-gray-200 dark:border-dark-border pt-4">
      {certificate ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
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
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-sm font-medium text-green-600 dark:text-green-400">
                Certificate Generated
              </span>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              ID: #{certificate.certificateId}
            </span>
          </div>

          <div className="bg-gray-50 dark:bg-dark-tertiary rounded-lg p-3">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              Certificate Hash:
            </div>
            <div className="font-mono text-xs text-gray-700 dark:text-gray-300 bg-white dark:bg-dark-primary p-2 rounded border break-all">
              {certificate.certificateHash}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Issued: {certificate.issueDate.toLocaleDateString()}
            </div>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => setShowCertificate(true)}
              className="flex-1 text-xs bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-3 rounded-lg transition-colors duration-200"
            >
              View Certificate
            </button>
            <button
              onClick={downloadCertificatePDF}
              className="flex-1 text-xs bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-3 rounded-lg transition-colors duration-200"
            >
              Download
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2"
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
            <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
              No Certificate Generated
            </span>
          </div>

          <button
            onClick={generateCertificate}
            disabled={isGenerating}
            className="w-full text-sm bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
          >
            {isGenerating ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 inline-block"
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
                Generating Certificate...
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4 inline-block mr-2"
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
                Generate Certificate
              </>
            )}
          </button>
        </div>
      )}

      {/* Certificate Modal */}
      {showCertificate && certificate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-dark-secondary rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-dark-border">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  🏠 Land Certificate
                </h2>
                <button
                  onClick={() => setShowCertificate(false)}
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
              {/* Certificate Content */}
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-2 border-blue-200 dark:border-blue-700 rounded-lg p-6">
                <div className="text-center mb-6">
                  <div className="text-2xl font-bold text-blue-800 dark:text-blue-300 mb-2">
                    BLOCKCHAIN LAND CERTIFICATE
                  </div>
                  <div className="text-gray-600 dark:text-gray-300">
                    Official Land Ownership Certificate
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-white dark:bg-dark-primary p-3 rounded">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Certificate ID
                    </div>
                    <div className="font-semibold">
                      #{certificate.certificateId}
                    </div>
                  </div>
                  <div className="bg-white dark:bg-dark-primary p-3 rounded">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Land ID
                    </div>
                    <div className="font-semibold">#{land.id}</div>
                  </div>
                  <div className="bg-white dark:bg-dark-primary p-3 rounded">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Plot Number
                    </div>
                    <div className="font-semibold">{land.plotNumber}</div>
                  </div>
                  <div className="bg-white dark:bg-dark-primary p-3 rounded">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Area
                    </div>
                    <div className="font-semibold">
                      {land.areaSqYd} sq. yards
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-dark-primary p-3 rounded mb-4">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Location
                  </div>
                  <div className="font-semibold">
                    {land.area}, {land.city}, {land.district}, {land.state}
                  </div>
                </div>

                <div className="bg-white dark:bg-dark-primary p-3 rounded mb-4">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Owner
                  </div>
                  <div className="font-semibold">
                    {getAccountName(certificate.owner)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-1">
                    {certificate.owner}
                  </div>
                </div>

                <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-lg">
                  <div className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2">
                    🔐 Unique Certificate Hash
                  </div>
                  <div className="font-mono text-xs bg-white dark:bg-dark-primary p-2 rounded border break-all text-gray-700 dark:text-gray-300">
                    {certificate.certificateHash}
                  </div>
                  <div className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                    This hash guarantees authenticity and prevents forgery
                  </div>
                </div>

                <div className="text-center mt-6 pt-4 border-t border-blue-200 dark:border-blue-700">
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Issued on {certificate.issueDate.toLocaleDateString()}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Secured by Blockchain Technology
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={downloadCertificatePDF}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  Download Certificate
                </button>
                <button
                  onClick={() => setShowCertificate(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandCertificate;
