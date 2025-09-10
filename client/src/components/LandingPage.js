import React from 'react';
import { Link } from 'react-router-dom';
import { useWallet } from './WalletContext';
import './LandingPage.css'; // We will create this CSS file next

function LandingPage() {
    const { account } = useWallet();

    return (
        <div>
            <div className="hero-section text-center text-white">
                <div className="hero-content">
                    <h1 className="display-4 fw-bold">Land Registry on Blockchain</h1>
                    <p className="lead my-3">A secure, transparent, and immutable solution for property management.</p>
                    <Link to="/manage-land" className="btn btn-primary btn-lg">
                        {account ? 'Manage Your Land' : 'Connect Wallet to Get Started'}
                    </Link>
                </div>
            </div>

            <div className="container my-5">
                <div className="row text-center">
                    <div className="col-md-4">
                        <i className="bi bi-shield-lock-fill fs-1 text-primary"></i>
                        <h3>Secure</h3>
                        <p>Leveraging blockchain's immutability to prevent fraud and unauthorized changes to land records.</p>
                    </div>
                    <div className="col-md-4">
                        <i className="bi bi-eye-fill fs-1 text-primary"></i>
                        <h3>Transparent</h3>
                        <p>All ownership records and transfers are publicly verifiable, building trust among all parties.</p>
                    </div>
                    <div className="col-md-4">
                        <i className="bi bi-lightning-charge-fill fs-1 text-primary"></i>
                        <h3>Efficient</h3>
                        <p>Smart contracts automate the transfer process, reducing paperwork, time, and intermediary costs.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LandingPage;