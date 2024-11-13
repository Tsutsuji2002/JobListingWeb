import api from "./api";

// Get all companies
export const getAllCompanies = async () => {
  try {
    const response = await api.get('/Company');
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch companies: ' + error.message);
  }
};

// Get company by ID
export const getCompanyById = async (id) => {
  try {
    const response = await api.get(`/Company/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch company ${id}: ` + error.message);
  }
};

// Create new company
export const createCompany = async (companyData) => {
  try {
    const response = await api.post('/Company', companyData);
    return response.data;
  } catch (error) {
    throw new Error('Failed to create company: ' + error.message);
  }
};

export const createCompanyWithLocationsAndIndustries = async (companyData) => {
  try {
    // Create FormData for the company with images
    const formData = new FormData();
    formData.append('name', companyData.get('name'));
    formData.append('description', companyData.get('description'));
    formData.append('foundedYear', companyData.get('foundedYear'));
    formData.append('website', companyData.get('website'));
    formData.append('userId', companyData.get('userId'));
    
    if (companyData.has('logo')) {
      formData.append('logo', companyData.get('logo'));
    }
    if (companyData.has('background')) {
      formData.append('background', companyData.get('background'));
    }

    console.log('Company LOC:', companyData.get('mappingLocations'));
    console.log('Company IND:', companyData.get('mappingIndustries'));

    // Create the company first with multipart/form-data
    const companyResponse = await api.post('/Company', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const newCompanyId = companyResponse.data.companyID;

    // Add locations
    if (companyData.get('mappingLocations') !== null) {
      const locationData = companyData.get('mappingLocations');
      
      const parsedLocations = typeof locationData === 'string' 
      ? JSON.parse(locationData) 
      : locationData;
      // Create the request object in the exact format the API expects
      const requestBody = {
        mappingLocations: parsedLocations.map(location => ({
          locationId: location.locationId || location.LocationId,
          address: location.address || location.Address
        }))
      };
    
      console.log('Sending locations:', requestBody); // Debug log to verify structure
    
      await api.post(`/Company/${newCompanyId}/locations`, 
        requestBody,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        });
    }

    // Add industries
    if (companyData.get('mappingIndustries') !== null) {
      const industryData = companyData.get('mappingIndustries');
      const parsedIndustries = typeof industryData === 'string' 
        ? JSON.parse(industryData) 
        : industryData;

      // Modified to match the backend model structure
      const requestBody = {
        mappingIndustries: parsedIndustries.map(industry => ({
          industryId: industry.industryId || industry.IndustryId
        }))
      };
    
      console.log('Sending industries:', requestBody);
    
      await api.post(`/Company/${newCompanyId}/industries`, 
        requestBody,  // Remove the nested 'request' object
        {
          headers: {
            'Content-Type': 'application/json',
          },
        });
    }

    return {
      ...companyResponse.data
    };
  } catch (error) {
    throw new Error('Failed to create company with locations and industries: ' + error.message);
  }
};

// Update company
export const updateCompany = async ( id, companyData ) => {
  try {
    console.log(JSON.stringify(companyData));
    const formData = new FormData();
    
    // Add basic fields
    formData.append('name', companyData.get('name'));
    formData.append('description', companyData.get('description'));
    formData.append('foundedYear', companyData.get('foundedYear'));
    formData.append('website', companyData.get('website'));

    if (companyData.get('logo')) {
      // Check if logo is a File object or a base64 string
      if (companyData.get('logo') instanceof File) {
        formData.append('logo', companyData.get('logo'));
      } else if (typeof companyData.get('logo') === 'string' && companyData.get('logo').startsWith('data:')) {
        // Convert base64 to File object
        const response = await fetch(companyData.get('logo'));
        const blob = await response.blob();
        const logoFile = new File([blob], 'logo.png', { type: 'image/png' });
        formData.append('logo', logoFile);
      }
    }

    // Handle background file
    if (companyData.get('background')) {
      // Check if background is a File object or a base64 string
      if (companyData.get('background') instanceof File) {
        formData.append('background', companyData.get('background'));
      } else if (typeof companyData.get('background') === 'string' && companyData.get('background').startsWith('data:')) {
        // Convert base64 to File object
        const response = await fetch(companyData.get('background'));
        const blob = await response.blob();
        const backgroundFile = new File([blob], 'background.png', { type: 'image/png' });
        formData.append('background', backgroundFile);
      }
    }

    console.log(formData);

    const response = await api.put(`/Company/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Delete company
export const deleteCompany = async (id) => {
  try {
    await api.delete(`/Company/${id}`);
    return true;
  } catch (error) {
    throw new Error(`Failed to delete company ${id}: ` + error.message);
  }
};

// Check if company exists
export const checkCompanyExists = async (id) => {
  try {
    const response = await api.get(`/Company/exists/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to check company existence ${id}: ` + error.message);
  }
};

// Get companies by industry
export const getCompaniesByIndustry = async (industryId) => {
  try {
    const response = await api.get(`/Company/industry/${industryId}`);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch companies for industry ${industryId}: ` + error.message);
  }
};

// Get companies by location
export const getCompaniesByLocation = async (locationId) => {
  try {
    const response = await api.get(`/Company/location/${locationId}`);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch companies for location ${locationId}: ` + error.message);
  }
};

// Search companies
export const searchCompanies = async (searchTerm) => {
  try {
    const response = await api.get(`/Company/search`, {
      params: { searchTerm }
    });
    return response.data;
  } catch (error) {
    throw new Error(`Failed to search companies: ` + error.message);
  }
};

export const getCompanyByUserId = async (userId) => {
  try {
    const response = await api.get(`/Company/user/${userId}`);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch company for user ${userId}: ` + error.message);
  }
};