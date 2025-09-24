import React, { useState } from "react";

function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
    console.log("Form submitted:", formData);
    alert("Thank you for your message! We will get back to you soon.");
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Contact Us
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Have questions about our blockchain land registry? We're here to
            help. Reach out to us and we'll get back to you as soon as possible.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Information */}
          <div className="lg:col-span-1">
            <div className="space-y-8">
              {/* Get in Touch */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Get in Touch
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  We're committed to providing excellent support for our
                  blockchain land registry platform. Whether you have technical
                  questions, need assistance with property registration, or want
                  to learn more about our technology, we're here to help.
                </p>
              </div>

              {/* Contact Details */}
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-6 h-6 text-primary-600 dark:text-primary-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      Email
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300">
                      support@landregistry.blockchain
                    </p>
                    <p className="text-gray-600 dark:text-gray-300">
                      info@landregistry.blockchain
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
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
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      Phone
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300">
                      +1 (555) 123-4567
                    </p>
                    <p className="text-gray-600 dark:text-gray-300">
                      Available Mon-Fri, 9AM-6PM EST
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
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
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      Office
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300">
                      123 Blockchain Avenue
                    </p>
                    <p className="text-gray-600 dark:text-gray-300">
                      Tech City, TC 12345
                    </p>
                  </div>
                </div>
              </div>

              {/* Response Time */}
              <div className="card p-6">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Response Time
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-300">
                      General Inquiries
                    </span>
                    <span className="text-green-600 dark:text-green-400 font-semibold">
                      Within 24 hours
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-300">
                      Technical Support
                    </span>
                    <span className="text-blue-600 dark:text-blue-400 font-semibold">
                      Within 12 hours
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-300">
                      Critical Issues
                    </span>
                    <span className="text-red-600 dark:text-red-400 font-semibold">
                      Within 4 hours
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="card p-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Send us a Message
              </h3>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="form-label">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
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
                      placeholder="Enter your email address"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="form-label">
                    Subject *
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="form-input"
                  >
                    <option value="">Please select a subject</option>
                    <option value="general">General Inquiry</option>
                    <option value="technical">Technical Support</option>
                    <option value="registration">
                      Property Registration Help
                    </option>
                    <option value="transfer">Transfer Process Questions</option>
                    <option value="admin">Admin Panel Issues</option>
                    <option value="partnership">
                      Partnership Opportunities
                    </option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="form-label">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="form-input"
                    placeholder="Please provide details about your inquiry..."
                  />
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full md:w-auto btn-primary px-8 py-4 text-lg"
                  >
                    Send Message
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
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                      />
                    </svg>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Quick answers to common questions about our platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="card p-6">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                How do I register my property?
              </h4>
              <p className="text-gray-600 dark:text-gray-300">
                Connect your Web3 wallet, navigate to the "Manage Land" section,
                and fill out the registration form with your property details.
                The registration will be recorded on the blockchain.
              </p>
            </div>

            <div className="card p-6">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                What wallet do I need?
              </h4>
              <p className="text-gray-600 dark:text-gray-300">
                You need a Web3 wallet like MetaMask. Make sure you have some
                Ether for transaction fees and that you're connected to the
                correct network.
              </p>
            </div>

            <div className="card p-6">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                How secure is the blockchain registry?
              </h4>
              <p className="text-gray-600 dark:text-gray-300">
                Our smart contracts use industry-standard security practices,
                access controls, and have been thoroughly tested. All
                transactions are immutable and transparent on the blockchain.
              </p>
            </div>

            <div className="card p-6">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Can I transfer my property to someone else?
              </h4>
              <p className="text-gray-600 dark:text-gray-300">
                Yes! List your property for sale, and when someone requests to
                buy it, you can approve or deny the transfer. The blockchain
                ensures secure and verified transactions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactPage;
