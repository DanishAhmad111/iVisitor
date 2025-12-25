import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheckIcon, UserPlusIcon, CheckCircleIcon, ArrowTrendingUpIcon, HandThumbUpIcon, SparklesIcon, ClipboardDocumentIcon, ShareIcon } from '@heroicons/react/24/outline';
import { ClipboardDocumentCheckIcon } from '@heroicons/react/24/solid';
import { toast } from 'react-hot-toast';
import heroIllustration from '../../assets/hero-illustration.svg';
import LandingNav from '../common/LandingNav';

export default function LandingPage() {
  const [copied, setCopied] = useState(false);
  
  // The visitor registration URL
  const visitorRegistrationUrl = window.location.origin + '/visitor-form';
  
  // Function to copy the URL to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(visitorRegistrationUrl)
      .then(() => {
        setCopied(true);
        toast.success('Registration link copied to clipboard!');
        // Reset the copied state after 3 seconds
        setTimeout(() => setCopied(false), 3000);
      })
      .catch(() => {
        toast.error('Failed to copy link. Please try again.');
      });
  };
  
  // Function to share the URL
  const shareUrl = () => {
    if (navigator.share) {
      navigator.share({
        title: 'iVisitor Registration',
        text: 'Register your visit using this link:',
        url: visitorRegistrationUrl,
      })
        .then(() => toast.success('Shared successfully!'))
        .catch((error) => {
          console.error('Error sharing:', error);
          toast.error('Failed to share. Please try again.');
        });
    } else {
      // Fallback for browsers that don't support the Web Share API
      copyToClipboard();
      toast.success('Link copied! You can now share it manually.');
    }
  };
  const features = [
    {
      name: 'Secure Access Control',
      description: 'Advanced security protocols to manage and track visitor access',
      icon: ShieldCheckIcon,
    },
    {
      name: 'Quick Registration',
      description: 'Streamlined visitor registration process with instant notifications',
      icon: UserPlusIcon,
    },
    {
      name: 'Real-time Monitoring',
      description: 'Live tracking and management of visitor status and movements',
      icon: CheckCircleIcon,
    },
  ];

  return (
    <div className="bg-white min-h-screen flex flex-col ">
      <LandingNav />
      {/* Hero section */}
      <div className="relative isolate overflow-hidden bg-gradient-to-b from-indigo-100/20 mt-10">
        <div className="mx-auto max-w-7xl pb-24 pt-10 sm:pb-32 lg:grid lg:grid-cols-2 lg:gap-x-8 lg:px-8 lg:py-40">
          <div className="px-6 lg:px-0 lg:pt-4">
            <div className="mx-auto max-w-2xl">
              <div className="max-w-lg">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                    Welcome to{' '}
                    <span className="text-indigo-600">iVisitor</span>
                  </h1>
                  <p className="mt-6 text-lg leading-8 text-gray-600">
                    A modern visitor management system that streamlines guest registration,
                    enhances security, and improves the visitor experience.
                  </p>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="mt-10 flex flex-col sm:flex-row items-center gap-y-6 gap-x-6"
                >
                  <Link
                    to="/login"
                    className="w-full sm:w-auto rounded-md bg-indigo-600 px-6 py-3 text-lg font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all duration-200 text-center"
                  >
                    Guard Login
                  </Link>
                  
                  <div className="flex flex-col gap-y-3 w-full">
                    <div className="flex flex-col sm:flex-row items-center gap-y-3 gap-x-3 w-full">
                      <button
                        onClick={copyToClipboard}
                        className="w-full sm:w-auto flex items-center justify-center rounded-md bg-white px-6 py-3 text-lg font-semibold text-indigo-600 shadow-sm ring-1 ring-inset ring-indigo-600 hover:bg-indigo-50 transition-all duration-200"
                      >
                        {copied ? (
                          <ClipboardDocumentCheckIcon className="h-5 w-5 mr-2 text-green-500" />
                        ) : (
                          <ClipboardDocumentIcon className="h-5 w-5 mr-2" />
                        )}
                        {copied ? 'Copied!' : 'Copy Link'}
                      </button>
                      
                      <button
                        onClick={shareUrl}
                        className="w-full sm:w-auto flex items-center justify-center rounded-md bg-indigo-100 px-6 py-3 text-lg font-semibold text-indigo-700 shadow-sm hover:bg-indigo-200 transition-all duration-200"
                      >
                        <ShareIcon className="h-5 w-5 mr-2" />
                        Share
                      </button>
                    </div>
                    <p className="text-sm text-gray-500 text-center sm:text-left">Share this link with visitors to register</p>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
          <div className="mt-20 sm:mt-24 md:mx-auto md:max-w-2xl lg:mx-0 lg:mt-0 lg:w-screen">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="relative lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2"
            >
              <div className="relative w-full h-64 sm:h-72 md:h-96 lg:absolute lg:inset-0">
                <motion.img
                  src={heroIllustration}
                  alt="Visitor Management System"
                  className="w-full h-full object-contain lg:object-cover rounded-3xl shadow-2xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                />
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-indigo-600/20 to-transparent mix-blend-multiply" />
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Features section */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-24 sm:py-32">
        <div className="mx-auto max-w-2xl lg:text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h2 className="text-base font-semibold leading-7 text-indigo-600">Faster Processing</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need to manage visitors
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Our comprehensive visitor management system provides all the tools you need to
              efficiently handle guest registration and security.
            </p>
          </motion.div>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-3 lg:gap-y-16">
            {features.map((feature, index) => (
              <motion.div
                key={feature.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                className="relative pl-16"
              >
                <dt className="text-base font-semibold leading-7 text-gray-900">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600">
                    <feature.icon className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  {feature.name}
                </dt>
                <dd className="mt-2 text-base leading-7 text-gray-600">{feature.description}</dd>
              </motion.div>
            ))}
          </dl>
        </div>
      </div>

      {/* How it Works Section */}
      <section className="bg-indigo-50 py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-indigo-700 mb-10 text-center">How it Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center">
              <UserPlusIcon className="w-14 h-14 text-indigo-500 mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Step 1: Register Visitor</h3>
              <p className="text-gray-600 text-center">Fill out the visitor form to register your guest in advance or on arrival.</p>
            </div>
            <div className="flex flex-col items-center">
              <ShieldCheckIcon className="w-14 h-14 text-indigo-500 mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Step 2: Approval & Verification</h3>
              <p className="text-gray-600 text-center">Resident receives an email to approve or reject the visitor. Guard verifies on arrival.</p>
            </div>
            <div className="flex flex-col items-center">
              <CheckCircleIcon className="w-14 h-14 text-indigo-500 mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Step 3: Entry & Monitoring</h3>
              <p className="text-gray-600 text-center">Visitor is allowed entry and their in/out times are monitored for security.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-indigo-700 mb-10 text-center">Why Choose iVisitor?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center">
              <ArrowTrendingUpIcon className="w-12 h-12 text-indigo-500 mb-3" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Reliable & Scalable</h3>
              <p className="text-gray-600 text-center">Built for performance and reliability, iVisitor scales with your community or business.</p>
            </div>
            <div className="flex flex-col items-center">
              <HandThumbUpIcon className="w-12 h-12 text-indigo-500 mb-3" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Trusted by Users</h3>
              <p className="text-gray-600 text-center">Loved by residents, guards, and admins for its simplicity and effectiveness.</p>
            </div>
            <div className="flex flex-col items-center">
              <SparklesIcon className="w-12 h-12 text-indigo-500 mb-3" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Modern UI/UX</h3>
              <p className="text-gray-600 text-center">A beautiful, intuitive interface designed for a seamless experience on any device.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-indigo-900 text-white py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <span className="font-bold text-lg">iVisitor</span> &copy; {new Date().getFullYear()} All rights reserved.
          </div>
          <div className="flex gap-6">
            <button onClick={copyToClipboard} className="hover:underline cursor-pointer">Get Registration Link</button>
            <Link to="/login" className="hover:underline">Guard Login</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
