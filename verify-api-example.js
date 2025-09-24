// Example: Public Certificate Verification API
// This could run on any server for external access

const express = require('express');
const Web3 = require('web3');
const app = express();

// Your contract details
const CONTRACT_ADDRESS = '0x482ebf2DB531252120dbC1F33eaB5f8a647f1437';
const CONTRACT_ABI = [/* Your contract ABI */];

const web3 = new Web3('YOUR_BLOCKCHAIN_RPC_URL');
const contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);

// Public API endpoint for certificate verification
app.get('/api/verify/:hash', async (req, res) => {
    try {
        const certificateHash = req.params.hash;
        
        const result = await contract.methods
            .verifyCertificateHash(certificateHash)
            .call();
            
        const [exists, landId, owner, issueDate] = result;
        
        if (exists && landId !== "0") {
            // Get land details
            const landDetails = await contract.methods.lands(landId).call();
            
            res.json({
                valid: true,
                certificate: {
                    hash: certificateHash,
                    landId: Number(landId),
                    owner: owner,
                    issueDate: new Date(Number(issueDate) * 1000),
                    land: {
                        plotNumber: landDetails.plotNumber,
                        area: landDetails.area,
                        city: landDetails.city,
                        state: landDetails.state,
                        areaSqYd: landDetails.areaSqYd
                    }
                }
            });
        } else {
            res.json({
                valid: false,
                message: 'Certificate not found or invalid'
            });
        }
    } catch (error) {
        res.status(500).json({
            error: 'Verification failed',
            message: error.message
        });
    }
});

app.listen(3001, () => {
    console.log('Certificate verification API running on port 3001');
    console.log('Usage: GET /api/verify/{certificate-hash}');
});

// Example usage:
// curl http://localhost:3001/api/verify/a1b2c3d4e5f6...
