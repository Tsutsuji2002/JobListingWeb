import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBlogsByType, fetchAllBlogTypes } from '../../redux/slices/postSlice';
import { Book, Calendar, User, ChevronRight } from 'lucide-react';
import Layout from '../components/layout/Layout';
import { stripHtmlAndTruncate } from '../../ultils/textUtils';

const BlogbyTypePage = () => {
  const { blogTypeId } = useParams();
  const dispatch = useDispatch();

  const blogs = useSelector((state) => state.posts.posts);
  const blogTypes = useSelector((state) => state.posts.blogTypes);
  const loading = useSelector((state) => state.posts.status === 'loading');
  const error = useSelector((state) => state.posts.error);

  const [currentBlogType, setCurrentBlogType] = useState(null);

  useEffect(() => {
    dispatch(fetchBlogsByType(blogTypeId));

    if (blogTypes.length === 0) {
      dispatch(fetchAllBlogTypes());
    }
  }, [dispatch, blogTypeId, blogTypes.length]);

  useEffect(() => {
    const blogType = blogTypes.find(type => type.blogTypeID === parseInt(blogTypeId));
    setCurrentBlogType(blogType);
  }, [blogTypes, blogTypeId]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-red-600">
        <p>Đã xảy ra lỗi: {error}</p>
      </div>
    );
  }

  return (
    <Layout>
    <div className="container mx-auto px-4 py-8">
      {/* Blog Type Header */}
      {currentBlogType && (
        <div className="mb-8 bg-blue-50 p-6 rounded-lg">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            {currentBlogType.name}
          </h1>
          {currentBlogType.description && (
            <p className="text-gray-600 mb-4">
              {currentBlogType.description}
            </p>
          )}
        </div>
      )}

      {/* Blogs Grid */}
      {blogs.length === 0 ? (
        <div className="text-center py-12">
          <Book className="mx-auto h-16 w-16 text-gray-300 mb-4" />
          <p className="text-gray-500">Chưa có bài viết nào trong chuyên mục này</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((blog) => (
            <div 
              key={blog.blogID} 
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              {/* Blog Image (if available) */}
              {blog.imageUrl && (
                <img 
                  src={blog.imageUrl} 
                  alt={blog.title} 
                  className="w-full h-48 object-cover"
                />
              )}

              <div className="p-6">
                {/* Blog Title */}
                <h2 className="text-xl font-semibold text-gray-800 mb-3">
                  {blog.title}
                </h2>

                {/* Blog Metadata */}
                <div className="flex items-center text-sm text-gray-500 mb-4 space-x-4">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>
                      {new Date(blog.publication).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </div>

                {/* Blog Excerpt - Now using stripHtmlAndTruncate */}
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {stripHtmlAndTruncate(blog.excerpt || blog.content, 150)}
                </p>

                {/* Read More Link */}
                <Link 
                  to={`/career/blog/details/${blog.blogID}`} 
                  className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
                >
                  Đọc thêm
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination (optional) */}
      {blogs.length > 0 && (
        <div className="flex justify-center mt-8">
          <nav aria-label="Page navigation">
            {/* Add pagination component here */}
            <p className="text-gray-500">
              Hiển thị {blogs.length} trên tổng số bài viết
            </p>
          </nav>
        </div>
      )}
    </div>
    </Layout>
  );
};

export default BlogbyTypePage;