import React, { useState } from 'react';
import Layout from '../components/layout/Layout';
import CVEditor from '../components/cv/CVEditor';

const CVBuilderPage = () => {
  return (
    <Layout>
      <div className="App bg-gray-100 min-h-screen p-6">
        <CVEditor />
      </div>
    </Layout>
  );
};

export default CVBuilderPage;