import React from 'react';

function FeaturesPage() {
    return (
        <div className="container my-5 pt-5">
            <h1 className="text-center mb-4">Core Features</h1>
            <div className="row">
                <div className="col-md-4 mb-4">
                    <div className="card h-100 text-center">
                        <div className="card-body">
                            <i className="bi bi-person-bounding-box fs-2 text-primary"></i>
                            <h5 className="card-title mt-3">User-Owned Registration</h5>
                            <p className="card-text">Any user can register their own property directly on the blockchain, establishing a clear and immediate proof of ownership.</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-4 mb-4">
                    <div className="card h-100 text-center">
                        <div className="card-body">
                            <i className="bi bi-arrow-left-right fs-2 text-primary"></i>
                            <h5 className="card-title mt-3">Secure Transfer Protocol</h5>
                            <p className="card-text">A multi-step transfer process (listing, request, approve/deny) ensures that property transfers are intentional and secure.</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-4 mb-4">
                    <div className="card h-100 text-center">
                        <div className="card-body">
                            <i className="bi bi-shield-check fs-2 text-primary"></i>
                            <h5 className="card-title mt-3">Admin Oversight</h5>
                            <p className="card-text">A designated admin account has the ability to view all properties on the network, ensuring regulatory compliance and oversight.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default FeaturesPage;