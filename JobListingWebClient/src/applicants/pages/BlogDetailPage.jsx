import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBlogById } from '../../redux/slices/postSlice';
import { Book, Calendar, User, ChevronLeft, Tag } from 'lucide-react';
import Layout from '../components/layout/Layout';
import NewestBlogPosts from '../components/blogs/NewestBlogPosts';

const BlogDetailPage = () => {
  const { blogId } = useParams();
  const dispatch = useDispatch();

  const currentBlog = useSelector((state) => state.posts.currentBlog);
  const loading = useSelector((state) => state.posts.status === 'loading');
  const error = useSelector((state) => state.posts.error);

  useEffect(() => {
    dispatch(fetchBlogById(blogId));
  }, [dispatch, blogId]);

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

  if (!currentBlog) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <Book className="mx-auto h-16 w-16 text-gray-300 mb-4" />
        <p className="text-gray-500">Không tìm thấy bài viết</p>
      </div>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <Link
          to="/blogs"
          className="flex items-center text-blue-600 hover:text-blue-800 mb-6"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Quay lại danh sách bài viết
        </Link>

        <article className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            {currentBlog.title}
          </h1>

          <div className="flex items-center text-sm text-gray-500 mb-6 space-x-4">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              <span>
                {new Date(currentBlog.publication).toLocaleDateString('vi-VN')}
              </span>
            </div>
            <div className="flex items-center">
              <Book className="h-4 w-4 mr-2" />
              <span>{currentBlog.views || 0} lượt xem</span>
            </div>
          </div>

          {currentBlog.imageUrl && (
            <img
              src={currentBlog.imageUrl}
              alt={currentBlog.title}
              className="w-full h-96 object-cover rounded-lg mb-6"
            />
          )}

          <div
            className="prose prose-lg prose-blue max-w-none text-gray-800"
            dangerouslySetInnerHTML={{ __html: currentBlog.content }}
          />

          {currentBlog.blogTags && currentBlog.blogTags.length > 0 && (
            <div className="mt-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Từ khóa
              </h3>
              <div className="flex flex-wrap gap-2">
                {currentBlog.blogTags.map((tag) => (
                  <span
                    key={tag.id}
                    className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                  >
                    <Tag className="h-4 w-4 mr-2" />
                    {tag.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {currentBlog.comments && currentBlog.comments.length > 0 && (
            <div className="mt-12">
              <h3 className="text-2xl font-semibold text-gray-800 mb-6">
                Bình luận ({currentBlog.comments.length})
              </h3>
              {currentBlog.comments.map((comment) => (
                <div
                  key={comment.id}
                  className="bg-gray-100 rounded-lg p-4 mb-4"
                >
                  <p className="text-gray-700">{comment.content}</p>
                </div>
              ))}
            </div>
          )}
        </article>
      </div>
      <NewestBlogPosts />
    </Layout>
  );
};

export default BlogDetailPage;