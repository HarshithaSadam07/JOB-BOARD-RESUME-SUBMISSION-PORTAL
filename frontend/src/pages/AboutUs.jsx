import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const AboutUs = () => {
  return (
    <div className="page">
      <Navbar />
      <div className="container" style={{ padding: '60px 20px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            color: '#1a202c',
            marginBottom: '1.5rem',
            textAlign: 'center',
            background: 'linear-gradient(90deg, #4f46e5, #8b5cf6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            display: 'inline-block',
            width: '100%'
          }}>
            About JobWave
          </h1>
          
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '40px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
          }}>
            <div style={{ marginBottom: '2.5rem' }}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: '#2d3748',
                marginBottom: '1rem'
              }}>
                Our Mission
              </h2>
              <p style={{
                color: '#4a5568',
                lineHeight: '1.6',
                fontSize: '1.1rem',
                marginBottom: '1.5rem'
              }}>
                At JobWave, we're dedicated to connecting talented professionals with their dream jobs and helping companies find the perfect candidates. Our mission is to make the job search process seamless, efficient, and stress-free for both job seekers and employers.
              </p>
            </div>

            <div style={{ marginBottom: '2.5rem' }}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: '#2d3748',
                marginBottom: '1rem'
              }}>
                Our Story
              </h2>
              <p style={{
                color: '#4a5568',
                lineHeight: '1.6',
                fontSize: '1.1rem',
                marginBottom: '1.5rem'
              }}>
                Founded in 2023, JobWave was born out of a simple idea: to create a better way for people to find meaningful work and for companies to discover top talent. What started as a small team of passionate individuals has grown into a leading job platform that serves thousands of users every day.
              </p>
            </div>

            <div style={{ marginBottom: '2.5rem' }}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: '#2d3748',
                marginBottom: '1.5rem'
              }}>
                Why Choose JobWave?
              </h2>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '1.5rem',
                marginBottom: '1.5rem'
              }}>
                {[
                  {
                    title: 'User-Friendly Platform',
                    description: 'Our intuitive interface makes job searching and hiring simple and efficient.'
                  },
                  {
                    title: 'Wide Range of Opportunities',
                    description: 'Access thousands of job listings across various industries and experience levels.'
                  },
                  {
                    title: 'Smart Matching',
                    description: 'Our advanced algorithms connect you with the most relevant job opportunities.'
                  },
                  {
                    title: 'Dedicated Support',
                    description: 'Our team is always here to help you with any questions or concerns.'
                  }
                ].map((feature, index) => (
                  <div key={index} style={{
                    backgroundColor: '#f8fafc',
                    padding: '1.5rem',
                    borderRadius: '8px',
                    borderLeft: '4px solid #4f46e5'
                  }}>
                    <h3 style={{
                      fontSize: '1.1rem',
                      fontWeight: '600',
                      color: '#2d3748',
                      marginBottom: '0.5rem'
                    }}>
                      {feature.title}
                    </h3>
                    <p style={{ color: '#4a5568', fontSize: '0.95rem' }}>
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: '#2d3748',
                marginBottom: '1.5rem'
              }}>
                Get in Touch
              </h2>
              <p style={{
                color: '#4a5568',
                lineHeight: '1.6',
                marginBottom: '1.5rem',
                fontSize: '1.1rem'
              }}>
                Have questions or feedback? We'd love to hear from you! Contact our support team at <a href="mailto:support@jobwave.com" style={{ color: '#4f46e5', textDecoration: 'none', fontWeight: '500' }}>support@jobwave.com</a> or give us a call at <a href="tel:+1234567890" style={{ color: '#4f46e5', textDecoration: 'none', fontWeight: '500' }}>(123) 456-7890</a>.
              </p>
              <div style={{
                display: 'flex',
                gap: '1rem',
                marginTop: '2rem'
              }}>
                {['LinkedIn', 'Twitter', 'Facebook'].map((social, index) => (
                  <a
                    key={index}
                    href="#"
                    style={{
                      backgroundColor: '#f1f5f9',
                      color: '#4f46e5',
                      padding: '0.5rem 1rem',
                      borderRadius: '6px',
                      textDecoration: 'none',
                      fontWeight: '500',
                      transition: 'all 0.2s',
                      ':hover': {
                        backgroundColor: '#e2e8f0'
                      }
                    }}
                  >
                    {social}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AboutUs;
