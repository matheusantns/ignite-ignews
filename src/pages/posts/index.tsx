import { GetStaticProps } from 'next';
import Head from 'next/head';
import Prismic from '@prismicio/client';
import { RichText } from 'prismic-dom';
import Link from 'next/link';

import { getPrismicClient } from '../../services/prismic';

import styles from './styles.module.scss';
import { useSession } from 'next-auth/client';

type Post = {
    slug: string;
    title: string;
    excerpt: string;
    updatedAt: string;
}

interface PostsProps {
    posts: Post[]; 
}

export default function Posts({ posts }: PostsProps) {
    const [session] = useSession();

    return (
        <>
        <Head>
            <title>Posts | Ignews</title>
        </Head>
            <main className={styles.container}>
                <div className={styles.posts}>
                    { session?.activeSubscription ? posts.map(post => (
                        <Link href={`/posts/${post.slug}`}>
                            <a key={post.slug}>
                                <time>{post.updatedAt}</time>
                                <strong>{post.title}</strong>
                                <p>{post.excerpt}</p>
                            </a>
                        </Link>)) : 
                        posts.map(post => (
                            <Link href={`/posts/preview/${post.slug}`}>
                                <a key={post.slug}>
                                    <time>{post.updatedAt}</time>
                                    <strong>{post.title}</strong>
                                    <p>{post.excerpt}</p>
                                </a>
                            </Link>))
                        }
                </div>
            </main>
        </>
    );
}

export const getStaticProps: GetStaticProps = async () => {
    const prismic = getPrismicClient()

    const response = await prismic.query([
        Prismic.Predicates.at('document.type', 'post')
    ], {
        fetch: ['publication.title', 'publication.content'],
        pageSize: 15,
    })

    const posts = response.results.map(post => {
        return {
            slug: post.uid,
            title: RichText.asText(post.data.title),
            excerpt: post.data.content.find(content => content.type === 'paragraph')?.text ?? '',
            updatedAt: new Date(post.last_publication_date).toLocaleDateString('pt-br', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
            }) 
        }
    })

    return {
        props: {
            posts
        }
    }
}