import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
    FaBuilding, 
    FaMapMarkerAlt, 
    FaClock, 
    FaBolt, 
    FaHeart, 
    FaRegHeart,
} from 'react-icons/fa';
import { ImageApi } from '../../../services/ImageApi';
import { addFavoriteJob, removeFavoriteJob } from '../../../redux/slices/favoriteSlice';
import HTMLContent from '../../../ultils/HTMLContent';

const JobCard = ({ job, company }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    
    const { currentUser } = useSelector(state => state.auth);
    const favoriteJobIds = useSelector(state => state.favorites.favoriteJobIds);
    
    const [companyLogoUrl, setCompanyLogoUrl] = useState('');
    const [logoError, setLogoError] = useState(false);
    
    const currentUserId = localStorage.getItem('userId');
    const isFavorite = favoriteJobIds.includes(job.jobID);
    const displayCompany = company || job.company;
    const isAuthenticated = !!currentUser;

    useEffect(() => {
        console.log('JobCard rendered', isAuthenticated, currentUser, currentUserId);
        const fetchCompanyLogo = async () => {
            if (displayCompany?.logo) {
                try {
                    await ImageApi.getImageById(displayCompany.logo);
                    setCompanyLogoUrl(displayCompany.logo);
                } catch (error) {
                    setLogoError(true);
                    console.error('Error fetching company logo:', error);
                }
            }
        };

        fetchCompanyLogo();
    }, [displayCompany]);

    // Rest of the component remains the same
    const handleFavoriteToggle = async () => {
        try {
            if (isFavorite) {
                await dispatch(removeFavoriteJob(job.jobID)).unwrap();
            } else {
                await dispatch(addFavoriteJob(job.jobID)).unwrap();
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
        }
    };

    const calculateRemainingDays = (closingDate) => {
        const today = new Date();
        const closing = new Date(closingDate);
        const timeDiff = closing.getTime() - today.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

        if (daysDiff < 0) return 'Đã hết hạn';
        if (daysDiff === 0) return 'Hôm nay';
        if (daysDiff === 1) return 'Còn 1 ngày';
        return `Còn ${daysDiff} ngày`;
    };

    const limitDescription = (description, maxLines = 3) => {
        if (!description) return '';
        const plainText = description.replace(/<[^>]*>/g, '');
        const words = plainText.split(' ');
        const wordsPerLine = 12;
        const maxWords = wordsPerLine * maxLines;
        
        if (words.length > maxWords) {
            return description.split(' ').slice(0, maxWords).join(' ') + '...';
        }
        return description;
    };

    const showFavoriteButton = isAuthenticated && currentUser && currentUserId;

    return (
        <div className="relative flex flex-col h-full bg-white rounded-lg shadow-md hover:shadow-lg transition duration-300 overflow-hidden">
            {/* Component JSX remains unchanged */}
            <div className="absolute top-3 right-3 z-10 flex items-center">
                {job.isUrgent && (
                    <div className="bg-red-600 text-white text-sm px-3 py-1 rounded-full shadow-md flex items-center mr-2">
                        <FaBolt className="mr-1" />
                        <span>Tuyển gấp</span>
                    </div>
                )}
                
                {showFavoriteButton && (
                    <button 
                        onClick={handleFavoriteToggle}
                        className={`${isFavorite ? 'text-red-500' : 'text-gray-400'} hover:text-red-500`}
                        title={isFavorite ? 'Bỏ lưu' : 'Lưu công việc'}
                    >
                        {isFavorite ? <FaHeart /> : <FaRegHeart />}
                    </button>
                )}
            </div>
            
            <div className="p-4 flex-grow flex flex-col">
                <div className="flex items-start mb-4">
                    <div className="w-16 h-16 mr-4 flex-shrink-0">
                        {companyLogoUrl && !logoError ? (
                            <img 
                                src={companyLogoUrl.startsWith('data:') ? companyLogoUrl : `/api/Image${companyLogoUrl}`}
                                alt={`${displayCompany.name} logo`} 
                                className="w-full h-full object-contain rounded"
                            />
                        ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded">
                                <FaBuilding className="text-gray-500" />
                            </div>
                        )}
                    </div>

                    <div className="flex-grow">
                        <h3 
                            className="text-lg font-semibold text-gray-800 mb-1 cursor-pointer hover:text-blue-600 transition" 
                            onClick={() => navigate(`/jobs/${job.jobID}`)}
                        >
                            {job.title}
                        </h3>
                        
                        <div 
                            className="text-gray-600 text-sm cursor-pointer hover:text-blue-600 transition" 
                            onClick={() => navigate(`/companies`)}
                        >
                            {displayCompany.name}
                        </div>
                    </div>
                </div>
                
                <div className="flex items-center text-gray-600 mb-2">
                    <FaMapMarkerAlt className="mr-2 flex-shrink-0" />
                    <span className="truncate">{job.location.name}</span>
                </div>
                
                <div className="flex items-center text-gray-600 mb-3">
                    <FaClock className="mr-2 flex-shrink-0" />
                    <span>{calculateRemainingDays(job.closingDate)}</span>
                </div>
                
                <div className="text-gray-700 mb-4 flex-grow">
                    <HTMLContent 
                        content={limitDescription(job.description)}
                        className="line-clamp-3"
                    />
                </div>
                
                <div className="mt-auto">
                    <button 
                        onClick={() => navigate(`/jobs/${job.jobID}`)}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        Xem chi tiết
                    </button>
                </div>
            </div>
        </div>
    );
};

export default JobCard;