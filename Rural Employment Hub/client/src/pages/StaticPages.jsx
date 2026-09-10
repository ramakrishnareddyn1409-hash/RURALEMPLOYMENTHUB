import React from "react";
import { Helmet } from "react-helmet-async";
import Navbar from "../components/Navbar";
import Card from "../components/Card";

export const Features = () => (
  <>
    <Helmet><title>Features - Rural Employment Hub</title></Helmet>
    <Navbar />
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Features</h1>
      <div className="grid md:grid-cols-2 gap-6">
        <Card><h3 className="font-bold mb-2">Smart Attendance</h3>Face recognition and biometric verification</Card>
        <Card><h3 className="font-bold mb-2">Payment Management</h3>Digital payments and salary tracking</Card>
        <Card><h3 className="font-bold mb-2">Work Assignments</h3>Organize and track rural employment projects</Card>
        <Card><h3 className="font-bold mb-2">AI Assistant</h3>24/7 chatbot support for employees</Card>
      </div>
    </div>
  </>
);

export const Contact = () => (
  <>
    <Helmet><title>Contact - Rural Employment Hub</title></Helmet>
    <Navbar />
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Contact Us</h1>
      <Card>
        <p className="mb-4">Email: support@ruralhub.com</p>
        <p className="mb-4">Phone: +91-XXXX-XXXX</p>
        <p>Address: Rural Employment Hub, India</p>
      </Card>
    </div>
  </>
);

export const FAQ = () => (
  <>
    <Helmet><title>FAQ - Rural Employment Hub</title></Helmet>
    <Navbar />
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Frequently Asked Questions</h1>
      <Card>
        <h3 className="font-bold mb-2">How do I register?</h3>
        <p className="mb-4">Click on Register and fill in your details.</p>
        <h3 className="font-bold mb-2">How is attendance tracked?</h3>
        <p>We use face recognition and biometric verification for accurate attendance.</p>
      </Card>
    </div>
  </>
);

export const PrivacyPolicy = () => (
  <>
    <Helmet><title>Privacy Policy - Rural Employment Hub</title></Helmet>
    <Navbar />
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
      <Card>
        <p>Your privacy is important to us. We collect and use personal data in accordance with applicable laws.</p>
      </Card>
    </div>
  </>
);

export const Terms = () => (
  <>
    <Helmet><title>Terms of Service - Rural Employment Hub</title></Helmet>
    <Navbar />
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>
      <Card>
        <p>By using Rural Employment Hub, you agree to these terms and conditions.</p>
      </Card>
    </div>
  </>
);

export const NotFound = () => (
  <>
    <Helmet><title>404 - Not Found</title></Helmet>
    <Navbar />
    <div className="flex items-center justify-center min-h-screen">
      <Card className="text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="mb-4">Page not found</p>
        <a href="/" className="text-primary-500 hover:underline">Go to Home</a>
      </Card>
    </div>
  </>
);

export const Unauthorized = () => (
  <>
    <Helmet><title>Unauthorized</title></Helmet>
    <Navbar />
    <div className="flex items-center justify-center min-h-screen">
      <Card className="text-center">
        <h1 className="text-4xl font-bold mb-4">403</h1>
        <p className="mb-4">Unauthorized Access</p>
        <a href="/" className="text-primary-500 hover:underline">Go to Home</a>
      </Card>
    </div>
  </>
);
