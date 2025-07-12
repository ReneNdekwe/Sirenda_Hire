import React, { useEffect, useState } from 'react';
import { useRoute, useParams } from 'wouter';
import { Blog } from '@shared/schema';
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { DynamicMeta } from "@/components/seo/DynamicMeta";

const BlogDetail = () => {
  const params = useParams<{ slug: string }>();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const response = await fetch(`/api/blogs/${params.slug}`);
        if (!response.ok) {
          throw new Error('Blog not found');
        }
        const data = await response.json();
        setBlog(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [params.slug]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow">
          <div className="container mx-auto px-4 py-12">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-4/6"></div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow">
          <div className="container mx-auto px-4 py-12">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
              <p className="text-gray-600">{error || 'Blog not found'}</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <DynamicMeta
        title={blog.metaTitle || blog.title}
        description={blog.metaDescription || blog.excerpt || `Read about ${blog.title} on Sirenda's blog.`}
        image={blog.featuredImage || undefined}
        type="article"
        url={`https://sirenda.rw/blog/${blog.slug}`}
      />
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          "headline": blog.title,
          "description": blog.metaDescription || blog.excerpt,
          "image": blog.featuredImage,
          "author": {
            "@type": "Organization",
            "name": "Sirenda"
          },
          "publisher": {
            "@type": "Organization",
            "name": "Sirenda",
            "logo": {
              "@type": "ImageObject",
              "url": "https://vehicles.blob.core.windows.net/static-assets/Logo.png"
            }
          },
          "datePublished": blog.publishedAt || blog.createdAt,
          "dateModified": blog.updatedAt,
          "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": `https://sirenda.rw/blog/${blog.slug}`
          }
        })}
      </script>
      <Header />
      <main className="flex-grow">
        <article className="container mx-auto px-4 py-12">
          {blog.featuredImage && (
            <div className="relative w-full h-[400px] mb-8 rounded-xl overflow-hidden">
              <img
                src={blog.featuredImage}
                alt={blog.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="max-w-3xl mx-auto">
            <header className="mb-8">
              <div className="flex items-center gap-4 mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  blog.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {blog.status}
                </span>
                <time className="text-gray-500">
                  {new Date(blog.publishedAt || blog.createdAt || new Date()).toLocaleDateString()}
                </time>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">{blog.title}</h1>
              {Array.isArray(blog.tags) && blog.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {blog.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </header>

            <div className="prose prose-lg max-w-none">
              <div 
                className="whitespace-pre-line leading-relaxed space-y-4"
                dangerouslySetInnerHTML={{ 
                  __html: blog.content.split('\n').map(paragraph => 
                    paragraph.trim() ? `<p>${paragraph}</p>` : '<br/>'
                  ).join('')
                }} 
              />
            </div>

            {blog.metaDescription && (
              <div className="mt-8 p-4 bg-gray-100 rounded-lg">
                <p className="text-gray-600 italic">{blog.metaDescription}</p>
              </div>
            )}
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
};

export default BlogDetail; 