# Job Listing Website

A modern job listing platform built with ASP.NET Core backend and React frontend, designed to connect employers and job seekers efficiently.

## 🚀 Technology Stack

### Backend
- **ASP.NET Core 8.0** - Modern, cross-platform framework for building API
- **Entity Framework Core** - ORM for data access and migrations
- **Identity Server** - Authentication and authorization
- **SignalR** - Real-time notifications
- **Redis** - Caching and session management
- **Hangfire** - Background job processing (email sending, etc.)
- **AutoMapper** - Object-to-object mapping
- **Swagger/OpenAPI** - API documentation

### Frontend
- **React 18** - UI library
- **JavaScript** - JavaScript
- **Redux** - State management with Redux Toolkit
- **React Router** - Navigation
- **TailwindCSS** - Utility-first CSS framework
- **React Query** - Data fetching and caching
- **Formik & Yup** - Form handling and validation
- **React Testing Library** - Component testing
- **Axios** - HTTP client

### Database
- **SQL Server** - Primary data storage
- **Redis** - Caching and real-time features

## 📋 Features

- **User Authentication**
  - Role-based access (Job Seekers, Employers, Admins)
  - Social login options
  - JWT-based authentication

- **Job Seeker Features**
  - Profile creation and management
  - Resume upload and parsing
  - Job search with advanced filters
  - Job application tracking
  - Saved job listings
  - Job alerts and notifications

- **Employer Features**
  - Company profile management
  - Job posting and management
  - Applicant tracking system
  - Resume search
  - Analytics dashboard

- **Core Functionality**
  - Intelligent job matching
  - Advanced search with filters
  - Real-time notifications
  - Email alerts
  - Responsive design for all devices

## 🏗️ Architecture

The application follows a clean architecture pattern

## 🚀 Getting Started

### Prerequisites
- .NET 8 SDK
- Node.js (v18+)
- SQL Server
- Redis

### Backend Setup

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/job-listing-website.git
   cd job-listing-website/Backend
   ```

2. Set up the database connection string in `appsettings.json`

3. Run migrations
   ```bash
   dotnet ef database update
   ```

4. Start the backend
   ```bash
   dotnet run --project API
   ```

### Frontend Setup

1. Navigate to the frontend directory
   ```bash
   cd ../Frontend
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Start the development server
   ```bash
   npm start
   ```

### Docker Setup

Alternatively, you can use Docker Compose to run the entire stack:

```bash
docker-compose up -d
```

## 🧪 Testing

### Backend Tests
```bash
cd Backend
dotnet test
```

### Frontend Tests
```bash
cd Frontend
npm test
```

## 📝 API Documentation

API documentation is available via Swagger at `/swagger` when running the backend.

## 🔄 CI/CD Pipeline

The project uses GitHub Actions for continuous integration and deployment:
- Automated build and test on push
- Deployment to staging on merge to develop branch
- Deployment to production on merge to main branch

## 📈 Roadmap

- [ ] Mobile application (React Native)
- [ ] AI-powered job matching algorithm
- [ ] Interview scheduling integration
- [ ] Skills assessment platform
- [ ] Salary insights and comparisons

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Contact

Nguyễn Thành Trung - [nguyentrungtrung2002@gmail.com](mailto:nguyentrungtrung2002@gmail.com)

Project Link: [https://github.com/Tsutsuji2002/JobListingWeb](https://github.com/Tsutsuji2002/JobListingWeb)
