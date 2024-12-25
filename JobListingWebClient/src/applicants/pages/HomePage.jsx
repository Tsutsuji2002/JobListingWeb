import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Layout from '../components/layout/Layout';
import Hero from '../components/home/Hero';
import FeaturedJobs from '../components/home/FeaturedJobs';
import CompanyHighlights from '../components/home/CompanyHighlights';
import { fetchFeaturedJobs } from '../../redux/slices/jobSlice';
import { fetchFeaturedCompanies } from '../../redux/slices/companySlice';

const HomePage = () => {
  const dispatch = useDispatch();
  const { featuredJobs, loading, error } = useSelector((state) => state.jobs); 
  const { featuredcompanies } = useSelector((state) => state.companies);

  useEffect(() => {
    dispatch(fetchFeaturedJobs());
    dispatch(fetchFeaturedCompanies());
  }, [dispatch]);

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-screen">
          <div className="spinner-border text-primary" role="status">
            <span className="sr-only">Loading Jobs...</span>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-screen">
          <div className="alert alert-danger" role="alert">
            <h2>Error Loading Jobs</h2>
            <p>{error.message || 'An unexpected error occurred'}</p>
            <button 
              onClick={() => dispatch(fetchFeaturedJobs())}
              className="btn btn-outline-primary mt-3"
            >
              Try Again
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Hero />
      <FeaturedJobs jobs={featuredJobs} />
      <CompanyHighlights companies={featuredcompanies} />
    </Layout>
  );
};

export default HomePage;