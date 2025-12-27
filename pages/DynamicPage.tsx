import React, { useMemo } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import DOMPurify from 'dompurify';

const DynamicPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const { pages, loading } = useStore();

    const page = useMemo(() => {
        if (!slug || !pages.length) return null;
        return pages.find(p => p.slug === slug);
    }, [slug, pages]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
        </div>
    );

    // Determine if we should redirect
    // We only redirect if we are NOT loading and we searched but found nothing.
    // OR if we found it but it's not published (and maybe we want to allow admins to see it? Logic for now says publish read only).
    // The issue was: loading is false, but pages might be empty initially before fetch completes?
    // StoreContext 'loading' should cover the fetch duration.

    if (!page || !page.isPublished) {
        return <Navigate to="/" />;
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="container mx-auto px-4">
                <div className="bg-white rounded-[2rem] shadow-sm p-8 md:p-12 mb-8">
                    <h1 className="text-3xl md:text-5xl font-black text-gray-900 mb-8 tracking-tight">{page.title}</h1>
                    <div
                        className="prose prose-lg max-w-none prose-emerald"
                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(page.content) }}
                    />
                </div>
            </div>
        </div>
    );
};

export default DynamicPage;
