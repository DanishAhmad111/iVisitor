import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { visitorService } from '../../services/api';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const initialState = {
  visitorName: '',
  visitorEmail: '',
  visitReason: '',
  carNumber: '',
  residentName: '',
  residentEmail: '',
};

const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export default function VisitorForm() {
  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prevForm => ({ ...prevForm, [name]: value }));
    setErrors(prevErrors => ({ ...prevErrors, [name]: undefined }));
  };

  const validate = () => {
    const errs = {};
    if (!form.visitorName.trim()) errs.visitorName = 'Name is required';
    if (!form.visitorEmail.trim() || !validateEmail(form.visitorEmail)) errs.visitorEmail = 'Valid email is required';
    if (!form.visitReason.trim()) errs.visitReason = 'Visit reason is required';
    if (!form.residentName.trim()) errs.residentName = 'Resident name is required';
    if (!form.residentEmail.trim() || !validateEmail(form.residentEmail)) errs.residentEmail = 'Valid resident email is required';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setSubmitting(true);
    try {
      await visitorService.submitRequest(form);
      setSuccess(true);
      // Reset form with a fresh copy of initialState to avoid reference issues
      setForm({
        visitorName: '',
        visitorEmail: '',
        visitReason: '',
        carNumber: '',
        residentName: '',
        residentEmail: '',
      });
      setErrors({});
      toast.success('Visitor registered successfully!');
    } catch (err) {
      console.error('Registration error:', err);
      toast.error('Registration failed. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white px-4 py-12">
      <Toaster position="top-center" />
      
      {/* Simple header with back button */}
      <div className="max-w-lg mx-auto mb-6">
        <Link to="/" className="inline-flex items-center text-indigo-600 hover:text-indigo-800 transition-colors">
          <ArrowLeftIcon className="h-5 w-5 mr-1" />
          Back to Home
        </Link>
      </div>
      
      <div className="w-full max-w-lg mx-auto bg-white rounded-2xl shadow-2xl p-8">
        <h1 className="text-3xl font-bold text-indigo-700 mb-2 text-center">Register Visitor</h1>
        <p className="mb-8 text-gray-500 text-center">Fill in the details below to register your visit.</p>
        {success && (
          <div className="mb-4 rounded bg-green-50 border border-green-200 text-green-800 px-4 py-2 text-center">
            Visitor registered successfully! Resident will receive an approval email.
          </div>
        )}
        <form onSubmit={handleSubmit} noValidate>
          <div className="space-y-6">
            <div className="relative">
              <input
                type="text"
                name="visitorName"
                id="visitorName"
                autoComplete="off"
                className={`peer block w-full rounded-md border px-4 pt-6 pb-2 text-gray-900 placeholder-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 ${errors.visitorName ? 'border-red-400' : 'border-gray-300'}`}
                placeholder="Visitor Name"
                value={form.visitorName}
                onChange={handleChange}
                disabled={submitting}
              />
              <label htmlFor="visitorName" className="absolute left-4 top-2 text-gray-500 text-sm transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-sm">
                Visitor Name
              </label>
              {errors.visitorName && <p className="mt-1 text-xs text-red-600">{errors.visitorName}</p>}
            </div>
            <div className="relative">
              <input
                type="email"
                name="visitorEmail"
                id="visitorEmail"
                autoComplete="off"
                className={`peer block w-full rounded-md border px-4 pt-6 pb-2 text-gray-900 placeholder-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 ${errors.visitorEmail ? 'border-red-400' : 'border-gray-300'}`}
                placeholder="Visitor Email"
                value={form.visitorEmail}
                onChange={handleChange}
                disabled={submitting}
              />
              <label htmlFor="visitorEmail" className="absolute left-4 top-2 text-gray-500 text-sm transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-sm">
                Visitor Email
              </label>
              {errors.visitorEmail && <p className="mt-1 text-xs text-red-600">{errors.visitorEmail}</p>}
            </div>
            <div className="relative">
              <textarea
                name="visitReason"
                id="visitReason"
                rows={2}
                className={`peer block w-full rounded-md border px-4 pt-6 pb-2 text-gray-900 placeholder-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 ${errors.visitReason ? 'border-red-400' : 'border-gray-300'}`}
                placeholder="Reason for Visit"
                value={form.visitReason}
                onChange={handleChange}
                disabled={submitting}
              />
              <label htmlFor="visitReason" className="absolute left-4 top-2 text-gray-500 text-sm transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-sm">
                Reason for Visit
              </label>
              {errors.visitReason && <p className="mt-1 text-xs text-red-600">{errors.visitReason}</p>}
            </div>
            <div className="relative">
              <input
                type="text"
                name="carNumber"
                id="carNumber"
                autoComplete="off"
                className="peer block w-full rounded-md border border-gray-300 px-4 pt-6 pb-2 text-gray-900 placeholder-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                placeholder="Car Number (optional)"
                value={form.carNumber}
                onChange={handleChange}
                disabled={submitting}
              />
              <label htmlFor="carNumber" className="absolute left-4 top-2 text-gray-500 text-sm transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-sm">
                Car Number (optional)
              </label>
            </div>
            <div className="relative">
              <input
                type="text"
                name="residentName"
                id="residentName"
                autoComplete="off"
                className={`peer block w-full rounded-md border px-4 pt-6 pb-2 text-gray-900 placeholder-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 ${errors.residentName ? 'border-red-400' : 'border-gray-300'}`}
                placeholder="Resident's Name"
                value={form.residentName}
                onChange={handleChange}
                disabled={submitting}
              />
              <label htmlFor="residentName" className="absolute left-4 top-2 text-gray-500 text-sm transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-sm">
                Resident's Name
              </label>
              {errors.residentName && <p className="mt-1 text-xs text-red-600">{errors.residentName}</p>}
            </div>
            <div className="relative">
              <input
                type="email"
                name="residentEmail"
                id="residentEmail"
                autoComplete="off"
                className={`peer block w-full rounded-md border px-4 pt-6 pb-2 text-gray-900 placeholder-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 ${errors.residentEmail ? 'border-red-400' : 'border-gray-300'}`}
                placeholder="Resident's Email"
                value={form.residentEmail}
                onChange={handleChange}
                disabled={submitting}
              />
              <label htmlFor="residentEmail" className="absolute left-4 top-2 text-gray-500 text-sm transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-sm">
                Resident's Email
              </label>
              {errors.residentEmail && <p className="mt-1 text-xs text-red-600">{errors.residentEmail}</p>}
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 py-3 rounded-md bg-indigo-600 text-white font-semibold text-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all disabled:opacity-60"
            >
              {submitting ? 'Registering...' : 'Register Visitor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
