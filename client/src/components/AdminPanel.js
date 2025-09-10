import React, { useState, useEffect, useCallback } from 'react';
import { useWallet } from './WalletContext';

function AdminPanel() {
    const { contract, account, isAdmin } = useWallet();
    const [allLands, setAllLands] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchAllLands = useCallback(async () => {
        if (!contract || !isAdmin) return;
        setIsLoading(true);
        setError('');
        try {
            const lands = await contract.methods.getAllLands().call({ from: account });
            setAllLands(lands);
        } catch (err) {
            console.error(err);
            setError('Failed to fetch lands. See console for details.');
        } finally {
            setIsLoading(false);
        }
    }, [contract, account, isAdmin]);

    useEffect(() => {
        if (isAdmin) {
            fetchAllLands();
        }
    }, [isAdmin, fetchAllLands]);

    if (!isAdmin) {
        return <div className="alert alert-danger mt-5">Access Denied: You are not the admin.</div>;
    }

    return (
        <div className="container my-5 pt-5">
            <h1 className="text-center mb-4">Admin Panel: All Registered Lands</h1>
            {error && <div className="alert alert-danger">{error}</div>}
            {isLoading ? <p>Loading all lands...</p> : (
                <table className="table table-striped">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Plot #</th>
                            <th>City</th>
                            <th>Owner</th>
                            <th>For Sale</th>
                        </tr>
                    </thead>
                    <tbody>
                        {allLands.map(land => (
                            <tr key={land.id}>
                                <td>{land.id}</td>
                                <td>{land.plotNumber}</td>
                                <td>{land.city}</td>
                                <td title={land.owner}><small>{land.owner.substring(0, 10)}...</small></td>
                                <td>{land.isForSale ? 'Yes' : 'No'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default AdminPanel;