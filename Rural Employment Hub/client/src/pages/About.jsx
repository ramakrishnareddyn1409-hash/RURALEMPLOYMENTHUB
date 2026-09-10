import React from "react";
import { Helmet } from "react-helmet-async";
import Navbar from "../components/Navbar";
import Card from "../components/Card";

const About = () => (
  <>
    <Helmet><title>About - Rural Employment Hub</title></Helmet>
    <Navbar />
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">About Rural Employment Hub</h1>
      <Card>
        <p className="mb-4">
          Rural Employment Hub is a comprehensive digital platform designed to transform employment management in rural communities.
        </p>
        <p className="mb-4">
          Our mission is to provide transparency, efficiency, and security in rural employment through technology.
        </p>
        <h2 className="text-xl font-bold mt-6 mb-3">Our Vision</h2>
        <p>
          Empower rural workers with digital tools for employment, attendance, and payment management.
        </p>
      </Card>
    </div>
  </>
);

export default About;
