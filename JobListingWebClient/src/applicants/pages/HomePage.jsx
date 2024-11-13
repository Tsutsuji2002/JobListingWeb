import React from 'react';
import Layout from '../components/layout/Layout';
import Hero from '../components/home/Hero';
import FeaturedJobs from '../components/home/FeaturedJobs';
import CompanyHighlights from '../components/home/CompanyHighlights';
import { jobListings } from '../data/jobListings';

// Sample company data - in practice, this would come from your data source
const companies = [
  {
    id: 1,
    name: 'TechCorp',
    description: 'Leading technology solutions provider',
    openPositions: 5
  },
  {
    id: 2,
    name: 'InnovateLabs',
    description: 'Innovation-driven research company',
    openPositions: 3
  },
  {
    id: 3,
    name: 'DesignStudio',
    description: 'Creative design and branding agency',
    openPositions: 2
  },
  {
    id: 4,
    name: 'DataDynamics',
    description: 'Data analytics and insights company',
    openPositions: 4
  }
];

const HomePage = () => {
  return (
    <Layout>
      <Hero />
      <FeaturedJobs jobs={jobListings} />
      <CompanyHighlights companies={companies} />
    </Layout>
  );
};

export default HomePage;