import React, { useState, useEffect, useCallback } from 'react';
import { useWallet } from './WalletContext';
import ConfirmationDialog from './ConfirmationDialog';

function ManageLandPage() {
    const { contract, account, getAccountName } = useWallet();
    const [activeSection, setActiveSection] = useState('show');
    const [isLoading, setIsLoading] = useState(false);
    const [transactionStatus, setTransactionStatus] = useState(null);

    // State for Forms
    const [formData, setFormData] = useState({ plotNumber: '', area: '', district: '', city: '', state: '', areaSqYd: '' });

    // State for Displaying Data
    const [ownedLands, setOwnedLands] = useState([]);
    const [landsForSale, setLandsForSale] = useState([]);
    const [pendingRequests, setPendingRequests] = useState([]);

    // State for Dialog
    const [confirmDialog, setConfirmDialog] = useState({ show: false, title: '', message: '', onConfirm: () => {} });

    // --- Data Fetching ---
    const fetchAllData = useCallback(async () => {
        if (!contract || !account) return;
        setIsLoading(true);
        try {
            // Fetch Owned Lands
            const ownedLandIds = await contract.methods.getLandsByOwner(account).call();
            const ownedDetails = await Promise.all(ownedLandIds.map(id => contract.methods.lands(id).call()));
            setOwnedLands(ownedDetails);

            // Fetch Pending Requests
            const pendingRequestIds = await contract.methods.getPendingTransferRequests(account).call();
            const requestDetails = await Promise.all(pendingRequestIds.map(async (id) => {
                const land = await contract.methods.lands(id).call();
                return { ...land, requesterName: getAccountName(land.transferRequest) };
            }));
            setPendingRequests(requestDetails);

            // Fetch All Lands for Sale
            const landCount = await contract.methods.landCount().call();
            const forSale = [];
            for (let i = 1; i <= landCount; i++) {
                const land = await contract.methods.lands(i).call();
                if (land.isForSale && land.owner.toLowerCase() !== account.toLowerCase()) {
                    forSale.push({ ...land, ownerName: getAccountName(land.owner) });
                }
            }
            setLandsForSale(forSale);

        } catch (error) {
            console.error("Error fetching data:", error);
            setTransactionStatus({ type: 'error', message: 'Failed to fetch blockchain data.' });
        } finally {
            setIsLoading(false);
        }
    }, [contract, account, getAccountName]);

    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);

    // --- Handlers for Contract Interactions ---
    const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleRegister = async () => {
        setConfirmDialog({ show: false });
        setIsLoading(true);
        setTransactionStatus({ type: 'info', message: 'Processing registration...' });
        try {
            await contract.methods.registerLand(
                formData.plotNumber, formData.area, formData.district, formData.city, formData.state, formData.areaSqYd
            ).send({ from: account, gas: '1000000' });
            setTransactionStatus({ type: 'success', message: 'Land registered successfully!' });
            setFormData({ plotNumber: '', area: '', district: '', city: '', state: '', areaSqYd: '' });
            fetchAllData();
        } catch (error) {
            console.error(error);
            setTransactionStatus({ type: 'error', message: `Registration failed: ${error.message}` });
        } finally {
            setIsLoading(false);
        }
    };

    const handlePutForSale = async (landId) => {
        setConfirmDialog({ show: false });
        setIsLoading(true);
        setTransactionStatus({ type: 'info', message: 'Putting land for sale...' });
        try {
            await contract.methods.putLandForSale(landId).send({ from: account });
            setTransactionStatus({ type: 'success', message: 'Land is now for sale!' });
            fetchAllData();
        } catch (error) {
            console.error(error);
            setTransactionStatus({ type: 'error', message: `Operation failed: ${error.message}` });
        } finally {
            setIsLoading(false);
        }
    };

    const handleRequestTransfer = async (landId) => {
        setConfirmDialog({ show: false });
        setIsLoading(true);
        setTransactionStatus({ type: 'info', message: 'Sending transfer request...' });
        try {
            await contract.methods.requestTransfer(landId).send({ from: account });
            setTransactionStatus({ type: 'success', message: 'Transfer request sent.' });
            fetchAllData();
        } catch (error) {
            console.error(error);
            setTransactionStatus({ type: 'error', message: `Request failed: ${error.message}` });
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleApprove = async (landId) => {
        setConfirmDialog({ show: false });
        setIsLoading(true);
        setTransactionStatus({ type: 'info', message: 'Approving transfer...' });
        try {
            await contract.methods.approveTransfer(landId).send({ from: account });
            setTransactionStatus({ type: 'success', message: 'Transfer approved!' });
            fetchAllData();
        } catch (error) {
            console.error(error);
            setTransactionStatus({ type: 'error', message: `Approval failed: ${error.message}` });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeny = async (landId) => {
        setConfirmDialog({ show: false });
        setIsLoading(true);
        setTransactionStatus({ type: 'info', message: 'Denying transfer...' });
        try {
            await contract.methods.denyTransfer(landId).send({ from: account });
            setTransactionStatus({ type: 'success', message: 'Transfer denied.' });
            fetchAllData();
        } catch (error) {
            console.error(error);
            setTransactionStatus({ type: 'error', message: `Denial failed: ${error.message}` });
        } finally {
            setIsLoading(false);
        }
    };

    // --- Confirmation Dialog Triggers ---
    const confirmRegister = (e) => {
        e.preventDefault();
        setConfirmDialog({ show: true, title: 'Confirm Registration', message: 'Are you sure you want to register this land?', onConfirm: handleRegister });
    };
    const confirmPutForSale = (landId) => setConfirmDialog({ show: true, title: 'Confirm Action', message: 'Put this land up for sale?', onConfirm: () => handlePutForSale(landId) });
    const confirmRequest = (landId) => setConfirmDialog({ show: true, title: 'Confirm Request', message: 'Request ownership of this land?', onConfirm: () => handleRequestTransfer(landId) });
    const confirmApprove = (landId) => setConfirmDialog({ show: true, title: 'Confirm Approval', message: 'Approve this transfer? This action is irreversible.', onConfirm: () => handleApprove(landId) });
    const confirmDeny = (landId) => setConfirmDialog({ show: true, title: 'Confirm Denial', message: 'Deny this transfer request?', onConfirm: () => handleDeny(landId) });

    return (
        <div className="container my-5 pt-5">
            <h1 className="text-center mb-4">Manage Land</h1>

            {transactionStatus && (
                <div className={`alert alert-${transactionStatus.type}`} role="alert">
                    {transactionStatus.message}
                </div>
            )}

            <ul className="nav nav-tabs nav-fill mb-4">
                <li className="nav-item"><button className={`nav-link ${activeSection === 'show' ? 'active' : ''}`} onClick={() => setActiveSection('show')}>My Lands ({ownedLands.length})</button></li>
                <li className="nav-item"><button className={`nav-link ${activeSection === 'approve' ? 'active' : ''}`} onClick={() => setActiveSection('approve')}>Pending Requests ({pendingRequests.length})</button></li>
                <li className="nav-item"><button className={`nav-link ${activeSection === 'explore' ? 'active' : ''}`} onClick={() => setActiveSection('explore')}>Explore Lands for Sale ({landsForSale.length})</button></li>
                <li className="nav-item"><button className={`nav-link ${activeSection === 'register' ? 'active' : ''}`} onClick={() => setActiveSection('register')}>Register New Land</button></li>
            </ul>

            {isLoading && <p className="text-center">Loading blockchain data...</p>}

            {/* My Lands Section */}
            {activeSection === 'show' && (
                <div>
                    <h4>My Registered Lands</h4>
                    {ownedLands.length > 0 ? ownedLands.map(land => (
                        <div key={land.id} className="card mb-3">
                            <div className="card-body">
                                <h5 className="card-title">Plot #{land.plotNumber}</h5>
                                <p className="card-text">{land.area}, {land.city}, {land.state}</p>
                                {!land.isForSale ? (
                                    <button className="btn btn-primary" onClick={() => confirmPutForSale(land.id)} disabled={isLoading}>Put for Sale</button>
                                ) : (
                                    <span className="badge bg-success">For Sale</span>
                                )}
                            </div>
                        </div>
                    )) : <p>You do not own any registered land.</p>}
                </div>
            )}

            {/* Pending Requests Section */}
            {activeSection === 'approve' && (
                <div>
                    <h4>Pending Transfer Requests</h4>
                    {pendingRequests.length > 0 ? pendingRequests.map(req => (
                        <div key={req.id} className="card mb-3">
                            <div className="card-body">
                                <h5 className="card-title">Request for Plot #{req.plotNumber}</h5>
                                <p className="card-text">From: {req.requesterName}</p>
                                <button className="btn btn-success me-2" onClick={() => confirmApprove(req.id)} disabled={isLoading}>Approve</button>
                                <button className="btn btn-danger" onClick={() => confirmDeny(req.id)} disabled={isLoading}>Deny</button>
                            </div>
                        </div>
                    )) : <p>You have no pending transfer requests.</p>}
                </div>
            )}

            {/* Explore Lands Section */}
            {activeSection === 'explore' && (
                 <div>
                    <h4>Lands Available for Sale</h4>
                    {landsForSale.length > 0 ? landsForSale.map(land => (
                        <div key={land.id} className="card mb-3">
                            <div className="card-body">
                                <h5 className="card-title">Plot #{land.plotNumber}</h5>
                                <p className="card-text">{land.area}, {land.city}, {land.state}</p>
                                <p className="card-text"><small>Owner: {land.ownerName}</small></p>
                                <button className="btn btn-success" onClick={() => confirmRequest(land.id)} disabled={isLoading}>Request Transfer</button>
                            </div>
                        </div>
                    )) : <p>There are currently no lands for sale.</p>}
                </div>
            )}

            {/* Register Land Section */}
            {activeSection === 'register' && (
                <div>
                    <h4>Register a New Land</h4>
                    <form onSubmit={confirmRegister}>
                        <input name="plotNumber" value={formData.plotNumber} onChange={handleInputChange} className="form-control mb-2" placeholder="Plot Number" required />
                        <input name="area" value={formData.area} onChange={handleInputChange} className="form-control mb-2" placeholder="Area / Locality" required />
                        <input name="city" value={formData.city} onChange={handleInputChange} className="form-control mb-2" placeholder="City" required />
                        <input name="district" value={formData.district} onChange={handleInputChange} className="form-control mb-2" placeholder="District" required />
                        <input name="state" value={formData.state} onChange={handleInputChange} className="form-control mb-2" placeholder="State" required />
                        <input name="areaSqYd" value={formData.areaSqYd} onChange={handleInputChange} className="form-control mb-2" placeholder="Area in Sq. Yards" type="number" required />
                        <button type="submit" className="btn btn-primary" disabled={isLoading}>Register Land</button>
                    </form>
                </div>
            )}

            <ConfirmationDialog 
                show={confirmDialog.show} 
                title={confirmDialog.title} 
                message={confirmDialog.message} 
                onConfirm={confirmDialog.onConfirm} 
                onCancel={() => setConfirmDialog({ ...confirmDialog, show: false })} 
            />
        </div>
    );
}

export default ManageLandPage;