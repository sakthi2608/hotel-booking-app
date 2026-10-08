import React from "react";
import Navbar from "../components/Navbar";
import "./About.css";

const About = () => {
  return (
    <>
      <Navbar />

      <div className="about-page">

        <section className="about-hero">
          <div className="about-hero-content">
            <p className="about-subtitle">WELCOME TO OUR HOTEL BOOKING</p>

            <h1>
              Stay Somewhere
              <br />
              You’ll Love
            </h1>

            <p>
              Discover comfortable stays, explore beautiful destinations,
              and find the right hotel for every journey.
            </p>
          </div>
        </section>

        <section className="about-story">
          <div className="about-story-content">
            <p className="about-label">WHO WE ARE</p>
            <h2>Making Hotel Discovery Simple</h2>

            <p>
              Our hotel booking platform is designed to make finding the
              perfect stay simple, convenient, and reliable.
            </p>

            <p>
              From hotel details and room options to pricing, facilities,
              location and nearby information, everything is presented
              in one easy-to-use experience.
            </p>
          </div>
        </section>

        <section className="about-why">
          <div className="about-section-heading">
            <p className="about-label">WHY CHOOSE US</p>
            <h2>Everything You Need for a Better Stay</h2>
          </div>

          <div className="about-features">
            <div className="about-feature-card">
             
              <h3>Quality Stays</h3>
              <p>
                Explore hotels with detailed information about rooms,
                facilities and available services.
              </p>
            </div>

            <div className="about-feature-card">
              
              <h3>Easy Location</h3>
              <p>
                View hotel locations on an interactive map using
                accurate latitude and longitude information.
              </p>
            </div>

            <div className="about-feature-card">
             
              <h3>Clear Pricing</h3>
              <p>
                Compare hotel prices easily and find stays that
                match your budget.
              </p>
            </div>

            <div className="about-feature-card">
              
              <h3>Smart Search</h3>
              <p>
                Quickly find hotels using search, price filters and
                other useful hotel options.
              </p>
            </div>
          </div>
        </section>

        <section className="about-promise">
          <div className="about-promise-content">
            <p className="about-label">OUR PROMISE</p>
            <h2>Comfort, Choice & Convenience</h2>
            <p>
              We believe choosing a hotel should be simple. Our goal is
              to provide clear information and a smooth browsing
              experience so every traveler can make a confident choice.
            </p>
          </div>
        </section>

      </div>
    </>
  );
};

export default About;