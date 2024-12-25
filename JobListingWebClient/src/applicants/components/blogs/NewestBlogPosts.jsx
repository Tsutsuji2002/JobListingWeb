import React, { useEffect, memo } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { stripHtmlAndTruncate } from '../../../ultils/textUtils';
import { fetchNewestBlogs } from '../../../redux/slices/postSlice';

const NewestBlogPosts = memo(() => {
  const dispatch = useDispatch();
  const posts = useSelector((state) => state.posts.posts || []);
  const loading = useSelector((state) => state.posts.status === 'loading');
  const error = useSelector((state) => state.posts.error);

  useEffect(() => {
    // Only fetch if posts are empty
    if (posts.length === 0) {
      dispatch(fetchNewestBlogs(8));
    }
  }, [dispatch, posts.length]);

  if (loading) {
    return (
      <div className="mt-12 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-12 text-center text-red-600">
        <p>An error occurred: {error}</p>
      </div>
    );
  }

  // Only render if there are posts
  if (posts.length === 0) {
    return null;
  }

  return (
    <div className="mb-16 container mx-auto px-4">
      <h2 className="text-2xl font-bold mb-6">Các bài viết mới nhất</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((blog) => (
          <div
            key={blog.blogID}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
          >
            {blog.imageUrl && (
              <img
                src={blog.imageUrl}
                alt={blog.title}
                className="w-full h-48 object-cover"
              />
            )}

            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                {blog.title}
              </h3>

              <p className="text-gray-600 mb-4 line-clamp-3">
                {stripHtmlAndTruncate(blog.excerpt || blog.content, 150)}
              </p>

              <Link
                to={`/career/blog/details/${blog.blogID}`}
                className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
              >
                Đọc thêm
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

export default NewestBlogPosts;